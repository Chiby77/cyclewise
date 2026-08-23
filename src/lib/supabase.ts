import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

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

function getUrlParam(urlStr: string, param: string): string | null {
  try {
    const regex = new RegExp(`[#?&]${param}=([^&]*)`);
    const match = urlStr.match(regex);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export async function handleOAuthCallbackUrl(url: string) {
  const accessToken = getUrlParam(url, 'access_token');
  const refreshToken = getUrlParam(url, 'refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      console.warn('[Supabase] Error setting session from callback URL:', error.message);
    }
  }
}

// Global deep link listener for OAuth redirects
Linking.getInitialURL().then((url) => {
  if (url) handleOAuthCallbackUrl(url).catch(console.warn);
});

Linking.addEventListener('url', ({ url }) => {
  if (url) handleOAuthCallbackUrl(url).catch(console.warn);
});

/**
 * Initiates Google OAuth sign-in flow via Expo WebBrowser and Supabase.
 */
export async function performGoogleOAuth() {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'cyclewise',
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

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

  if (result.type === 'success' && result.url) {
    await handleOAuthCallbackUrl(result.url);
  }
}
