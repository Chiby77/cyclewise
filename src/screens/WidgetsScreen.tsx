import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mascot } from '@/components/Mascot';
import { Icon, type IconName } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import type { AppNavigationProp } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Tab = 'Period' | 'Pregnancy' | 'Water';
const TABS: Tab[] = ['Period', 'Pregnancy', 'Water'];

const MEDIUM_PERIOD_WIDGETS = [
  { label: 'Cycle day', value: 'Day 6', color: colors.pinkPrimary, bg: colors.pinkLight },
  { label: 'Period countdown', value: '17 days', color: colors.pinkPrimary, bg: colors.pinkLight },
  { label: 'Fertile countdown', value: '2 days', color: colors.teal, bg: colors.tealLight },
  { label: 'Ovulation countdown', value: '20 days', color: colors.teal, bg: colors.tealLight },
];

const PERIOD_DETAILS: { icon: IconName; label: string; value: string }[] = [
  { icon: ICONS.cycle, label: 'Cycle day', value: 'Day 6' },
  { icon: ICONS.dueDate, label: 'Period countdown', value: '3 days' },
  { icon: ICONS.calm, label: 'Fertile countdown', value: '4 days' },
  { icon: ICONS.ovulationDot, label: 'Ovulation countdown', value: '23 days' },
];

const MEDIUM_PREGNANCY_WIDGETS = [
  { label: 'Due date countdown', value: '207 days', sub: '', color: colors.amber, bg: colors.amberBg },
  {
    label: 'Gestational age',
    value: '207 days',
    sub: "Baby's Length: ~ 1.6 cm.\nBaby's Weight: ~ 1.7 g.",
    color: colors.amber,
    bg: colors.amberBg,
  },
];

