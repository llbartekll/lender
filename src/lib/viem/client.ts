import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const DEFAULT_RPC = `https://rpc.walletconnect.com/v1/?chainId=eip155:1&projectId=${process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID}`;

export function createClient(rpcUrl?: string) {
  return createPublicClient({
    chain: mainnet,
    transport: http(rpcUrl ?? DEFAULT_RPC),
    batch: {
      multicall: true,
    },
  });
}

export const publicClient = createClient();
