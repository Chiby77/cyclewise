import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { RootNavigator } from '@/navigation/RootNavigator';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { HealthProvider } from '@/context/HealthContext';
import { AppLockOverlay } from '@/components/AppLockOverlay';
import { setupNotifications, scheduleWaterReminder } from '@/services/notifications';
import { initSentry, Sentry } from '@/lib/sentry';
import './global.css';

// Keep splash screen visible while app initializes resources
SplashScreen.preventAutoHideAsync().catch(() => {});

// Initialize Sentry error telemetry
initSentry();

function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Setup local push notification channels & daily hydration trigger
        setupNotifications();
        await scheduleWaterReminder();

        // Brief delay to ensure database & layout mount cleanly
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (error) {
        console.warn('[App] Error during initialization:', error);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepareApp();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <HealthProvider>
            <StatusBar style="auto" />
            <AppLockOverlay>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </AppLockOverlay>
          </HealthProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(App);
