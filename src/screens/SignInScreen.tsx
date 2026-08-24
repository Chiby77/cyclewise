import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mascot } from '@/components/Mascot';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AppNavigationProp } from '@/navigation/types';

export function SignInScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const { signIn, signInWithGoogle, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Forgot Password', 'Please enter your email address above to receive a password reset link.');
      return;
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        Alert.alert('Reset Failed', error.message);
      } else {
        setResetMessage(`Password reset link sent to ${email}`);
        Alert.alert('Password Reset', `Instructions have been sent to ${email}`);
      }
    } else {
      Alert.alert('Password Reset', `A password reset link would be dispatched to ${email}`);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg dark:bg-dark-bg" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[colors.pinkPastel, colors.pinkPrimary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <SafeAreaView edges={['top']}>
            <View className="items-center pt-8 pb-10 px-6">
              <Mascot />
              <Text className="text-2xl font-extrabold text-white mt-3">CycleWise</Text>
              <Text className="text-sm text-white/80 font-semibold mt-1">Welcome back — sign in to continue</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className="flex-1 px-6 -mt-6 rounded-t-3xl bg-bg dark:bg-dark-bg pt-8">
          <Text className="text-xl font-extrabold text-text dark:text-dark-text mb-6">Sign In</Text>

          <View className="mb-4">
            <Text className="text-xs font-bold text-muted dark:text-dark-muted mb-1.5">Email</Text>
            <View className="flex-row items-center bg-white dark:bg-dark-card rounded-2xl px-4 shadow-sm border border-gray-100 dark:border-dark-border">
              <Icon name={ICONS.mail} size={18} color={colors.muted} />
              <TextInput
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  clearError();
                  setResetMessage(null);
                }}
                placeholder="you@example.com"
                placeholderTextColor="#C7C7CC"
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 py-3.5 px-3 text-sm text-text dark:text-dark-text"
              />
            </View>
          </View>

          <View className="mb-2">
            <Text className="text-xs font-bold text-muted dark:text-dark-muted mb-1.5">Password</Text>
            <View className="flex-row items-center bg-white dark:bg-dark-card rounded-2xl px-4 shadow-sm border border-gray-100 dark:border-dark-border">
              <Icon name={ICONS.lockField} size={18} color={colors.muted} />
              <TextInput
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  clearError();
                }}
                placeholder="Your password"
                placeholderTextColor="#C7C7CC"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="flex-1 py-3.5 px-3 text-sm text-text dark:text-dark-text"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Icon name={showPassword ? ICONS.eyeOff : ICONS.eye} size={18} color={colors.muted} />
              </Pressable>
            </View>
          </View>

          <Pressable onPress={handleForgotPassword} className="self-end mb-4 active:opacity-70">
            <Text className="text-xs font-bold text-pink-primary">Forgot password?</Text>
          </Pressable>

          {resetMessage && <Text className="text-xs font-semibold text-teal-dark mb-3">{resetMessage}</Text>}
          {!!error && <Text className="text-xs font-semibold text-red-500 mb-3">{error}</Text>}

          <Pressable
            onPress={() => signIn(email, password)}
            className="w-full py-4 rounded-full bg-pink-primary items-center shadow-md active:opacity-90"
          >
            <Text className="text-white text-base font-bold">Sign In</Text>
          </Pressable>

          <View className="flex-row items-center gap-3 my-6">
            <View className="flex-1 h-px bg-gray-200 dark:bg-dark-border" />
            <Text className="text-xs font-bold text-muted dark:text-dark-muted">OR</Text>
            <View className="flex-1 h-px bg-gray-200 dark:bg-dark-border" />
          </View>

          <Pressable
            onPress={signInWithGoogle}
            className="w-full py-3.5 rounded-full bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex-row items-center justify-center gap-3 shadow-sm active:opacity-80"
          >
            <Icon name={ICONS.google} size={20} color="#EA4335" />
            <Text className="text-text dark:text-dark-text text-sm font-bold">Continue with Google</Text>
          </Pressable>

          <View className="flex-row justify-center gap-1 mt-8 mb-6">
            <Text className="text-sm text-muted dark:text-dark-muted font-semibold">Don't have an account?</Text>
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text className="text-sm font-bold text-pink-primary">Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
