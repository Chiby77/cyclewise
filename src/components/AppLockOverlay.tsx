import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Pressable, AppState, AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mascot } from '@/components/Mascot';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import { useProfile } from '@/hooks/useProfile';
import { authenticateWithBiometrics } from '@/services/biometrics';

export function AppLockOverlay({ children }: { children: React.ReactNode }) {
  const { profile } = useProfile();
  const lockEnabled = Boolean(profile?.app_lock_enabled);
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef(AppState.currentState);
  const isPrompting = useRef(false);

  const attemptUnlock = useCallback(async () => {
    if (isPrompting.current) return;
    isPrompting.current = true;

    try {
      const success = await authenticateWithBiometrics('Unlock CycleWise');
      if (success) {
        setIsLocked(false);
      }
    } finally {
      isPrompting.current = false;
    }
  }, []);

  useEffect(() => {
    if (lockEnabled) {
      setIsLocked(true);
      attemptUnlock();
    }
  }, [lockEnabled, attemptUnlock]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        lockEnabled
      ) {
        setIsLocked(true);
        attemptUnlock();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [lockEnabled, attemptUnlock]);

  if (isLocked && lockEnabled) {
    return (
      <View className="flex-1 bg-white">
        <LinearGradient
          colors={[colors.pinkSoft, colors.pinkLight, '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          className="flex-1 items-center justify-center px-6"
        >
          <SafeAreaView className="items-center justify-between w-full flex-1 py-8">
            <View className="items-center mt-12">
              <View className="w-24 h-24 rounded-full bg-white items-center justify-center shadow-md mb-4 border border-pink-light">
                <Icon name={ICONS.lock} size={44} color={colors.pinkPrimary} />
              </View>
              <Text className="text-2xl font-extrabold text-text mt-2">CycleWise Locked</Text>
              <Text className="text-sm font-semibold text-muted text-center mt-1 px-8">
                Your cycle and health records are protected with biometric security.
              </Text>
            </View>

            <View className="items-center my-6">
              <Mascot />
            </View>

            <View className="w-full mb-8">
              <Pressable
                onPress={attemptUnlock}
                className="w-full py-4 rounded-full bg-pink-primary items-center justify-center flex-row gap-2 shadow-md active:opacity-90"
              >
                <Icon name={ICONS.key} size={20} color="white" />
                <Text className="text-white text-base font-bold">Unlock with Biometrics</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return <>{children}</>;
}
