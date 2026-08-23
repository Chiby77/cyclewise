import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { Mascot } from '@/components/Mascot';
import { Icon, type IconName } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import type { AppNavigationProp } from '@/navigation/types';
import { colors } from '@/theme/colors';

const ITEMS: { icon: IconName; text: string }[] = [
  { icon: ICONS.goalCycle, text: 'Summarize your menstrual cycle' },
  { icon: ICONS.goalPregnancy, text: 'Export pregnancy progress' },
  { icon: ICONS.note, text: 'Export as PDF for easy sharing and printing' },
  { icon: ICONS.doctor, text: 'Designed to support your doctor visits with clear, organized data' },
];

export function ExportReportScreen() {
  const navigation = useNavigation<AppNavigationProp>();

  return (
    <View className="flex-1 bg-bg">
      <View className="relative overflow-hidden" style={{ backgroundColor: colors.pinkPrimary }}>
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center justify-around pt-4 pb-16 px-6">
            <Pressable onPress={() => navigation.goBack()} className="absolute top-0 left-2 p-2">
              <Icon name={ICONS.back} size={22} color="white" />
            </Pressable>
            <Icon name={ICONS.avatar} size={56} color="white" />
            <View className="w-16 h-16 bg-white/30 rounded-2xl items-center justify-center">
              <Icon name={ICONS.download} size={28} color="white" />
            </View>
            <Icon name={ICONS.goalPregnancy} size={56} color="white" />
            <Icon name={ICONS.heart} size={20} color="rgba(255,255,255,0.6)" style={{ position: 'absolute', top: 16, left: 48 }} />
          </View>
        </SafeAreaView>
        <Svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 40 }} viewBox="0 0 375 40" preserveAspectRatio="none">
          <Path d="M0,0 Q187,40 375,0 L375,40 L0,40 Z" fill={colors.bg} />
        </Svg>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerClassName="py-2 pb-24">
        <View className="bg-white rounded-2xl p-5 shadow-sm">
          <Mascot className="absolute right-0 top-4" />
          <Text className="text-base font-extrabold text-text mb-4">Export report for the doctor</Text>
          {ITEMS.map((item) => (
            <View key={item.text} className="flex-row items-start gap-3 mb-4">
              <View className="w-10 h-10 rounded-full bg-pink-light items-center justify-center">
                <Icon name={item.icon} size={18} color={colors.pinkDark} />
              </View>
              <Text className="text-sm font-semibold text-text pt-2 flex-1">{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <SafeAreaView edges={['bottom']} className="px-4 pt-4 bg-bg">
        <Pressable className="w-full py-4 rounded-full bg-pink-primary items-center shadow-md mb-4">
          <Text className="text-white font-bold text-base">Generate report</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
