import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Address, isAddress } from 'viem';

type ConnectionMethod = 'none' | 'watch' | 'privateKey';

interface WalletState {
  /** Connected wallet address (via WalletConnect or private key) */
  address: Address | null;
  /** Manually entered watch-only address */
  watchAddress: Address | null;
  /** How the wallet is connected */
  connectionMethod: ConnectionMethod;

  setAddress: (address: Address) => void;
  setWatchAddress: (address: string) => void;
  setPrivateKeyWallet: (address: Address) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      address: null,
      watchAddress: null,
      connectionMethod: 'none',

      setAddress: (address) =>
        set({ address, connectionMethod: 'none' }),

      setWatchAddress: (address) => {
        if (isAddress(address)) {
          set({
            watchAddress: address as Address,
            address: null,
            connectionMethod: 'watch',
          });
        }
      },

      setPrivateKeyWallet: (address: Address) => {
        set({
          address,
          watchAddress: null,
          connectionMethod: 'privateKey',
        });
      },

      disconnect: () => {
        set({
          address: null,
          watchAddress: null,
          connectionMethod: 'none',
        });
      },
    }),
    {
      name: 'wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        address: state.address,
        watchAddress: state.watchAddress,
        connectionMethod: state.connectionMethod,
      }),
      // Migrate old persisted state that had isWalletConnected
      migrate: (persisted: any) => {
        if (persisted && 'isWalletConnected' in persisted) {
          const { isWalletConnected, ...rest } = persisted;
          return { ...rest, connectionMethod: isWalletConnected ? 'none' : (rest.watchAddress ? 'watch' : 'none') };
        }
        return persisted;
      },
      version: 1,
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
