import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/Icon';
import { colors } from '@/theme/colors';

export function TermsScreen() {
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
        <Text className="text-lg font-bold text-text dark:text-dark-text">Terms & Conditions</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <View className="bg-card dark:bg-dark-card rounded-2xl p-5 border border-gray-100 dark:border-dark-border gap-4 mb-8">
          <Text className="text-xs text-muted dark:text-dark-muted font-semibold">Last Updated: August 2026</Text>

          <Text className="text-sm font-bold text-text dark:text-dark-text">1. Acceptance of Terms</Text>
          <Text className="text-xs text-text dark:text-dark-text leading-5">
            By downloading, installing, or using CycleWise ("App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.
          </Text>

          <Text className="text-sm font-bold text-text dark:text-dark-text">2. Health Data Disclaimer</Text>
          <Text className="text-xs text-text dark:text-dark-text leading-5">
            CycleWise provides cycle tracking, symptom logging, and predictions for informational and educational purposes only. The App is NOT a medical device, contraceptive method, or diagnostic tool. Always consult a qualified medical professional for health or medical advice.
          </Text>

          <Text className="text-sm font-bold text-text dark:text-dark-text">3. User Responsibilities</Text>
          <Text className="text-xs text-text dark:text-dark-text leading-5">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities performed under your account. You agree to enter accurate personal and health data for the best app experience.
          </Text>

          <Text className="text-sm font-bold text-text dark:text-dark-text">4. Privacy & Security</Text>
          <Text className="text-xs text-text dark:text-dark-text leading-5">
            Your privacy is paramount. Personal health data logged in CycleWise is encrypted locally on your device and synchronized securely with our cloud services. Please review our Privacy Policy for details on data handling.
          </Text>

          <Text className="text-sm font-bold text-text dark:text-dark-text">5. Termination & Modifications</Text>
          <Text className="text-xs text-text dark:text-dark-text leading-5">
            We reserve the right to update these terms or modify features of the App at any time. Continued use of CycleWise after updates constitutes acceptance of modified terms.
          </Text>

          <Text className="text-xs text-muted dark:text-dark-muted mt-2">
            For questions regarding these terms, contact us at support@bluewavetechnologies.co.zw.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
