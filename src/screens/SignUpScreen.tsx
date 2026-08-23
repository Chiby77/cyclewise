import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mascot } from '@/components/Mascot';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import { useAuth } from '@/context/AuthContext';
import type { AppNavigationProp } from '@/navigation/types';

export function SignUpScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const { signUp, signInWithGoogle, error, clearError } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (setter: (v: string) => void) => (t: string) => {
    setter(t);
    clearError();
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-bg" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
        <LinearGradient colors={[colors.pinkPastel, colors.pinkPrimary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <SafeAreaView edges={['top']}>
            <View className="items-center pt-8 pb-10 px-6">
              <Mascot />
              <Text className="text-2xl font-extrabold text-white mt-3">CycleWise</Text>
              <Text className="text-sm text-white/80 font-semibold mt-1">Create an account to get started</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className="flex-1 px-6 -mt-6 rounded-t-3xl bg-bg pt-8">
          <Text className="text-xl font-extrabold text-text mb-6">Sign Up</Text>

          <View className="mb-4">
            <Text className="text-xs font-bold text-muted mb-1.5">Name</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 shadow-sm border border-gray-100">
              <Icon name={ICONS.nameField} size={18} color={colors.muted} />
              <TextInput
                value={name}
                onChangeText={onChange(setName)}
                placeholder="Your name"
                placeholderTextColor="#C7C7CC"
                className="flex-1 py-3.5 px-3 text-sm text-text"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold text-muted mb-1.5">Email</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 shadow-sm border border-gray-100">
              <Icon name={ICONS.mail} size={18} color={colors.muted} />
              <TextInput
                value={email}
                onChangeText={onChange(setEmail)}
                placeholder="you@example.com"
                placeholderTextColor="#C7C7CC"
                autoCapitalize="none"
                keyboardType="email-address"
                className="flex-1 py-3.5 px-3 text-sm text-text"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-xs font-bold text-muted mb-1.5">Password</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 shadow-sm border border-gray-100">
              <Icon name={ICONS.lockField} size={18} color={colors.muted} />
              <TextInput
                value={password}
                onChangeText={onChange(setPassword)}
                placeholder="At least 6 characters"
                placeholderTextColor="#C7C7CC"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="flex-1 py-3.5 px-3 text-sm text-text"
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Icon name={showPassword ? ICONS.eyeOff : ICONS.eye} size={18} color={colors.muted} />
              </Pressable>
            </View>
          </View>

          <View className="mb-2">
            <Text className="text-xs font-bold text-muted mb-1.5">Confirm Password</Text>
            <View className="flex-row items-center bg-white rounded-2xl px-4 shadow-sm border border-gray-100">
              <Icon name={ICONS.lockField} size={18} color={colors.muted} />
              <TextInput
                value={confirmPassword}
                onChangeText={onChange(setConfirmPassword)}
                placeholder="Re-enter your password"
                placeholderTextColor="#C7C7CC"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                className="flex-1 py-3.5 px-3 text-sm text-text"
              />
            </View>
          </View>

          {!!error && <Text className="text-xs font-semibold text-red-500 mb-3 mt-2">{error}</Text>}

          <Pressable
            onPress={() => signUp(name, email, password, confirmPassword)}
            className={`w-full py-4 rounded-full bg-pink-primary items-center shadow-md active:opacity-90 ${error ? '' : 'mt-4'}`}
          >
            <Text className="text-white text-base font-bold">Sign Up</Text>
          </Pressable>

          <View className="flex-row items-center gap-3 my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="text-xs font-bold text-muted">OR</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          <Pressable
            onPress={signInWithGoogle}
            className="w-full py-3.5 rounded-full bg-white border border-gray-200 flex-row items-center justify-center gap-3 shadow-sm active:opacity-80"
          >
            <Icon name={ICONS.google} size={20} color="#EA4335" />
            <Text className="text-text text-sm font-bold">Continue with Google</Text>
          </Pressable>

          <View className="flex-row justify-center gap-1 mt-8 mb-6">
            <Text className="text-sm text-muted font-semibold">Already have an account?</Text>
            <Pressable onPress={() => navigation.navigate('SignIn')}>
              <Text className="text-sm font-bold text-pink-primary">Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
