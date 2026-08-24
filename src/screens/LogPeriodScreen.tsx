import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mascot } from '@/components/Mascot';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import type { AppNavigationProp } from '@/navigation/types';
import { useHealth } from '@/context/HealthContext';

const HEADERS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const JUL_DAYS: (number | null)[][] = [
  [null, null, 1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10, 11, 12],
  [13, 14, 15, 16, 17, 18, 19],
  [20, 21, 22, 23, 24, 25, null],
  [26, 27, 28, 29, 30, 31, null],
];

const AUG_DAYS: (number | null)[][] = [
  [null, null, null, null, null, null, 1],
  [2, 3, 4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22],
  [23, 24, 25, 26, 27, 28, 29],
  [30, 31, null, null, null, null, null],
];

function MonthGrid({
  label,
  month,
  year,
  weeks,
  selected,
  onToggle,
}: {
  label: string;
  month: string;
  year: string;
  weeks: (number | null)[][];
  selected: Set<string>;
  onToggle: (key: string) => void;
}) {
  return (
    <View className="mb-4 bg-card dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-dark-border">
      <Text className="text-center font-extrabold text-text dark:text-dark-text mb-3">{label}</Text>
      <View className="flex-row mb-1">
        {HEADERS.map((h) => (
          <Text key={h} className="flex-1 text-center text-[10px] font-bold text-muted dark:text-dark-muted">
            {h}
          </Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} className="flex-row mb-1">
          {week.map((day, di) => {
            if (!day) return <View key={di} className="flex-1" />;
            const key = `${year}-${month}-${String(day).padStart(2, '0')}`;
            const isSel = selected.has(key);
            return (
              <View key={di} className="flex-1 items-center py-0.5">
                <Text className={`text-xs font-bold mb-0.5 ${isSel ? 'text-pink-primary' : 'text-text dark:text-dark-text'}`}>
                  {day}
                </Text>
                <Pressable
                  onPress={() => onToggle(key)}
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    isSel ? 'border-pink-primary bg-pink-primary' : 'border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card'
                  }`}
                >
                  {isSel && <Icon name={ICONS.check} size={12} color="white" />}
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function LogPeriodScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const { periodDays, setPeriodDates } = useHealth();

  const [selected, setSelected] = useState<Set<string>>(() => new Set(periodDays));

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSave = async () => {
    await setPeriodDates(Array.from(selected));
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-bg dark:bg-dark-bg">
      <SafeAreaView edges={['top']} className="bg-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border">
        <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
          <Pressable onPress={() => navigation.goBack()} className="p-1 active:opacity-70">
            <Icon name={ICONS.back} size={22} color={colors.pinkPrimary} />
          </Pressable>
          <Text className="text-base font-extrabold text-text dark:text-dark-text">Log Period</Text>
          <Pressable
            onPress={() => {
              const today = new Date().toISOString().split('T')[0];
              toggle(today);
            }}
            className="px-3 py-1.5 rounded-full border border-gray-200 dark:border-dark-border active:opacity-70"
          >
            <Text className="text-xs font-bold text-pink-primary">Today</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4" contentContainerClassName="py-3 pb-32" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-end mb-2">
          <Mascot />
        </View>
        <MonthGrid
          label="July 2026"
          month="07"
          year="2026"
          weeks={JUL_DAYS}
          selected={selected}
          onToggle={toggle}
        />
        <MonthGrid
          label="August 2026"
          month="08"
          year="2026"
          weeks={AUG_DAYS}
          selected={selected}
          onToggle={toggle}
        />
      </ScrollView>

      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 bg-card dark:bg-dark-card border-t border-gray-100 dark:border-dark-border px-4 pt-4">
        <Pressable
          onPress={handleSave}
          className="w-full py-4 rounded-full bg-pink-primary items-center shadow-md mb-4 active:opacity-90"
        >
          <Text className="text-white text-base font-bold">Save Changes</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
