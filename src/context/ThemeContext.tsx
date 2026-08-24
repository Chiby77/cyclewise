import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeColors } from '@/theme/colors';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  isDark: boolean;
  themeColors: ReturnType<typeof getThemeColors>;
};

const THEME_STORAGE_KEY = '@cyclewise_theme_preference';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useRNColorScheme();
  const { setColorScheme } = useNativeWindColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemePreferenceState(saved);
        setColorScheme(saved);
      }
    });
  }, [setColorScheme]);

  const setThemePreference = async (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    setColorScheme(pref);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, pref);
  };

  const isDark = useMemo(() => {
    if (themePreference === 'dark') return true;
    if (themePreference === 'light') return false;
    return systemScheme === 'dark';
  }, [themePreference, systemScheme]);

  const themeColors = useMemo(() => getThemeColors(isDark), [isDark]);

  const value = useMemo(
    () => ({
      themePreference,
      setThemePreference,
      isDark,
      themeColors,
    }),
    [themePreference, isDark, themeColors]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
