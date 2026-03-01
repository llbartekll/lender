import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';
import { getClient } from '../../lib/viem/client';
import { fetchUserAccountData } from '../../lib/contracts/reads';
import { transformAccountSummary } from '../../lib/utils/transform';
import { useActiveAddress } from '../../store/wallet-store';
import { useSettingsStore } from '../../store/settings-store';
import { useReserves } from './use-reserves';
import { USE_MOCKS } from '../../lib/mocks/reserves';
import { mockAccountSummary } from '../../lib/mocks/positions';
import { type AccountSummary } from '../../types/position';

export function useAccountSummary() {
  const address = useActiveAddress();
  const { data: reservesData } = useReserves();
  const chainId = useSettingsStore((s) => s.chainId);
  const rpcUrl = useSettingsStore((s) => s.rpcUrl);

  console.log('[useAccountSummary] address:', address, 'chainId:', chainId, 'hasReserves:', !!reservesData, 'enabled:', !!address && !!reservesData);

  return useQuery<AccountSummary>({
    queryKey: ['accountSummary', address, chainId],
    queryFn: async () => {
      console.log('[useAccountSummary] queryFn called');
      if (USE_MOCKS) {
        return mockAccountSummary;
      }

      if (!address || !reservesData) {
        throw new Error('No address or reserves data');
      }

      const client = getClient(chainId, rpcUrl);
      const raw = await fetchUserAccountData(client, address as Address, chainId);
      console.log('[useAccountSummary] raw data received, baseCurrencyPriceInUsd:', reservesData.baseCurrencyInfo.marketReferenceCurrencyPriceInUsd);
      const summary = transformAccountSummary(
        raw,
        reservesData.baseCurrencyInfo.marketReferenceCurrencyPriceInUsd,
      );
      console.log('[useAccountSummary] summary:', JSON.stringify(summary));
      return summary;
    },
    enabled: !!address && !!reservesData,
    refetchInterval: 15 * 1000,
    staleTime: 10 * 1000,
  });
}
