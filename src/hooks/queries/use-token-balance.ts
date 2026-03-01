import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';
import { getClient } from '../../lib/viem/client';
import { getTokenBalance } from '../../lib/contracts/writes';
import { useActiveAddress } from '../../store/wallet-store';
import { useSettingsStore } from '../../store/settings-store';

export function useTokenBalance(tokenAddress: Address | undefined) {
  const address = useActiveAddress();
  const chainId = useSettingsStore((s) => s.chainId);
  const rpcUrl = useSettingsStore((s) => s.rpcUrl);

  return useQuery<bigint>({
    queryKey: ['tokenBalance', tokenAddress, address, chainId],
    queryFn: async () => {
      if (!address || !tokenAddress) return 0n;
      const client = getClient(chainId, rpcUrl);
      return getTokenBalance(client, tokenAddress, address as Address);
    },
    enabled: !!address && !!tokenAddress,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}
