import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 10, name: 'Optimism' },
] as const;

interface SettingsState {
  refreshInterval: number; // in seconds
  rpcUrl: string | null; // custom RPC override
  chainId: number;
  setRefreshInterval: (interval: number) => void;
  setRpcUrl: (url: string | null) => void;
  setChainId: (chainId: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      refreshInterval: 30,
      rpcUrl: null,
      chainId: 10,

      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
      setRpcUrl: (url) => set({ rpcUrl: url }),
      setChainId: (chainId) => set({ chainId }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        refreshInterval: state.refreshInterval,
        rpcUrl: state.rpcUrl,
        chainId: state.chainId,
      }),
    },
  ),
);
