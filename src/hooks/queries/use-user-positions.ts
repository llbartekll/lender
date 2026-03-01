import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';
import { getClient } from '../../lib/viem/client';
import { fetchUserReservesData } from '../../lib/contracts/reads';
import { transformUserPositions } from '../../lib/utils/transform';
import { useActiveAddress } from '../../store/wallet-store';
import { useSettingsStore } from '../../store/settings-store';
import { useReserves } from './use-reserves';
import { USE_MOCKS } from '../../lib/mocks/reserves';
import { mockPositions } from '../../lib/mocks/positions';
import { type UserPosition } from '../../types/position';

export function useUserPositions() {
  const address = useActiveAddress();
  const { data: reservesData } = useReserves();
  const chainId = useSettingsStore((s) => s.chainId);
  const rpcUrl = useSettingsStore((s) => s.rpcUrl);

  console.log('[useUserPositions] address:', address, 'chainId:', chainId, 'hasReserves:', !!reservesData, 'enabled:', !!address && !!reservesData);

  return useQuery<UserPosition[]>({
    queryKey: ['userPositions', address, chainId],
    queryFn: async () => {
      console.log('[useUserPositions] queryFn called');
      if (USE_MOCKS) {
        console.log('[useUserPositions] using mocks');
        return mockPositions;
      }

      if (!address || !reservesData) {
        console.log('[useUserPositions] no address or reserves, returning []');
        return [];
      }

      const client = getClient(chainId, rpcUrl);
      const raw = await fetchUserReservesData(client, address as Address, chainId);
      console.log('[useUserPositions] raw userReserves count:', raw.userReserves.length);
      const positions = transformUserPositions(raw.userReserves as any, reservesData.reserves);
      console.log('[useUserPositions] transformed positions:', positions.length);
      return positions;
    },
    enabled: !!address && !!reservesData,
    refetchInterval: 30 * 1000,
    staleTime: 15 * 1000,
  });
}

export function useSupplyPositions() {
  const { data: positions, ...rest } = useUserPositions();
  const supplyPositions = positions?.filter(
    (p) => p.supplyBalance > 0n,
  );
  return { data: supplyPositions, ...rest };
}

export function useBorrowPositions() {
  const { data: positions, ...rest } = useUserPositions();
  const borrowPositions = positions?.filter(
    (p) => p.variableBorrowBalance > 0n,
  );
  return { data: borrowPositions, ...rest };
}
