import { useCallback, useState } from 'react';
import { maxUint256, type Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';
import { getClient } from '../lib/viem/client';
import { createAaveWalletClient } from '../lib/viem/wallet-client';
import { getPrivateKey } from '../lib/utils/secure-wallet';
import { getLeverageManagerAddress } from '../lib/contracts/addresses';
import {
  approveCreditDelegation,
  approveToken,
  checkAllowance,
  checkBorrowAllowance,
  deleverage,
  leverageUp,
} from '../lib/contracts/writes';
import { useSettingsStore } from '../store/settings-store';

export type LeverageTxType = 'leverageUp' | 'deleverage';

export type LeverageTxStep =
  | 'idle'
  | 'checkingDelegation'
  | 'approvingDelegation'
  | 'waitingDelegation'
  | 'checkingATokenAllowance'
  | 'approvingAToken'
  | 'waitingATokenApproval'
  | 'sending'
  | 'waitingConfirmation'
  | 'success'
  | 'error';

interface LeverageBaseParams {
  collateralAsset: Address;
  debtAsset: Address;
  flashLoanAmount: bigint;
  swapPoolFee: number;
  slippageBps: number;
  swapPath?: `0x${string}`;
}

interface LeverageUpTxParams extends LeverageBaseParams {
  type: 'leverageUp';
  variableDebtToken: Address;
}

interface DeleverageTxParams extends LeverageBaseParams {
  type: 'deleverage';
  aTokenAddress: Address;
  collateralToWithdraw: bigint;
}

export type LeverageTxParams = LeverageUpTxParams | DeleverageTxParams;

interface UseLeverageTransactionResult {
  step: LeverageTxStep;
  txHash: string | null;
  error: string | null;
  execute: (params: LeverageTxParams) => Promise<void>;
  reset: () => void;
}

export function useLeverageTransaction(): UseLeverageTransactionResult {
  const [step, setStep] = useState<LeverageTxStep>('idle');
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

  const execute = useCallback(async (params: LeverageTxParams) => {
    try {
      const pk = await getPrivateKey();
      if (!pk) {
        setError('No private key found. Please import a wallet.');
        setStep('error');
        return;
      }

      const publicClient = getClient(chainId, rpcUrl);
      const walletClient = createAaveWalletClient(pk as `0x${string}`, chainId, rpcUrl);
      const account = walletClient.account;

      if (!account) {
        setError('Failed to create wallet account.');
        setStep('error');
        return;
      }

      const userAddress = account.address;
      const managerAddress = getLeverageManagerAddress(chainId);

      if (params.type === 'leverageUp') {
        setStep('checkingDelegation');
        const borrowAllowance = await checkBorrowAllowance(
          publicClient,
          params.variableDebtToken,
          userAddress,
          managerAddress,
        );

        if (borrowAllowance < params.flashLoanAmount) {
          setStep('approvingDelegation');
          const delegationHash = await approveCreditDelegation(
            walletClient,
            params.variableDebtToken,
            managerAddress,
            maxUint256,
          );
          setStep('waitingDelegation');
          await publicClient.waitForTransactionReceipt({ hash: delegationHash });
        }
      } else {
        setStep('checkingATokenAllowance');
        const allowance = await checkAllowance(
          publicClient,
          params.aTokenAddress,
          userAddress,
          managerAddress,
        );

        if (allowance < params.collateralToWithdraw) {
          setStep('approvingAToken');
          const approveHash = await approveToken(
            walletClient,
            params.aTokenAddress,
            managerAddress,
            maxUint256,
          );
          setStep('waitingATokenApproval');
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
      }

      setStep('sending');
      const hash = params.type === 'leverageUp'
        ? await leverageUp(walletClient, params, chainId)
        : await deleverage(walletClient, params, chainId);

      setStep('waitingConfirmation');
      await publicClient.waitForTransactionReceipt({ hash });

      setTxHash(hash);
      setStep('success');

      queryClient.invalidateQueries({ queryKey: ['userPositions'] });
      queryClient.invalidateQueries({ queryKey: ['accountSummary'] });
      queryClient.invalidateQueries({ queryKey: ['reserves'] });
      queryClient.invalidateQueries({ queryKey: ['tokenBalance'] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Leverage transaction failed';
      setError(message);
      setStep('error');
    }
  }, [chainId, queryClient, rpcUrl]);

  return { step, txHash, error, execute, reset };
}
