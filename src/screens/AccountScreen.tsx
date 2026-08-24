import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Icon } from '@/components/Icon';
import { colors } from '@/theme/colors';

export function AccountScreen() {
  const navigation = useNavigation<any>();
  const { userEmail, userName, authProvider, updateProfileName, changePassword, signOut } = useAuth();
  const { themePreference, setThemePreference } = useTheme();

  // Split full name into first name & surname for editing
  const nameParts = (userName || '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [surname, setSurname] = useState(nameParts.slice(1).join(' ') || '');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const handleSaveName = async () => {
    const combined = `${firstName.trim()} ${surname.trim()}`.trim();
    if (!combined) {
      setNameMessage('Name cannot be empty.');
      return;
    }
    setIsSavingName(true);
    setNameMessage(null);
    try {
      await updateProfileName(combined);
      setNameMessage('Name saved successfully.');
    } catch (err: any) {
      setNameMessage(err?.message || 'Failed to update name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    if (!password || !confirmPassword) {
      setPasswordMessage('Enter and confirm your new password.');
      return;
    }
    if (password.length < 6) {
      setPasswordMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage('Passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    setPasswordMessage(null);
    try {
      await changePassword(password);
      setPasswordMessage('Password changed successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage(err?.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of CycleWise?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => signOut(),
      },
    ]);
  };

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
        <Text className="text-lg font-bold text-text dark:text-dark-text">Account & Settings</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {/* Profile Info Section */}
        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 mb-4 border border-gray-100 dark:border-dark-border gap-3">
          <Text className="text-xs font-bold text-muted dark:text-dark-muted uppercase tracking-wider">
            Personal Information
          </Text>

          {/* First Name */}
          <View className="gap-1">
            <Text className="text-xs font-bold text-text dark:text-dark-text">First Name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-dark-card-hover text-text dark:text-dark-text text-sm font-semibold"
            />
          </View>

          {/* Surname */}
          <View className="gap-1">
            <Text className="text-xs font-bold text-text dark:text-dark-text">Surname</Text>
            <TextInput
              value={surname}
              onChangeText={setSurname}
              placeholder="Surname"
              placeholderTextColor="#9CA3AF"
              className="border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-dark-card-hover text-text dark:text-dark-text text-sm font-semibold"
            />
          </View>

          {nameMessage && (
            <Text
              className={`text-xs font-semibold ${
                nameMessage.includes('successfully') ? 'text-teal-dark' : 'text-pink-dark'
              }`}
            >
              {nameMessage}
            </Text>
          )}

          <Pressable
            onPress={handleSaveName}
            disabled={isSavingName}
            className="bg-pink-primary py-2.5 rounded-xl items-center active:opacity-80 mt-1"
          >
            <Text className="text-white font-bold text-xs">
              {isSavingName ? 'Saving...' : 'Save Name Changes'}
            </Text>
          </Pressable>
        </View>

        {/* Account Credentials & Email */}
        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 mb-4 border border-gray-100 dark:border-dark-border gap-3">
          <Text className="text-xs font-bold text-muted dark:text-dark-muted uppercase tracking-wider">
            Account Email
          </Text>

          <View className="gap-1">
            <Text className="text-xs font-bold text-text dark:text-dark-text">Email Address</Text>
            <View className="border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5 bg-gray-100 dark:bg-dark-card-hover/50 flex-row items-center justify-between">
              <Text className="text-muted dark:text-dark-muted text-sm font-semibold">
                {userEmail || 'No email attached'}
              </Text>
              <Icon name="lock-closed" size={16} color="#9CA3AF" />
            </View>
            <Text className="text-[11px] text-muted dark:text-dark-muted mt-0.5">
              Email address is locked and cannot be changed here.
            </Text>
          </View>
        </View>

        {/* Change Password Section (Password Auth Only) */}
        {authProvider === 'password' && (
          <View className="bg-card dark:bg-dark-card rounded-2xl p-4 mb-4 border border-gray-100 dark:border-dark-border gap-3">
            <Text className="text-xs font-bold text-muted dark:text-dark-muted uppercase tracking-wider">
              Security & Password
            </Text>

            <View className="gap-1">
              <Text className="text-xs font-bold text-text dark:text-dark-text">New Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="At least 6 characters"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-dark-card-hover text-text dark:text-dark-text text-sm font-semibold"
              />
            </View>

            <View className="gap-1">
              <Text className="text-xs font-bold text-text dark:text-dark-text">Confirm Password</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Re-enter new password"
                placeholderTextColor="#9CA3AF"
                className="border border-gray-200 dark:border-dark-border rounded-xl px-3 py-2.5 bg-gray-50 dark:bg-dark-card-hover text-text dark:text-dark-text text-sm font-semibold"
              />
            </View>

            {passwordMessage && (
              <Text
                className={`text-xs font-semibold ${
                  passwordMessage.includes('successfully') ? 'text-teal-dark' : 'text-pink-dark'
                }`}
              >
                {passwordMessage}
              </Text>
            )}

            <Pressable
              onPress={handleChangePassword}
              disabled={isSavingPassword}
              className="bg-gray-800 dark:bg-dark-card-hover py-2.5 rounded-xl items-center active:opacity-80 mt-1"
            >
              <Text className="text-white font-bold text-xs">
                {isSavingPassword ? 'Updating...' : 'Update Password'}
              </Text>
            </Pressable>
          </View>
        )}

        {/* Theme Preferences */}
        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 mb-4 border border-gray-100 dark:border-dark-border gap-3">
          <Text className="text-xs font-bold text-muted dark:text-dark-muted uppercase tracking-wider">
            Appearance & Theme
          </Text>

          <View className="flex-row bg-gray-100 dark:bg-dark-card-hover p-1 rounded-xl">
            {(['system', 'light', 'dark'] as const).map((pref) => {
              const isSelected = themePreference === pref;
              return (
                <Pressable
                  key={pref}
                  onPress={() => setThemePreference(pref)}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    isSelected ? 'bg-white dark:bg-dark-card shadow-sm' : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-bold capitalize ${
                      isSelected ? 'text-pink-primary' : 'text-muted dark:text-dark-muted'
                    }`}
                  >
                    {pref}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Legal & App Links */}
        <View className="bg-card dark:bg-dark-card rounded-2xl p-2 mb-6 border border-gray-100 dark:border-dark-border">
          <Pressable
            onPress={() => navigation.navigate('Terms')}
            className="flex-row items-center justify-between p-3 border-b border-gray-100 dark:border-dark-border active:opacity-70"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="document-text" size={20} color={colors.pinkPrimary} />
              <Text className="text-xs font-bold text-text dark:text-dark-text">Terms & Conditions</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('PrivacyPolicy')}
            className="flex-row items-center justify-between p-3 border-b border-gray-100 dark:border-dark-border active:opacity-70"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="shield-checkmark" size={20} color={colors.teal} />
              <Text className="text-xs font-bold text-text dark:text-dark-text">Privacy Policy</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#9CA3AF" />
          </Pressable>

          <Pressable
            onPress={handleSignOut}
            className="flex-row items-center justify-between p-3 active:opacity-70"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="log-out" size={20} color="#E91E63" />
              <Text className="text-xs font-bold text-pink-dark">Sign Out</Text>
            </View>
            <Icon name="chevron-forward" size={18} color="#E91E63" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
