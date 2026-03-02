import { type Address, type PublicClient, type WalletClient, type Account, type Chain, maxUint256 } from 'viem';
import { erc20Abi } from './abis/erc20';
import { poolAbi } from './abis/pool';
import { getAddresses } from './addresses';

export const REPAY_MAX_AMOUNT = maxUint256;
export const WITHDRAW_MAX_AMOUNT = maxUint256;

export async function checkAllowance(
  client: PublicClient,
  token: Address,
  owner: Address,
  spender: Address,
): Promise<bigint> {
  return client.readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, spender],
  });
}

export async function getTokenBalance(
  client: PublicClient,
  token: Address,
  owner: Address,
): Promise<bigint> {
  return client.readContract({
    address: token,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [owner],
  });
}

export async function approveToken(
  walletClient: WalletClient,
  token: Address,
  spender: Address,
  amount: bigint,
): Promise<`0x${string}`> {
  const { account, chain } = walletClient;
  return walletClient.writeContract({
    address: token,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, amount],
    account: account as Account,
    chain: chain as Chain,
  });
}

export async function supplyToPool(
  walletClient: WalletClient,
  asset: Address,
  amount: bigint,
  onBehalfOf: Address,
  chainId: number = 10,
): Promise<`0x${string}`> {
  const addresses = getAddresses(chainId);
  const { account, chain } = walletClient;
  return walletClient.writeContract({
    address: addresses.pool,
    abi: poolAbi,
    functionName: 'supply',
    args: [asset, amount, onBehalfOf, 0],
    account: account as Account,
    chain: chain as Chain,
  });
}

export async function borrowFromPool(
  walletClient: WalletClient,
  asset: Address,
  amount: bigint,
  onBehalfOf: Address,
  chainId: number = 10,
): Promise<`0x${string}`> {
  const addresses = getAddresses(chainId);
  const { account, chain } = walletClient;
  return walletClient.writeContract({
    address: addresses.pool,
    abi: poolAbi,
    functionName: 'borrow',
    args: [asset, amount, 2n, 0, onBehalfOf],
    account: account as Account,
    chain: chain as Chain,
  });
}

export async function withdrawFromPool(
  walletClient: WalletClient,
  asset: Address,
  amount: bigint,
  to: Address,
  chainId: number = 10,
): Promise<`0x${string}`> {
  const addresses = getAddresses(chainId);
  const { account, chain } = walletClient;
  return walletClient.writeContract({
    address: addresses.pool,
    abi: poolAbi,
    functionName: 'withdraw',
    args: [asset, amount, to],
    account: account as Account,
    chain: chain as Chain,
  });
}

export async function repayToPool(
  walletClient: WalletClient,
  asset: Address,
  amount: bigint,
  onBehalfOf: Address,
  chainId: number = 10,
): Promise<`0x${string}`> {
  const addresses = getAddresses(chainId);
  const { account, chain } = walletClient;
  return walletClient.writeContract({
    address: addresses.pool,
    abi: poolAbi,
    functionName: 'repay',
    args: [asset, amount, 2n, onBehalfOf],
    account: account as Account,
    chain: chain as Chain,
  });
}
