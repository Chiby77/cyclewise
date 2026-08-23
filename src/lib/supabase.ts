import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import { Linking } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder-cyclewise.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured =
  Boolean(process.env.EXPO_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('placeholder');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Initiates Google OAuth sign-in flow via Expo AuthSession and Supabase.
 */
export async function performGoogleOAuth() {
  const redirectUri = AuthSession.makeRedirectUri({
    preferLocalhost: true,
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    throw error || new Error('Failed to generate Google OAuth URL');
  }

  // Open auth URL in device browser
  const canOpen = await Linking.canOpenURL(data.url);
  if (canOpen) {
    await Linking.openURL(data.url);
  } else {
    throw new Error('Unable to open authentication URL on this device.');
  }

  return null;
}
