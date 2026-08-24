import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mascot } from '@/components/Mascot';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import type { AppNavigationProp } from '@/navigation/types';
import { useProfile } from '@/hooks/useProfile';
import { checkBiometricSupport, authenticateWithBiometrics } from '@/services/biometrics';

export function LockAppScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const { profile, updateProfile } = useProfile();
  const locked = Boolean(profile?.app_lock_enabled);

  const toggleLock = async () => {
    if (!locked) {

      const support = await checkBiometricSupport();
      if (!support.hasHardware || !support.isEnrolled) {
        Alert.alert(
          'Biometrics Not Available',
          'Your device does not have biometric hardware or enrollment configured. You can still protect the app with your device passcode.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Enable Anyway',
              onPress: () => updateProfile({ app_lock_enabled: true }),
            },
          ]
        );
        return;
      }

      const success = await authenticateWithBiometrics('Verify biometric identity to enable app lock');
      if (success) {
        updateProfile({ app_lock_enabled: true });
      }
    } else {

      const success = await authenticateWithBiometrics('Verify biometric identity to disable app lock');
      if (success) {
        updateProfile({ app_lock_enabled: false });
      }
    }
  };

  return (
    <View className="flex-1 bg-bg dark:bg-dark-bg">
      <SafeAreaView edges={['top']} className="bg-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border">
        <View className="flex-row items-center px-4 pb-3 pt-2">
          <Pressable onPress={() => navigation.goBack()} className="p-1 mr-4 active:opacity-70">
            <Icon name={ICONS.back} size={22} color={colors.pinkPrimary} />
          </Pressable>
          <Text className="text-base font-extrabold text-text dark:text-dark-text">Lock App</Text>
        </View>
      </SafeAreaView>

      <View className="mx-4 mt-4 bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-dark-border flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-dark-card-hover items-center justify-center">
            <Icon name={ICONS.key} size={20} color={colors.pinkPrimary} />
          </View>
          <View>
            <Text className="font-bold text-text dark:text-dark-text text-sm">Lock App</Text>
            <Text className="text-xs text-muted dark:text-dark-muted font-semibold">Enable Face ID / Fingerprint protection</Text>
          </View>
        </View>
        <Pressable
          onPress={toggleLock}
          className={`w-12 h-7 rounded-full justify-center ${locked ? 'bg-pink-primary' : 'bg-gray-300 dark:bg-dark-border'}`}
        >
          <View
            className="w-6 h-6 bg-white rounded-full shadow"
            style={{ marginLeft: locked ? 22 : 2 }}
          />
        </Pressable>
      </View>

      <View className="flex-1 items-end justify-end pr-4 pb-8">
        <Mascot />
      </View>
    </View>
  );
}
