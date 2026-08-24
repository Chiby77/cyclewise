import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/Icon';
import { colors } from '@/theme/colors';

export function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-bg dark:bg-dark-bg">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-card dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
        <Pressable
          onPress={() => navigation.goBack()}
          className="p-2 rounded-full active:opacity-70"
          hitSlop={10}
        >
          <Icon name="arrow-back" size={24} color={colors.pinkPrimary} />
        </Pressable>
        <Text className="text-lg font-bold text-text dark:text-dark-text">Privacy Policy</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <View className="bg-card dark:bg-dark-card rounded-2xl p-5 border border-gray-100 dark:border-dark-border gap-4 mb-8">
          <Text className="text-xs text-muted dark:text-dark-muted font-semibold">Effective Date: August 2026</Text>

          <Text className="text-sm font-bold text-text dark:text-dark-text">1. Data We Collect</Text>
          <Text className="text-xs text-text dark:text-dark-text leading-5">
            CycleWise collects personal cycle dates, logged symptoms, moods, physical activity, and hydration stats. We process this information strictly to provide period predictions, health insights, and personalized cycle tracking.
          </Text>

          <Text className="text-sm font-bold text-text dark:text-dark-text">2. How Your Data Is Stored & Protected</Text>
          <Text className="text-xs text-text dark:text-dark-text leading-5">
            All health records are stored in encrypted SQLite database tables on your device and synchronized securely over SSL to encrypted cloud storage in Supabase. Your data is NEVER sold, rented, or shared with third-party advertisers.
          </Text>

          <Text className="text-sm font-bold text-text dark:text-dark-text">3. Device Permissions & Biometrics</Text>
          <Text className="text-xs text-text dark:text-dark-text leading-5">
            When App Lock is enabled, authentication takes place entirely via your device's native Face ID, Touch ID, or PIN mechanism. Biometric template data never leaves your device's Secure Enclave/KeyStore.
          </Text>

          <Text className="text-sm font-bold text-text dark:text-dark-text">4. Your Rights & Control</Text>
          <Text className="text-xs text-text dark:text-dark-text leading-5">
            You retain 100% ownership of your health records. You can export your full data report or delete your account and clear all local and cloud records at any time from the Account Settings screen.
          </Text>

          <Text className="text-xs text-muted dark:text-dark-muted mt-2">
            For privacy inquiries or data removal requests, contact our Privacy Officer at privacy@bluewavetechnologies.co.zw.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
