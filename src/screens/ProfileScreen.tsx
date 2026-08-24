import React from 'react';
import { View, Text, Pressable, ScrollView, Share, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Mascot } from '@/components/Mascot';
import { Icon, type IconName } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import type { AppNavigationProp } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/context/ThemeContext';
import { setupNotifications } from '@/services/notifications';

const GOALS: { id: string; icon: IconName; label: string }[] = [
  { id: 'Track My Cycle', icon: ICONS.goalCycle, label: 'Track My\nCycle' },
  { id: 'Track My Pregnancy', icon: ICONS.goalPregnancy, label: 'Track My\nPregnancy' },
  { id: 'Try to conceive', icon: ICONS.goalConceive, label: 'Try to\nconceive' },
];

export function ProfileScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const { userName, userEmail, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { isDark, themeColors } = useTheme();

  const displayName = profile?.full_name || userName || 'CycleWise User';
  const displayEmail = userEmail || 'user@cyclewise.app';
  const activeGoal = profile?.goal || 'Track My Cycle';

  const statsRows: { icon: IconName; label: string; value: string }[] = [
    { icon: ICONS.flowMedium, label: 'Period Length', value: `${profile?.period_length || 5} days` },
    { icon: ICONS.cycle, label: 'Cycle Length', value: `${profile?.cycle_length || 28} days` },
    { icon: ICONS.flash, label: 'Luteal Phase Length', value: `${profile?.luteal_phase || 14} days` },
    { icon: ICONS.scaleStat, label: 'Measurement System', value: `${profile?.measurement_system || 'SI'} (kg, ml, C)` },
  ];

  const utilities: { icon: IconName; label: string; action: () => void }[] = [
    { icon: ICONS.sparkles, label: 'AI Health\nAssistant', action: () => navigation.navigate('AIHealthAssistant') },
    { icon: ICONS.language, label: 'Language', action: () => navigation.navigate('Language') },
    { icon: ICONS.lock, label: 'Lock App', action: () => navigation.navigate('LockApp') },
    { icon: ICONS.grid, label: 'Widgets', action: () => navigation.navigate('Widgets') },
    { icon: ICONS.doctor, label: "Export report\nfor the doctor", action: () => navigation.navigate('ExportReport') },
  ];

  const handleHelpAction = async (label: string) => {
    switch (label) {
      case 'Report problem':
        Linking.openURL('mailto:support@bluewavetech.com?subject=CycleWise%20App%20Feedback').catch(() => {
          Alert.alert('Report a Problem', 'Send feedback or bug reports to support@bluewavetech.com');
        });
        break;
      case 'App Permission':
        Linking.openSettings().catch(() => {
          Alert.alert('App Permissions', 'Manage notification and camera permissions in your device settings.');
        });
        break;
      case 'Rate us 5 stars':
        Alert.alert('Rate CycleWise', 'Thank you for loving CycleWise! Rating links will be available on the App Store / Play Store upon launch.');
        break;
      case 'More apps':
        Alert.alert('BlueWave Technologies', 'Explore more of our health and wellness apps at www.bluewavetech.com');
        break;
      case 'Share this app':
        Share.share({
          message: 'Track your period, pregnancy, and cycle health with CycleWise! Download now.',
        }).catch(console.warn);
        break;
    }
  };

  const handleGrantPermissions = async () => {
    try {
      await setupNotifications();
      Alert.alert('Permissions Granted', 'Notifications and daily hydration reminders are active!');
    } catch (e) {
      Alert.alert('Permissions', 'Enable notifications in your device Settings to receive reminders.');
    }
  };

  return (
    <View className="flex-1 bg-bg dark:bg-dark-bg">
      <ScrollView contentContainerClassName="pb-24" showsVerticalScrollIndicator={false}>
        {/* Pink wave header */}
        <View className="overflow-hidden pb-10">
          <LinearGradient colors={themeColors.gradientHeader} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <SafeAreaView edges={['top']}>
              <View className="items-center pt-4 pb-4 px-4 relative">
                <Pressable
                  onPress={() => navigation.navigate('Account')}
                  className="w-16 h-16 rounded-full bg-gray-200 dark:bg-dark-card items-center justify-center mb-2 border-2 border-white dark:border-dark-border shadow-md active:opacity-80"
                >
                  <Icon name={ICONS.avatar} size={40} color={colors.pinkPrimary} />
                </Pressable>
                <Text className="text-lg font-extrabold text-white">{displayName}</Text>
                <Text className="text-xs text-white/80 font-semibold">{displayEmail}</Text>

                <View className="flex-row gap-2 mt-3">
                  <Pressable
                    onPress={() => navigation.navigate('Account')}
                    className="px-4 py-2 rounded-full bg-white/20 border border-white/60 flex-row items-center gap-1.5 active:opacity-80"
                  >
                    <Icon name="settings-outline" size={14} color="white" />
                    <Text className="text-white text-xs font-bold">Manage Account</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => navigation.navigate('AIHealthAssistant')}
                    className="px-4 py-2 rounded-full bg-white/20 border border-white/60 flex-row items-center gap-1.5 active:opacity-80"
                  >
                    <Icon name={ICONS.sparkles} size={14} color="white" />
                    <Text className="text-white text-xs font-bold">Ask AI</Text>
                  </Pressable>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
          <Svg
            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 40 }}
            viewBox="0 0 390 40"
            preserveAspectRatio="none"
          >
            <Path d="M0,10 Q98,40 195,20 Q292,0 390,20 L390,40 L0,40 Z" fill={themeColors.bg} />
          </Svg>
        </View>

        {/* My Goal */}
        <View className="bg-card dark:bg-dark-card rounded-2xl mx-4 p-4 shadow-sm mb-3 border border-gray-100 dark:border-dark-border relative overflow-hidden">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-extrabold text-text dark:text-dark-text text-base">My Goal</Text>
            <Mascot className="scale-75 -mr-2" />
          </View>
          <View className="flex-row gap-2 mb-4">
            {GOALS.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => updateProfile({ goal: g.id })}
                className={`flex-1 py-4 px-2 rounded-2xl items-center gap-2 border-2 ${
                  activeGoal === g.id
                    ? 'bg-pink-primary border-pink-primary'
                    : 'bg-gray-50 dark:bg-dark-card-hover border-transparent'
                }`}
              >
                <Icon name={g.icon} size={24} color={activeGoal === g.id ? 'white' : colors.pinkPrimary} />
                <Text
                  className={`text-[11px] font-bold text-center leading-tight ${
                    activeGoal === g.id ? 'text-white' : 'text-text dark:text-dark-text'
                  }`}
                >
                  {g.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {statsRows.map((s, i) => (
            <View
              key={s.label}
              className={`flex-row justify-between items-center py-3 ${
                i !== statsRows.length - 1 ? 'border-b border-gray-100 dark:border-dark-border' : ''
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Icon name={s.icon} size={18} color={colors.pinkPrimary} />
                <Text className="text-sm font-semibold text-text dark:text-dark-text">{s.label}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm font-bold text-pink-primary">{s.value}</Text>
                <Icon name={ICONS.chevronForward} size={14} color="#9CA3AF" />
              </View>
            </View>
          ))}
        </View>

        {/* Utilities */}
        <View className="bg-card dark:bg-dark-card rounded-2xl mx-4 p-4 shadow-sm mb-3 border border-gray-100 dark:border-dark-border">
          <Text className="font-extrabold text-text dark:text-dark-text mb-3 text-base">Utilities</Text>
          <View className="flex-row flex-wrap gap-4">
            {utilities.map((item) => (
              <Pressable key={item.label} onPress={item.action} className="items-center gap-2 w-[28%] active:opacity-80">
                <View className="w-14 h-14 rounded-full bg-pink-light dark:bg-dark-card-hover items-center justify-center">
                  <Icon name={item.icon} size={24} color={colors.pinkDark} />
                </View>
                <Text className="text-[11px] font-semibold text-text dark:text-dark-text text-center leading-tight">{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Reminders */}
        <Pressable
          onPress={handleGrantPermissions}
          className="bg-card dark:bg-dark-card rounded-2xl mx-4 p-4 shadow-sm mb-3 border border-gray-100 dark:border-dark-border relative overflow-hidden active:opacity-80"
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-extrabold text-text dark:text-dark-text text-base">Reminders</Text>
            <Mascot className="scale-75 -mr-2" />
          </View>
          <View className="flex-row items-start gap-3">
            <Icon name={ICONS.bell} size={20} color={colors.pinkPrimary} style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-sm font-bold text-text dark:text-dark-text">Grant permissions</Text>
              <Text className="text-xs text-muted dark:text-dark-muted font-semibold mt-0.5">
                Grant notification and reminder permissions to receive timely cycle alerts.
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Help */}
        <View className="bg-card dark:bg-dark-card rounded-2xl mx-4 p-4 shadow-sm mb-3 border border-gray-100 dark:border-dark-border">
          <Text className="font-extrabold text-text dark:text-dark-text mb-2 text-base">Help & Support</Text>
          {[
            { icon: ICONS.reportProblem, label: 'Report problem' },
            { icon: ICONS.permission, label: 'App Permission' },
            { icon: ICONS.star, label: 'Rate us 5 stars' },
            { icon: ICONS.moreApps, label: 'More apps' },
            { icon: ICONS.shareApp, label: 'Share this app' },
          ].map((item, i, arr) => (
            <Pressable
              key={item.label}
              onPress={() => handleHelpAction(item.label)}
              className={`flex-row justify-between items-center py-3 active:opacity-70 ${
                i !== arr.length - 1 ? 'border-b border-gray-100 dark:border-dark-border' : ''
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Icon name={item.icon} size={18} color={colors.pinkPrimary} />
                <Text className="text-sm font-semibold text-text dark:text-dark-text">{item.label}</Text>
              </View>
              <Icon name={ICONS.chevronForward} size={14} color="#9CA3AF" />
            </Pressable>
          ))}
        </View>

        {/* Log out */}
        <Pressable
          onPress={signOut}
          className="bg-card dark:bg-dark-card rounded-2xl mx-4 p-4 shadow-sm mb-3 border border-gray-100 dark:border-dark-border flex-row items-center justify-center gap-2 active:opacity-80"
        >
          <Icon name={ICONS.logout} size={18} color="#EF4444" />
          <Text className="text-sm font-bold text-red-500">Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

