import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
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

const GOALS: { id: string; icon: IconName; label: string }[] = [
  { id: 'Track My Cycle', icon: ICONS.goalCycle, label: 'Track My\nCycle' },
  { id: 'Track My Pregnancy', icon: ICONS.goalPregnancy, label: 'Track My\nPregnancy' },
  { id: 'Try to conceive', icon: ICONS.goalConceive, label: 'Try to\nconceive' },
];

const HELP_ROWS: { icon: IconName; label: string }[] = [
  { icon: ICONS.reportProblem, label: 'Report problem' },
  { icon: ICONS.permission, label: 'App Permission' },
  { icon: ICONS.star, label: 'Rate us 5 stars' },
  { icon: ICONS.moreApps, label: 'More apps' },
  { icon: ICONS.shareApp, label: 'Share this app' },
];

export function ProfileScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const { userName, userEmail, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();

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

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="pb-24">
        {/* Pink wave header */}
        <View className="overflow-hidden pb-10">
          <LinearGradient colors={[colors.pinkPastel, colors.pinkPrimary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <SafeAreaView edges={['top']}>
              <View className="items-center pt-4 pb-4 px-4">
                <View className="w-16 h-16 rounded-full bg-gray-200 items-center justify-center mb-2 border-2 border-white">
                  <Icon name={ICONS.avatar} size={40} color={colors.pinkPrimary} />
                </View>
                <Text className="text-lg font-extrabold text-white">{displayName}</Text>
                <Text className="text-xs text-white/80 font-semibold">{displayEmail}</Text>
                <Pressable
                  onPress={() => navigation.navigate('AIHealthAssistant')}
                  className="mt-3 px-6 py-2 rounded-full border border-white/60 flex-row items-center gap-2"
                >
                  <Icon name={ICONS.sparkles} size={14} color="white" />
                  <Text className="text-white text-sm font-bold">Ask AI Assistant</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </LinearGradient>
          <Svg
            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 40 }}
            viewBox="0 0 390 40"
            preserveAspectRatio="none"
          >
            <Path d="M0,10 Q98,40 195,20 Q292,0 390,20 L390,40 L0,40 Z" fill={colors.bg} />
          </Svg>
        </View>

        {/* My Goal */}
        <View className="bg-white rounded-2xl mx-4 p-4 shadow-sm mb-3">
          <Mascot className="absolute right-0 top-2" />
          <Text className="font-extrabold text-text mb-3">My Goal</Text>
          <View className="flex-row gap-2 mb-4">
            {GOALS.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => updateProfile({ goal: g.id })}
                className={`flex-1 py-4 px-2 rounded-2xl items-center gap-2 border-2 ${
                  activeGoal === g.id ? 'bg-pink-primary border-pink-primary' : 'bg-gray-50 border-transparent'
                }`}
              >
                <Icon name={g.icon} size={24} color={activeGoal === g.id ? 'white' : colors.pinkPrimary} />
                <Text
                  className={`text-[11px] font-bold text-center leading-tight ${
                    activeGoal === g.id ? 'text-white' : 'text-text'
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
                i !== statsRows.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Icon name={s.icon} size={18} color={colors.text} />
                <Text className="text-sm font-semibold text-text">{s.label}</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-sm font-bold text-pink-primary">{s.value}</Text>
                <Icon name={ICONS.chevronForward} size={14} color="#9CA3AF" />
              </View>
            </View>
          ))}
        </View>

        {/* Utilities */}
        <View className="bg-white rounded-2xl mx-4 p-4 shadow-sm mb-3">
          <Text className="font-extrabold text-text mb-3">Utilities</Text>
          <View className="flex-row flex-wrap gap-4">
            {utilities.map((item) => (
              <Pressable key={item.label} onPress={item.action} className="items-center gap-2 w-[28%]">
                <View className="w-14 h-14 rounded-full bg-pink-light items-center justify-center">
                  <Icon name={item.icon} size={24} color={colors.pinkDark} />
                </View>
                <Text className="text-[11px] font-semibold text-text text-center leading-tight">{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Reminders */}
        <View className="bg-white rounded-2xl mx-4 p-4 shadow-sm mb-3">
          <Mascot className="absolute right-0 top-2" />
          <Text className="font-extrabold text-text mb-3">Reminders</Text>
          <View className="flex-row items-start gap-3">
            <Icon name={ICONS.bell} size={20} color={colors.pinkPrimary} style={{ marginTop: 2 }} />
            <View className="flex-1">
              <Text className="text-sm font-bold text-text">Grant permissions</Text>
              <Text className="text-xs text-muted font-semibold">
                Grant notification and alarm – reminder permissions to use reminder function
              </Text>
            </View>
          </View>
        </View>

        {/* Help */}
        <View className="bg-white rounded-2xl mx-4 p-4 shadow-sm mb-3">
          <Text className="font-extrabold text-text mb-2">Help</Text>
          {HELP_ROWS.map((item, i) => (
            <View
              key={item.label}
              className={`flex-row justify-between items-center py-3 ${
                i !== HELP_ROWS.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="flex-row items-center gap-3">
                <Icon name={item.icon} size={18} color={colors.text} />
                <Text className="text-sm font-semibold text-text">{item.label}</Text>
              </View>
              <Icon name={ICONS.chevronForward} size={14} color="#9CA3AF" />
            </View>
          ))}
        </View>

        {/* Log out */}
        <Pressable
          onPress={signOut}
          className="bg-white rounded-2xl mx-4 p-4 shadow-sm mb-3 flex-row items-center justify-center gap-2 active:opacity-80"
        >
          <Icon name={ICONS.logout} size={18} color="#EF4444" />
          <Text className="text-sm font-bold text-red-500">Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
