import { createWalletClient, http, type WalletClient, type Chain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet, optimism } from 'viem/chains';

const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID;

const CHAIN_CONFIG: Record<number, { chain: Chain; rpc: string }> = {
  1: {
    chain: mainnet,
    rpc: `https://rpc.walletconnect.com/v1/?chainId=eip155:1&projectId=${projectId}`,
  },
  10: {
    chain: optimism,
    rpc: `https://rpc.walletconnect.com/v1/?chainId=eip155:10&projectId=${projectId}`,
  },
};

export function createAaveWalletClient(
  privateKeyHex: `0x${string}`,
  chainId: number = 10,
  rpcOverride?: string | null,
): WalletClient {
  const config = CHAIN_CONFIG[chainId];
  if (!config) throw new Error(`Unsupported chain: ${chainId}`);

  const account = privateKeyToAccount(privateKeyHex);

  return createWalletClient({
    account,
    chain: config.chain,
    transport: http(rpcOverride ?? config.rpc),
  });
}
