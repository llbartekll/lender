import { useState, useCallback } from 'react';
import { type Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { getClient } from '../lib/viem/client';
import { createAaveWalletClient } from '../lib/viem/wallet-client';
import { getPrivateKey } from '../lib/utils/secure-wallet';
import {
  checkAllowance,
  approveToken,
  supplyToPool,
  repayToPool,
  borrowFromPool,
  withdrawFromPool,
  REPAY_MAX_AMOUNT,
  WITHDRAW_MAX_AMOUNT,
} from '../lib/contracts/writes';
import { getAddresses } from '../lib/contracts/addresses';
import { useSettingsStore } from '../store/settings-store';

export type TxStep =
  | 'idle'
  | 'checking'
  | 'approving'
  | 'waitingApproval'
  | 'sending'
  | 'waitingConfirmation'
  | 'success'
  | 'error';

export type TxType = 'supply' | 'repay' | 'borrow' | 'withdraw';

interface UseTransactionResult {
  step: TxStep;
  txHash: string | null;
  error: string | null;
  execute: (params: TxParams) => Promise<void>;
  reset: () => void;
}

interface TxParams {
  type: TxType;
  asset: Address;
  amount: bigint;
  isMax?: boolean;
}

export function useTransaction(): UseTransactionResult {
  const [step, setStep] = useState<TxStep>('idle');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const chainId = useSettingsStore((s) => s.chainId);
  const rpcUrl = useSettingsStore((s) => s.rpcUrl);

  const reset = useCallback(() => {
    setStep('idle');
    setTxHash(null);
    setError(null);
  }, []);

  const execute = useCallback(async (params: TxParams) => {
    const { type, asset, amount, isMax } = params;

    try {
      // Get private key
      const pk = await getPrivateKey();
      if (!pk) {
        setError('No private key found. Please import a wallet.');
        setStep('error');
        return;
      }

      const publicClient = getClient(chainId, rpcUrl);
      const walletClient = createAaveWalletClient(
        pk as `0x${string}`,
        chainId,
        rpcUrl,
      );

      const account = walletClient.account;
      if (!account) {
        setError('Failed to create wallet account.');
        setStep('error');
        return;
      }

      const userAddress = account.address;
      const addresses = getAddresses(chainId);
      const spender = addresses.pool;

      // Borrow and withdraw don't need ERC20 approval
      if (type !== 'borrow' && type !== 'withdraw') {
        // Determine the amount to approve
        const approveAmount = type === 'repay' && isMax
          ? REPAY_MAX_AMOUNT
          : amount;

        // Check allowance
        setStep('checking');
        const currentAllowance = await checkAllowance(
          publicClient,
          asset,
          userAddress,
          spender,
        );

        // Approve if needed
        if (currentAllowance < approveAmount) {
          setStep('approving');
          const approveTxHash = await approveToken(
            walletClient,
            asset,
            spender,
            approveAmount,
          );

          setStep('waitingApproval');
          await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
        }
      }

      // Execute transaction
      setStep('sending');
      const txAmount = type === 'repay' && isMax
        ? REPAY_MAX_AMOUNT
        : type === 'withdraw' && isMax
          ? WITHDRAW_MAX_AMOUNT
          : amount;

      let hash: `0x${string}`;
      if (type === 'supply') {
        hash = await supplyToPool(walletClient, asset, txAmount, userAddress, chainId);
      } else if (type === 'borrow') {
        hash = await borrowFromPool(walletClient, asset, amount, userAddress, chainId);
      } else if (type === 'withdraw') {
        hash = await withdrawFromPool(walletClient, asset, txAmount, userAddress, chainId);
      } else {
        hash = await repayToPool(walletClient, asset, txAmount, userAddress, chainId);
      }

      setStep('waitingConfirmation');
      await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);
      setStep('success');

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['userPositions'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
      queryClient.invalidateQueries({ queryKey: ['reserves'] });
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      setStep('error');
    }
  }, [chainId, rpcUrl, queryClient]);

  return { step, txHash, error, execute, reset };
}
