import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Address, isAddress } from 'viem';

interface WalletState {
  /** Connected wallet address (via WalletConnect) */
  address: Address | null;
  /** Manually entered watch-only address */
  watchAddress: Address | null;
  /** Whether the address was set via wallet connect */
  isWalletConnected: boolean;

  setAddress: (address: Address) => void;
  setWatchAddress: (address: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      watchAddress: null,
      isWalletConnected: false,

      setAddress: (address) =>
        set({ address, isWalletConnected: true }),

      setWatchAddress: (address) => {
        if (isAddress(address)) {
          set({
            watchAddress: address as Address,
            address: null,
            isWalletConnected: false,
          });
        }
      },

      disconnect: () =>
        set({
          address: null,
          watchAddress: null,
          isWalletConnected: false,
        }),
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        address: state.address,
        watchAddress: state.watchAddress,
        isWalletConnected: state.isWalletConnected,
      }),
    },
  ),
);

/** Get the active address to use for queries (connected or watch) */
export function useActiveAddress(): Address | null {
  return useWalletStore((s) => s.address ?? s.watchAddress);
}

/** Whether any address is available (connected or watching) */
export function useIsConnected(): boolean {
  return useWalletStore((s) => s.address !== null || s.watchAddress !== null);
}