export function WidgetsScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const [tab, setTab] = useState<Tab>('Period');

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
          <Pressable onPress={() => navigation.goBack()} className="p-1">
            <Icon name={ICONS.back} size={22} color={colors.text} />
          </Pressable>
          <Text className="text-base font-extrabold text-text">Widgets</Text>
          <Pressable className="w-8 h-8 rounded-full border border-gray-200 items-center justify-center">
            <Icon name={ICONS.help} size={18} color="#6B7280" />
          </Pressable>
        </View>
        <View className="flex-row gap-2 px-4 py-2">
          {TABS.map((t) => (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className={`px-5 py-1.5 rounded-full ${tab === t ? 'bg-pink-primary' : 'bg-gray-100'}`}
            >
              <Text className={`text-sm font-bold ${tab === t ? 'text-white' : 'text-gray-500'}`}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4" contentContainerClassName="py-3 pb-8">
        {tab === 'Period' && (
          <>

            <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
              <Text className="font-extrabold text-text mb-3">Medium (2x2)</Text>
              <View className="flex-row flex-wrap gap-3 mb-4">
                {MEDIUM_PERIOD_WIDGETS.map((w) => (
                  <View key={w.label} className="w-[47%] rounded-2xl overflow-hidden shadow-sm">
                    <View className="px-3 py-1.5" style={{ backgroundColor: w.color }}>
                      <Text className="text-white text-xs font-bold">{w.label}</Text>
                    </View>
                    <View className="px-3 py-4" style={{ backgroundColor: w.bg }}>
                      <Text className="text-2xl font-extrabold" style={{ color: w.color }}>
                        {w.value}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <View className="flex-row flex-wrap gap-3">
                {MEDIUM_PERIOD_WIDGETS.map((w) => (
                  <Text key={w.label} className="w-[47%] text-center text-xs font-semibold text-muted">
                    {w.label}
                  </Text>
                ))}
              </View>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
              <Mascot className="absolute right-0 top-2" />
              <Text className="font-extrabold text-text mb-3">Large (4x2)</Text>
              <LinearGradient
                colors={[colors.pinkLight, colors.lightBlue]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, overflow: 'hidden', padding: 16 }}
              >
                <Text className="text-lg font-extrabold text-text">June 23 – Cycle day 1</Text>
                <Text className="text-xs font-semibold text-muted mb-3">Low – Chance of getting pregnant</Text>
                <View className="h-3 bg-white/60 rounded-full">
                  <View className="absolute left-0 h-full w-1/4 bg-pink-primary rounded-full" />
                  <View
                    className="absolute w-3 h-3 rounded-full bg-white border border-pink-primary"
                    style={{ left: '25%', top: '50%', marginTop: -6, marginLeft: -6 }}
                  />
                  <View className="absolute h-full bg-teal/60 rounded-full" style={{ left: '25%', width: '38%' }} />
                  <View
                    className="absolute w-3 h-3 rounded-full bg-teal border border-white"
                    style={{ left: '63%', top: '50%', marginTop: -6, marginLeft: -6 }}
                  />
                </View>
              </LinearGradient>
              <Text className="text-center text-xs font-semibold text-muted mt-2">Chance of pregnancy</Text>

              <View className="bg-pink-light rounded-2xl p-4 mt-3">
                <View className="flex-row">
                  {PERIOD_DETAILS.map((item) => (
                    <View key={item.label} className="flex-1 items-center">
                      <Icon name={item.icon} size={20} color={colors.pinkPrimary} style={{ marginBottom: 4 }} />
                      <Text className="text-[9px] font-semibold text-muted text-center leading-tight">
                        {item.label}
                      </Text>
                      <Text className="text-sm font-extrabold text-pink-primary mt-0.5">{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text className="text-center text-xs font-semibold text-muted mt-2">Period details</Text>
            </View>
          </>
        )}

        {tab === 'Pregnancy' && (
          <>
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
              <Mascot className="absolute right-0 top-2" />
              <Text className="font-extrabold text-text mb-3">Medium (2x2)</Text>
              <View className="flex-row gap-3 mb-3">
                {MEDIUM_PREGNANCY_WIDGETS.map((w) => (
                  <View key={w.label} className="flex-1 rounded-2xl overflow-hidden shadow-sm">
                    <View className="px-3 py-1.5" style={{ backgroundColor: w.color }}>
                      <Text className="text-white text-[11px] font-bold">{w.label}</Text>
                    </View>
                    <View className="px-3 py-3" style={{ backgroundColor: w.bg }}>
                      <Text className="text-xl font-extrabold" style={{ color: w.color }}>
                        {w.value}
                      </Text>
                      {!!w.sub && <Text className="text-[9px] text-gray-500 mt-1">{w.sub}</Text>}
                    </View>
                  </View>
                ))}
              </View>
              <View className="flex-row gap-3">
                {MEDIUM_PREGNANCY_WIDGETS.map((w) => (
                  <Text key={w.label} className="flex-1 text-center text-xs font-semibold text-muted">
                    {w.label}
                  </Text>
                ))}
              </View>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
              <Text className="font-extrabold text-text mb-3">Large (4x2)</Text>
              {[0, 1].map((i) => (
                <View key={i} className="rounded-2xl mb-3 overflow-hidden" style={{ backgroundColor: colors.amberBg }}>
                  <View className="flex-row items-center justify-between p-4">
                    <View className="flex-1">
                      <Text className="text-lg font-extrabold text-text">8 weeks, 1 days</Text>
                      <Text className="text-xs text-muted font-semibold">Baby's Length: ~ 1.6 cm.</Text>
                      <Text className="text-xs text-muted font-semibold">Baby's Weight: ~ 1.7 g.</Text>
                      {i === 1 && (
                        <View className="flex-row items-center gap-1 mt-1">
                          <Icon name={ICONS.dueDate} size={12} color={colors.text} />
                          <Text className="text-xs font-bold text-text">Due: Oct 28, 2025</Text>
                        </View>
                      )}
                      <View className="mt-2 h-2 bg-white/60 rounded-full overflow-hidden">
                        <View className="h-full rounded-full" style={{ width: '15%', backgroundColor: colors.amber }} />
                      </View>
                    </View>
                    <View className="w-16 h-16 rounded-full bg-[#FBCFE8] items-center justify-center ml-3">
                      <Icon name={ICONS.goalPregnancy} size={32} color={colors.pinkDark} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {tab === 'Water' && (
          <>
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
              <Mascot className="absolute right-0 top-2" />
              <Text className="font-extrabold text-text mb-3">Medium (2x2)</Text>
              <View className="rounded-2xl overflow-hidden self-center" style={{ width: 160, backgroundColor: colors.blue }}>
                <View className="p-4 items-center">
                  <Icon name={ICONS.water} size={48} color="white" style={{ marginBottom: 8 }} />
                  <Text className="text-xl font-extrabold text-white">800 ml – 40%</Text>
                  <Text className="text-xs text-white/80 font-semibold mb-2">Remaining: 1200 ml</Text>
                  <View className="w-full h-2.5 bg-white/30 rounded-full overflow-hidden">
                    <View className="h-full rounded-full bg-pink-primary" style={{ width: '40%' }} />
                  </View>
                </View>
              </View>
              <Text className="text-center text-xs font-semibold text-muted mt-2">Drink Water</Text>
            </View>

            <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
              <Text className="font-extrabold text-text mb-3">Large (4x2)</Text>
              <LinearGradient
                colors={[colors.blueDark, colors.blueLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, overflow: 'hidden', padding: 20 }}
              >
                <Text className="text-sm text-white/80 font-semibold mb-1">Water consumed this day</Text>
                <Text className="text-4xl font-extrabold text-white mb-1">
                  800 <Text className="text-xl font-bold text-white/80">/ 2000 ml</Text>
                </Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-bold text-white">40%</Text>
                  <Text className="text-xs text-white/80 font-semibold">Remaining: 1200 ml</Text>
                </View>
                <View className="h-2.5 bg-white/30 rounded-full overflow-hidden">
                  <View className="h-full rounded-full bg-pink-primary" style={{ width: '40%' }} />
                </View>
              </LinearGradient>
              <Text className="text-center text-xs font-semibold text-muted mt-2">Drink Water</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
