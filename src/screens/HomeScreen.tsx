import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { StatCard } from '@/components/StatCard';
import { Icon } from '@/components/Icon';
import { ICONS } from '@/theme/icon-map';
import type { AppNavigationProp } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useCycleData, formatDateKey } from '@/hooks/useCycleData';
import { useDailyLog } from '@/hooks/useDailyLog';

const CIRCUMFERENCE = 2 * Math.PI * 80; // r = 80

export function HomeScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const { userName } = useAuth();
  const { profile } = useProfile();
  const todayStr = useMemo(() => formatDateKey(new Date()), []);
  const { dailyLog } = useDailyLog(todayStr);

  const {
    currentCycleDay,
    periodDayNumber,
    cycleLength,
    periodLength,
    pregnancyChance,
    cycleHistory,
    isDatePeriod,
  } = useCycleData(new Date());

  const [widgetPage, setWidgetPage] = useState(0);

  // Dynamic weekly strip
  const { weekDays, weekDates, rawDates } = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday
    const startOfWeek = new Date(now);
    // Start week on Monday
    const distanceToMonday = (currentDayOfWeek + 6) % 7;
    startOfWeek.setDate(now.getDate() - distanceToMonday);

    const daysLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const dates: number[] = [];
    const fullDates: Date[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d.getDate());
      fullDates.push(d);
    }

    return { weekDays: daysLabels, weekDates: dates, rawDates: fullDates };
  }, []);

  const periodArc = ((periodLength || 5) / (cycleLength || 28)) * CIRCUMFERENCE;
  const fertileArc = (6 / (cycleLength || 28)) * CIRCUMFERENCE;

  const symptomCount = (dailyLog.symptoms?.length || 0) + (dailyLog.moods?.length || 0);

  const symptomChips = [
    { label: 'Symptoms', count: symptomCount > 0 ? `+${symptomCount}` : '+0', icon: ICONS.people },
    { label: 'Ovulation', count: `${cycleLength - 14}`, icon: ICONS.cycle },
    { label: 'Cycle Day', count: `${currentCycleDay}`, icon: ICONS.flash },
  ];

  const displayName = profile?.full_name || userName || 'Monalisa';

  return (
    <View className="flex-1 bg-bg">
      <SafeAreaView edges={['top']} className="bg-white px-4 pb-4">
        <View className="flex-row items-center justify-between mb-3 pt-2">
          <View>
            <Text className="text-sm font-semibold text-muted">Hi {displayName},</Text>
            <Text className="text-lg font-extrabold text-text">Your current cycle</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => navigation.navigate('AIHealthAssistant')}
              className="w-9 h-9 rounded-full bg-pink-light items-center justify-center"
            >
              <Icon name={ICONS.sparkles} size={18} color={colors.pinkPrimary} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Profile')}
              className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
            >
              <Icon name={ICONS.settings} size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Cycle wheel */}
        <View className="items-center justify-center my-2">
          <View className="items-center justify-center">
            <Svg width={160} height={160} viewBox="0 0 180 180">
              <Circle cx={90} cy={90} r={80} fill="none" stroke={colors.pinkLight} strokeWidth={14} />
              <Circle
                cx={90}
                cy={90}
                r={80}
                fill="none"
                stroke={colors.pinkPrimary}
                strokeWidth={14}
                strokeDasharray={`${periodArc} ${CIRCUMFERENCE - periodArc}`}
                strokeDashoffset={125}
                strokeLinecap="round"
                rotation={-90}
                origin="90, 90"
              />
              <Circle
                cx={90}
                cy={90}
                r={80}
                fill="none"
                stroke={colors.teal}
                strokeWidth={10}
                strokeDasharray={`${fertileArc} ${CIRCUMFERENCE - fertileArc}`}
                strokeDashoffset={CIRCUMFERENCE - periodArc - 30}
                strokeLinecap="round"
                rotation={-90}
                origin="90, 90"
              />
            </Svg>
            <View className="absolute items-center">
              <Text className="text-2xl font-extrabold text-text">Day {currentCycleDay}</Text>
              <Text className="text-xs font-bold text-pink-primary">
                {periodDayNumber ? `Period Day ${periodDayNumber}` : 'Cycle Day ' + currentCycleDay}
              </Text>
              <Text className="text-[10px] font-semibold text-muted mt-0.5 text-center px-6">
                {pregnancyChance} chance to get pregnant
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3 justify-center mb-3">
          <Pressable
            onPress={() => navigation.navigate('LogPeriod')}
            className="px-5 py-2 rounded-full border-2 border-pink-primary"
          >
            <Text className="text-pink-primary text-sm font-bold">Edit period</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('CycleInfo')}
            className="px-5 py-2 rounded-full bg-pink-primary"
          >
            <Text className="text-white text-sm font-bold">Details</Text>
          </Pressable>
        </View>

        {/* Weekly strip */}
        <View className="flex-row justify-between gap-1">
          {weekDays.map((d, i) => {
            const dateNum = weekDates[i];
            const rawDate = rawDates[i];
            const isPeriod = isDatePeriod(rawDate);
            const isToday = rawDate.toDateString() === new Date().toDateString();
            return (
              <View key={i} className="items-center gap-0.5">
                <Text className="text-[10px] font-bold text-muted">{d}</Text>
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isToday ? 'bg-pink-primary' : isPeriod ? 'bg-pink-light' : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isToday ? 'text-white' : isPeriod ? 'text-pink-dark' : 'text-text'
                    }`}
                  >
                    {dateNum}
                  </Text>
                </View>
                {isPeriod && <View className="w-1.5 h-1.5 rounded-full bg-pink-primary" />}
              </View>
            );
          })}
        </View>
      </SafeAreaView>

      {/* Scrollable body */}
      <ScrollView className="flex-1 px-4" contentContainerClassName="py-3 pb-24">
        {/* Symptom stat chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2 items-center">
            {symptomChips.map((c, i) => (
              <Pressable
                key={i}
                onPress={() => navigation.navigate('SymptomsLog')}
                className="bg-white rounded-2xl p-3 items-center min-w-[90px] shadow-sm border border-pink-light"
              >
                {i === 0 ? (
                  <View className="flex-row items-center gap-1 mb-1">
                    <Icon name={c.icon} size={22} color={colors.text} />
                    <View className="w-6 h-6 rounded-full bg-teal items-center justify-center">
                      <Text className="text-white text-[10px] font-bold">{c.count}</Text>
                    </View>
                  </View>
                ) : (
                  <View className="w-10 h-10 rounded-full border-2 border-pink-primary items-center justify-center mb-1">
                    <Icon name={c.icon} size={20} color={colors.pinkPrimary} />
                  </View>
                )}
                <Text className="text-xs font-bold text-muted">{c.label}</Text>
                {i !== 0 && (
                  <Text className="text-base font-extrabold text-pink-primary">{c.count}</Text>
                )}
              </Pressable>
            ))}
            <Pressable
              onPress={() => navigation.navigate('SymptomsLog')}
              className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center"
            >
              <Icon name={ICONS.chevronForward} size={16} color="#6B7280" />
            </Pressable>
          </View>
        </ScrollView>

        {/* AI Health Assistant Banner */}
        <Pressable
          onPress={() => navigation.navigate('AIHealthAssistant')}
          className="bg-white rounded-2xl p-4 shadow-sm mb-3 border border-pink-light flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-pink-light items-center justify-center">
              <Icon name={ICONS.sparkles} size={20} color={colors.pinkPrimary} />
            </View>
            <View className="flex-1">
              <Text className="font-extrabold text-text text-sm">Ask CycleWise AI</Text>
              <Text className="text-xs text-muted font-medium">Empathetic cycle & symptom insights</Text>
            </View>
          </View>
          <Icon name={ICONS.chevronForward} size={16} color={colors.pinkPrimary} />
        </Pressable>

        {/* History */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Icon name={ICONS.history} size={20} color={colors.text} />
              <Text className="font-extrabold text-text">History</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('CycleInfo')} className="flex-row items-center gap-1">
              <Text className="text-sm font-bold text-pink-primary">See more</Text>
              <Icon name={ICONS.chevronForward} size={14} color={colors.pinkPrimary} />
            </Pressable>
          </View>

          {/* Current cycle bar */}
          <View className="mb-3">
            <Text className="font-bold text-sm text-text mb-1">
              Current cycle: {currentCycleDay} Days
            </Text>
            <Text className="text-xs text-muted font-semibold mb-2">
              {cycleLength} Day Cycle Goal
            </Text>
            <View className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="absolute left-0 h-full rounded-full bg-pink-primary items-center justify-center"
                style={{ width: `${Math.min(100, ((periodLength || 5) / (cycleLength || 28)) * 100)}%` }}
              >
                <Text className="text-white text-[10px] font-bold">{periodLength}</Text>
              </View>
              <View
                className="absolute h-full rounded-full bg-teal items-center justify-center"
                style={{
                  left: `${((periodLength || 5) / (cycleLength || 28)) * 100}%`,
                  width: `${(6 / (cycleLength || 28)) * 100}%`,
                }}
              >
                <Text className="text-white text-[10px] font-bold">10</Text>
              </View>
            </View>
          </View>

          {/* Previous cycle bar */}
          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-bold text-sm text-text">31 Days</Text>
              <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                <Icon name={ICONS.check} size={12} color="white" />
              </View>
            </View>
            <Text className="text-xs text-muted font-semibold mb-2">Previous Cycle Completed</Text>
            <View className="h-6 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="absolute left-0 h-full rounded-full bg-pink-primary items-center justify-center"
                style={{ width: '16%' }}
              >
                <Text className="text-white text-[10px] font-bold">5</Text>
              </View>
              <View
                className="absolute h-full rounded-full bg-teal items-center justify-center"
                style={{ left: '16%', width: '32%' }}
              >
                <Text className="text-white text-[10px] font-bold">10</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Home screen widget */}
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          <View className="flex-row items-center gap-2 mb-3">
            <Icon name={ICONS.grid} size={18} color={colors.text} />
            <Text className="font-extrabold text-text">Home screen widget</Text>
          </View>

          {widgetPage === 0 && (
            <LinearGradient
              colors={[colors.pinkLight, colors.pinkPastelLight, colors.lightBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, overflow: 'hidden', padding: 16 }}
            >
              <Text className="text-lg font-extrabold text-text">Cycle day {currentCycleDay}</Text>
              <Text className="text-sm font-semibold text-muted mb-3">
                {pregnancyChance} chance to get pregnant
              </Text>
              <View className="h-3 bg-white/50 rounded-full mt-4">
                <View className="absolute left-0 h-full w-1/4 bg-pink-primary rounded-full" />
                <View
                  className="absolute w-4 h-4 rounded-full bg-pink-primary border-2 border-white"
                  style={{ left: '25%', top: '50%', marginTop: -8, marginLeft: -8 }}
                />
                <View className="absolute h-full bg-teal/60 rounded-full" style={{ left: '25%', width: '40%' }} />
                <View
                  className="absolute w-4 h-4 rounded-full bg-teal border-2 border-white"
                  style={{ left: '65%', top: '50%', marginTop: -8, marginLeft: -8 }}
                />
              </View>
              <View className="flex-row justify-end mt-2 gap-1 opacity-30">
                <Icon name={ICONS.heart} size={10} color={colors.pinkPrimary} />
                <Icon name={ICONS.heart} size={10} color={colors.pinkPrimary} />
                <Icon name={ICONS.heartOutline} size={10} color={colors.pinkPrimary} />
              </View>
            </LinearGradient>
          )}
          {widgetPage === 1 && (
            <View className="rounded-2xl bg-pink-primary p-4">
              <Text className="text-base font-extrabold text-white">Period Tracking</Text>
              <Text className="text-xs text-white/80 font-semibold">
                Day {currentCycleDay} of {cycleLength}
              </Text>
            </View>
          )}
          {widgetPage === 2 && (
            <View className="rounded-2xl bg-[#2196F3] p-4">
              <Text className="text-base font-extrabold text-white">Water Intake</Text>
              <Text className="text-xs text-white/80 font-semibold">
                {dailyLog.water_ml ?? 800} / 2000 ml
              </Text>
            </View>
          )}

          <View className="flex-row justify-center gap-1.5 mt-3">
            {[0, 1, 2].map((i) => (
              <Pressable
                key={i}
                onPress={() => setWidgetPage(i)}
                className={`h-2 rounded-full ${widgetPage === i ? 'bg-pink-primary w-4' : 'bg-gray-300 w-2'}`}
              />
            ))}
          </View>

          <View className="flex-row gap-2 mt-3">
            <Pressable
              onPress={() => navigation.navigate('Widgets')}
              className="flex-1 py-2.5 rounded-full border-2 border-pink-primary items-center"
            >
              <Text className="text-pink-primary text-sm font-bold">More Widgets</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('SymptomsLog')}
              className="flex-1 py-2.5 rounded-full bg-pink-primary items-center"
            >
              <Text className="text-white text-sm font-bold">Add</Text>
            </Pressable>
          </View>
        </View>

        {/* Quick stats */}
        <View className="flex-row gap-2">
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
      </ScrollView>
    </View>
  );
}
