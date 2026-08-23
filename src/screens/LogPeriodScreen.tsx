import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mascot } from '@/components/Mascot';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import type { AppNavigationProp } from '@/navigation/types';
import { useAuth } from '@/context/AuthContext';
import { upsertLocalDailyLog } from '@/db/sqlite';
import { syncService } from '@/services/syncService';

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
    <View className="mb-4">
      <Text className="text-center font-extrabold text-text mb-3">{label}</Text>
      <View className="flex-row mb-1">
        {HEADERS.map((h) => (
          <Text key={h} className="flex-1 text-center text-[10px] font-bold text-muted">
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
                <Text className={`text-xs font-bold mb-0.5 ${isSel ? 'text-pink-primary' : 'text-text'}`}>
                  {day}
                </Text>
                <Pressable
                  onPress={() => onToggle(key)}
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    isSel ? 'border-pink-primary bg-pink-primary' : 'border-gray-300 bg-white'
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
  const { userId } = useAuth();

  const [selected, setSelected] = useState<Set<string>>(
    new Set([
      '2026-07-20',
      '2026-07-21',
      '2026-07-22',
      '2026-07-23',
      '2026-07-24',
      '2026-08-19',
      '2026-08-20',
      '2026-08-21',
      '2026-08-22',
      '2026-08-23',
    ])
  );

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

  const handleSave = () => {
    if (userId) {
      selected.forEach((dateStr) => {
        upsertLocalDailyLog(
          {
            id: `${userId}_${dateStr}`,
            user_id: userId,
            log_date: dateStr,
            flow: 'Medium',
          },
          1
        );
      });
      syncService.syncPendingData().catch(console.warn);
    }
    navigation.goBack();
  };

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
          <Pressable onPress={() => navigation.goBack()} className="p-1">
            <Icon name={ICONS.back} size={22} color={colors.text} />
          </Pressable>
          <Text className="text-base font-extrabold text-text">Log Period</Text>
          <Pressable
            onPress={() => {
              const today = new Date().toISOString().split('T')[0];
              toggle(today);
            }}
            className="px-3 py-1.5 rounded-full border border-gray-200"
          >
            <Text className="text-xs font-bold text-text">Today</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1 px-4" contentContainerClassName="py-3 pb-32">
        <View>
          <Mascot className="self-end" />
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

      <SafeAreaView edges={['bottom']} className="absolute bottom-0 left-0 right-0 bg-bg px-4 pt-4">
        <Pressable
          onPress={handleSave}
          className="w-full py-4 rounded-full bg-pink-primary items-center shadow-md mb-4 active:opacity-90"
        >
          <Text className="text-white text-base font-bold">Save</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}
