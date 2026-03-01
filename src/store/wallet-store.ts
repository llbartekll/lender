import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Address, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as SecureStore from 'expo-secure-store';

const SECURE_KEY = 'wallet-private-key';

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
  setPrivateKeyWallet: (privateKey: string) => Promise<void>;
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

      setPrivateKeyWallet: async (privateKey: string) => {
        const hex = privateKey.startsWith('0x')
          ? (privateKey as `0x${string}`)
          : (`0x${privateKey}` as `0x${string}`);
        const account = privateKeyToAccount(hex);
        await SecureStore.setItemAsync(SECURE_KEY, hex);
        set({
          address: account.address,
          watchAddress: null,
          connectionMethod: 'privateKey',
        });
      },

      disconnect: () => {
        SecureStore.deleteItemAsync(SECURE_KEY).catch(() => {});
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
    },
  ),
);

/** Read private key from SecureStore (for signing in Phase 2) */
export async function getPrivateKey(): Promise<string | null> {
  return SecureStore.getItemAsync(SECURE_KEY);
}

/** Get the active address to use for queries (connected or watch) */
export function useActiveAddress(): Address | null {
  return useWalletStore((s) => s.address ?? s.watchAddress);
}

/** Whether any address is available (connected or watching) */
export function useIsConnected(): boolean {
  return useWalletStore((s) => s.address !== null || s.watchAddress !== null);
}
