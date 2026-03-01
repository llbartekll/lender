import { createPublicClient, http, type Chain, type PublicClient } from 'viem';
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

const clients = new Map<string, PublicClient>();

export function getClient(chainId: number = 10, rpcOverride?: string | null): PublicClient {
  const key = `${chainId}:${rpcOverride ?? 'default'}`;
  const cached = clients.get(key);
  if (cached) return cached;

  const config = CHAIN_CONFIG[chainId];
  if (!config) throw new Error(`Unsupported chain: ${chainId}`);

  const client = createPublicClient({
    chain: config.chain,
    transport: http(rpcOverride ?? config.rpc),
    batch: { multicall: true },
  });

  clients.set(key, client as PublicClient);
  return client as PublicClient;
}

/** @deprecated Use getClient(chainId) instead */
export const publicClient = getClient(1);
