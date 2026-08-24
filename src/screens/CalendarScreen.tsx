import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Mascot } from '@/components/Mascot';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import { colors } from '@/theme/colors';
import type { AppNavigationProp } from '@/navigation/types';
import { useCycleData } from '@/hooks/useCycleData';
import { useHealth } from '@/context/HealthContext';
import { useTheme } from '@/context/ThemeContext';
import { getMonthGrid, formatMonthYear, formatDateKey } from '@/utils/calendarGrid';

const DAY_HEADERS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const { currentLog, updateStat, updateDailyLog } = useHealth();
  const { isDark, themeColors } = useTheme();

  const weeks = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedDateStr = useMemo(() => {
    return formatDateKey(viewYear, viewMonth, selectedDay);
  }, [viewYear, viewMonth, selectedDay]);

  const { isDatePeriod, isDateFertile, isDateLogged, pregnancyChance } = useCycleData(
    new Date(viewYear, viewMonth, selectedDay)
  );

  const isSelectedPeriod = isDatePeriod(selectedDateStr);
  const isSelectedFertile = isDateFertile(selectedDateStr);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDay(now.getDate());
  };

  const loggedSymptoms = useMemo(() => {
    const list: string[] = [];
    if (currentLog?.flow) list.push(`Flow: ${currentLog.flow}`);
    if (currentLog?.symptoms) list.push(...currentLog.symptoms);
    if (currentLog?.moods) list.push(...currentLog.moods);
    if (currentLog?.physical_activity) list.push(...currentLog.physical_activity);
    return list;
  }, [currentLog]);

  const handleClearNote = () => {
    Alert.alert('Clear Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => updateDailyLog({ note: '' }),
      },
    ]);
  };

  return (
    <View className="flex-1 bg-bg dark:bg-dark-bg">
      <SafeAreaView edges={['top']} className="bg-card dark:bg-dark-card px-4 pb-3 border-b border-gray-100 dark:border-dark-border">
        <View className="flex-row items-center justify-between mb-4 pt-2">
          <Pressable
            onPress={() => navigation.navigate('CycleInfo')}
            className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-dark-border active:opacity-70"
          >
            <Text className="text-sm font-bold text-text dark:text-dark-text">Overview</Text>
          </Pressable>

          <View className="flex-row items-center gap-2">
            <Pressable onPress={handlePrevMonth} className="p-1 active:opacity-70">
              <Icon name={ICONS.back} size={18} color={isDark ? themeColors.text : colors.text} />
            </Pressable>
            <Text className="text-base font-extrabold text-text dark:text-dark-text min-w-[130px] text-center">
              {formatMonthYear(viewYear, viewMonth)}
            </Text>
            <Pressable onPress={handleNextMonth} className="p-1 active:opacity-70">
              <Icon name={ICONS.forward} size={18} color={isDark ? themeColors.text : colors.text} />
            </Pressable>
          </View>

          <Pressable
            onPress={handleJumpToday}
            className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-dark-border active:opacity-70"
          >
            <Text className="text-sm font-bold text-pink-primary">Today</Text>
          </Pressable>
        </View>

        <View className="flex-row mb-2">
          {DAY_HEADERS.map((d) => (
            <Text key={d} className="flex-1 text-center text-[10px] font-bold text-muted dark:text-dark-muted">
              {d}
            </Text>
          ))}
        </View>

        {weeks.map((week, wi) => (
          <View key={wi} className="flex-row mb-1">
            {week.map((day, di) => {
              if (!day) return <View key={di} className="flex-1" />;

              const dateStr = formatDateKey(viewYear, viewMonth, day);
              const isPeriod = isDatePeriod(dateStr);
              const isFertile = isDateFertile(dateStr);
              const isSelected = day === selectedDay;
              const isLogged = isDateLogged(dateStr);
              const isToday =
                day === today.getDate() &&
                viewMonth === today.getMonth() &&
                viewYear === today.getFullYear();

              return (
                <Pressable key={di} onPress={() => setSelectedDay(day)} className="flex-1 items-center py-1">
                  <View
                    className={`w-9 h-9 rounded-full items-center justify-center ${
                      isSelected
                        ? 'bg-pink-primary'
                        : isPeriod
                        ? 'bg-pink-light dark:bg-dark-card-hover'
                        : isFertile
                        ? 'bg-teal-light dark:bg-dark-card-hover'
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
                          : 'text-text dark:text-dark-text'
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

      <ScrollView className="flex-1 px-4" contentContainerClassName="py-4 pb-24" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-start justify-between mb-1">
          <View>
            <Text className="text-sm font-extrabold text-text dark:text-dark-text">
              {selectedDay} {new Date().toLocaleDateString('en-GB', { month: 'short' })} –{' '}
              {isSelectedPeriod
                ? 'Menstruation days'
                : isSelectedFertile
                ? 'Fertile window'
                : 'Follicular / Luteal'}
            </Text>
            <Text className="text-xs text-muted dark:text-dark-muted font-semibold mt-0.5">
              Pregnancy Chance {pregnancyChance}
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('LogPeriod')}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-dark-border active:opacity-70"
          >
            <Icon name={ICONS.edit} size={14} color={colors.pinkPrimary} />
            <Text className="text-xs font-bold text-pink-primary">Edit</Text>
          </Pressable>
        </View>

        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mt-3 border border-gray-100 dark:border-dark-border relative overflow-hidden">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bold text-sm text-text dark:text-dark-text">Symptoms and activities</Text>
            <View className="flex-row items-center gap-2">
              <Mascot className="scale-75 -mr-2" />
              <Pressable
                onPress={() => navigation.navigate('SymptomsLog')}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-dark-border items-center justify-center active:opacity-70"
              >
                <Icon name={ICONS.add} size={16} color={colors.pinkPrimary} />
              </Pressable>
            </View>
          </View>

          {loggedSymptoms.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {loggedSymptoms.map((s, i) => (
                <View key={i} className="px-3 py-1.5 rounded-full bg-pink-light dark:bg-dark-card-hover">
                  <Text className="text-xs font-bold text-pink-dark">{s}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="flex-row flex-wrap gap-2">
              {ACTIVITY_ICONS.slice(0, 8).map((icon, i) => (
                <View key={i} className="w-10 h-10 rounded-full bg-pink-light dark:bg-dark-card-hover items-center justify-center">
                  <Icon name={icon} size={18} color={colors.pinkDark} />
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="flex-row gap-2 mt-3">
          <StatCard
            label="Weight"
            value={currentLog?.weight ?? 45.6}
            unit="kg"
            icon={ICONS.weight}
            minRange={30}
            maxRange={200}
            onSave={(val) => updateStat('weight', val)}
          />
          <StatCard
            label="Temperature"
            value={currentLog?.temperature ?? 36.5}
            unit="C"
            icon={ICONS.temperature}
            minRange={35}
            maxRange={42}
            onSave={(val) => updateStat('temperature', val)}
          />
          <StatCard
            label="Sleep"
            value={currentLog?.sleep_minutes ?? 480}
            unit="min"
            icon={ICONS.sleep}
            minRange={0}
            maxRange={1440}
            onSave={(val) => updateStat('sleep_minutes', val)}
          />
          <StatCard
            label="Drink"
            value={currentLog?.water_ml ?? 460}
            unit="ml"
            icon={ICONS.drink}
            minRange={0}
            maxRange={10000}
            onSave={(val) => updateStat('water_ml', val)}
          />
        </View>

        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mt-3 border border-gray-100 dark:border-dark-border">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center gap-2">
              <Icon name={ICONS.note} size={18} color={colors.pinkPrimary} />
              <Text className="font-bold text-sm text-text dark:text-dark-text">Note</Text>
            </View>
            <View className="flex-row items-center gap-2">
              {Boolean(currentLog?.note) && (
                <Pressable
                  onPress={handleClearNote}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-card-hover items-center justify-center active:opacity-70"
                >
                  <Icon name="trash-outline" size={14} color="#EF4444" />
                </Pressable>
              )}
              <Pressable
                onPress={() => navigation.navigate('SymptomsLog')}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-dark-card-hover items-center justify-center active:opacity-70"
              >
                <Icon name={ICONS.edit} size={14} color={colors.pinkPrimary} />
              </Pressable>
            </View>
          </View>
          <Text className="text-sm text-text dark:text-dark-text font-semibold">
            {currentLog?.note || 'Log symptoms or make a note for this day'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

