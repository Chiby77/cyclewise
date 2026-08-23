import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mascot } from '@/components/Mascot';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import type { AppNavigationProp } from '@/navigation/types';
import { useCycleData, formatDateKey } from '@/hooks/useCycleData';
import { useDailyLog } from '@/hooks/useDailyLog';

const DAY_HEADERS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const WEEKS: (number | null)[][] = [
  [null, null, null, null, 1, 2, 3],
  [4, 5, 6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24],
  [25, 26, 27, 28, 29, 30, 31],
];

const ACTIVITY_ICONS = [
  ICONS.heart,
  ICONS.cramps,
  ICONS.sleep,
  ICONS.dance,
  ICONS.toys,
  ICONS.flowMedium,
  ICONS.cravings,
  ICONS.constipation,
  ICONS.oralSex,
  ICONS.meditation,
  ICONS.water,
];

export function CalendarScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const [selectedDay, setSelectedDay] = useState(new Date().getDate() || 21);

  const selectedDateStr = useMemo(() => {
    const d = new Date();
    d.setDate(selectedDay);
    return formatDateKey(d);
  }, [selectedDay]);

  const { isDatePeriod, isDateFertile, isDateLogged, pregnancyChance } = useCycleData(new Date());
  const { dailyLog } = useDailyLog(selectedDateStr);

  const isSelectedPeriod = isDatePeriod(selectedDateStr);
  const isSelectedFertile = isDateFertile(selectedDateStr);

  const loggedSymptoms = useMemo(() => {
    const list: string[] = [];
    if (dailyLog.flow) list.push(`Flow: ${dailyLog.flow}`);
    if (dailyLog.symptoms) list.push(...dailyLog.symptoms);
    if (dailyLog.moods) list.push(...dailyLog.moods);
    if (dailyLog.physical_activity) list.push(...dailyLog.physical_activity);
    return list;
  }, [dailyLog]);

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-white px-4 pb-3">
        <View className="flex-row items-center justify-between mb-4 pt-2">
          <Pressable
            onPress={() => navigation.navigate('CycleInfo')}
            className="px-4 py-1.5 rounded-full border border-gray-200"
          >
            <Text className="text-sm font-bold text-text">Overview</Text>
          </Pressable>
          <View className="flex-row items-center gap-1">
            <Text className="text-lg font-extrabold text-text">
              {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </Text>
            <Icon name={ICONS.chevronDown} size={16} color={colors.text} />
          </View>
          <Pressable
            onPress={() => setSelectedDay(new Date().getDate())}
            className="px-4 py-1.5 rounded-full border border-gray-200"
          >
            <Text className="text-sm font-bold text-text">Today</Text>
          </Pressable>
        </View>

        <View className="flex-row mb-2">
          {DAY_HEADERS.map((d) => (
            <Text key={d} className="flex-1 text-center text-[10px] font-bold text-muted">
              {d}
            </Text>
          ))}
        </View>

        {WEEKS.map((week, wi) => (
          <View key={wi} className="flex-row mb-1">
            {week.map((day, di) => {
              if (!day) return <View key={di} className="flex-1" />;

              const d = new Date();
              d.setDate(day);
              const dateStr = formatDateKey(d);

              const isPeriod = isDatePeriod(dateStr);
              const isFertile = isDateFertile(dateStr);
              const isSelected = day === selectedDay;
              const isLogged = isDateLogged(dateStr);
              const isToday = day === new Date().getDate();

              return (
                <Pressable key={di} onPress={() => setSelectedDay(day)} className="flex-1 items-center py-1">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      isSelected
                        ? 'bg-pink-primary'
                        : isPeriod
                        ? 'bg-pink-light'
                        : isFertile
                        ? 'bg-teal-light'
                        : ''
                    }`}
                    style={
                      isToday && !isSelected
                        ? { borderWidth: 2, borderColor: '#F06292', borderStyle: 'dashed' }
                        : undefined
                    }
                  >
                    <Text
                      className={`text-sm font-bold ${
                        isSelected
                          ? 'text-white'
                          : isPeriod
                          ? 'text-pink-dark'
                          : isFertile
                          ? 'text-teal-dark'
                          : 'text-text'
                      }`}
                    >
                      {day}
                    </Text>
                    {isLogged && (
                      <View className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-pink-dark items-center justify-center">
                        <Icon name={ICONS.check} size={8} color="white" />
                      </View>
                    )}
                  </View>
                  {isToday && <View className="w-1 h-1 rounded-full bg-pink-primary mt-0.5" />}
                </Pressable>
              );
            })}
          </View>
        ))}
      </SafeAreaView>

      <ScrollView className="flex-1 px-4" contentContainerClassName="py-4 pb-24">
        <View className="flex-row items-start justify-between mb-1">
          <View>
            <Text className="text-sm font-extrabold text-text">
              {selectedDay} {new Date().toLocaleDateString('en-GB', { month: 'short' })} –{' '}
              {isSelectedPeriod
                ? 'Menstruation days'
                : isSelectedFertile
                ? 'Fertile window'
                : 'Follicular / Luteal'}
            </Text>
            <Text className="text-xs text-muted font-semibold mt-0.5">
              Pregnancy Chance {pregnancyChance}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('LogPeriod')}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200"
          >
            <Icon name={ICONS.edit} size={14} color={colors.text} />
            <Text className="text-xs font-bold text-text">Edit</Text>
          </Pressable>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm mt-3">
          <Mascot className="absolute right-0 -top-6 z-10" />
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bold text-sm text-text">Symptoms and activities</Text>
            <Pressable
              onPress={() => navigation.navigate('SymptomsLog')}
              className="w-8 h-8 rounded-full border border-gray-200 items-center justify-center"
            >
              <Icon name={ICONS.add} size={16} color="#6B7280" />
            </Pressable>
          </View>

          {loggedSymptoms.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {loggedSymptoms.map((s, i) => (
                <View key={i} className="px-3 py-1.5 rounded-full bg-pink-light">
                  <Text className="text-xs font-bold text-pink-dark">{s}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {ACTIVITY_ICONS.slice(0, 8).map((icon, i) => (
                <View key={i} className="w-10 h-10 rounded-full bg-pink-light items-center justify-center">
                  <Icon name={icon} size={18} color={colors.pinkDark} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="flex-row gap-2 mt-3">
          <StatCard
            label="Weight"
            value={dailyLog.weight ? String(dailyLog.weight) : '45.6'}
            unit="kg"
            icon={ICONS.weight}
          />
          <StatCard
            label="Temperature"
            value={dailyLog.temperature ? String(dailyLog.temperature) : '36.5'}
            unit="C"
            icon={ICONS.temperature}
          />
          <StatCard
            label="Sleep"
            value={dailyLog.sleep_minutes ? String(dailyLog.sleep_minutes) : '480'}
            unit="min"
            icon={ICONS.sleep}
          />
          <StatCard
            label="Drink"
            value={dailyLog.water_ml ? String(dailyLog.water_ml) : '460'}
            unit="ml"
            icon={ICONS.drink}
          />
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm mt-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Icon name={ICONS.note} size={18} color={colors.text} />
              <Text className="font-bold text-sm text-text">Note</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('SymptomsLog')}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Icon name={ICONS.edit} size={14} color="#6B7280" />
            </Pressable>
          </View>
          <Text className="text-sm text-text font-semibold">
            {dailyLog.note || 'Log symptoms or make a note for this day'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
