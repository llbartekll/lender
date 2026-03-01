import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'wallet-private-key';

// TODO: Replace with expo-secure-store when using a dev build
// import * as SecureStore from 'expo-secure-store';

export async function storePrivateKey(privateKey: string): Promise<void> {
  const hex = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  await AsyncStorage.setItem(STORAGE_KEY, hex);
}

export async function getPrivateKey(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEY);
}

export async function deletePrivateKey(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
