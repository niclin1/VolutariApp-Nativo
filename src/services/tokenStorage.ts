import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'voluntariapp_token';

// Expo SecureStore doesn't work on web, fallback to memory
let memoryToken: string | null = null;

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    memoryToken = token;
    return;
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return memoryToken;
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    memoryToken = null;
    return;
  }
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
