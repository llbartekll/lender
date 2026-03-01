import { useQuery } from '@tanstack/react-query';
import { getClient } from '../../lib/viem/client';
import { fetchReservesData } from '../../lib/contracts/reads';
import { transformReserveData } from '../../lib/utils/transform';
import { useSettingsStore } from '../../store/settings-store';
import { USE_MOCKS, mockReserves } from '../../lib/mocks/reserves';
import { type ReserveData, type BaseCurrencyInfo } from '../../types/market';

interface ReservesResult {
  reserves: ReserveData[];
  baseCurrencyInfo: BaseCurrencyInfo;
}

export function useReserves() {
  const chainId = useSettingsStore((s) => s.chainId);
  const rpcUrl = useSettingsStore((s) => s.rpcUrl);

  return useQuery<ReservesResult>({
    queryKey: ['reserves', chainId],
    queryFn: async () => {
      console.log('[useReserves] queryFn called, USE_MOCKS:', USE_MOCKS, 'chainId:', chainId);
      if (USE_MOCKS) {
        return {
          reserves: mockReserves,
          baseCurrencyInfo: {
            marketReferenceCurrencyUnit: 10n ** 8n,
            marketReferenceCurrencyPriceInUsd: 1,
            networkBaseTokenPriceInUsd: 3250,
            networkBaseTokenPriceDecimals: 8,
          },
        };
      }

      try {
        const client = getClient(chainId, rpcUrl);
        const raw = await fetchReservesData(client, chainId);
        console.log('[useReserves] raw data received, transforming...');
        const result = transformReserveData(raw.reserves as any, raw.baseCurrencyInfo as any);
        console.log('[useReserves] transform done, got', result.reserves.length, 'reserves');
        return result;
      } catch (error) {
        console.error('[useReserves] failed:', error);
        throw error;
      }
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
}
