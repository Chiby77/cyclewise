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
import { useHealth } from '@/context/HealthContext';
import { useTheme } from '@/context/ThemeContext';

import { PadReminderModal } from '@/components/PadReminderModal';
import {
  getPadReminderConfig,
  logProductChange,
  type PadReminderConfig,
} from '@/services/padReminderService';

const CIRCUMFERENCE = 2 * Math.PI * 80;

export function HomeScreen() {
  const navigation = useNavigation<AppNavigationProp>();
  const { userName } = useAuth();
  const { profile } = useProfile();
  const { currentLog, updateStat } = useHealth();
  const { isDark, themeColors } = useTheme();

  const todayStr = useMemo(() => formatDateKey(new Date()), []);

  const {
    currentCycleDay,
    periodDayNumber,
    cycleLength,
    periodLength,
    pregnancyChance,
    isDatePeriod,
  } = useCycleData(new Date());

  const [widgetPage, setWidgetPage] = useState(0);
  const [padModalVisible, setPadModalVisible] = useState(false);
  const [padConfig, setPadConfig] = useState<PadReminderConfig | null>(null);

  const activeGoal = profile?.goal || 'Track My Cycle';

  const isPeriodActiveToday = isDatePeriod(todayStr) || Boolean(periodDayNumber);
  const isHeavyFlow = currentLog?.flow === 'Heavy' || currentLog?.flow === 'Blood Clots';

  React.useEffect(() => {
    getPadReminderConfig().then(setPadConfig);
  }, []);

  const handleLogChange = async () => {
    const updated = await logProductChange(padConfig?.productType, isPeriodActiveToday, isHeavyFlow);
    setPadConfig(updated);
  };

  const wearTimeInfo = useMemo(() => {
    if (!padConfig?.lastChangedTimestamp) {
      return { elapsedText: 'Not logged today', hoursElapsed: 0, isNearingCeiling: false };
    }
    const diffMs = Date.now() - padConfig.lastChangedTimestamp;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const hours = Math.floor(diffHours);

    const elapsedText =
      hours > 0 ? `${hours}h ${diffMinutes}m ago` : `${diffMinutes}m ago`;

    const isNearingCeiling = padConfig.productType === 'Tampon' && diffHours >= 6;

    return { elapsedText, hoursElapsed: diffHours, isNearingCeiling };
  }, [padConfig]);

  // Dynamic weekly strip
  const { weekDays, weekDates, rawDates } = useMemo(() => {
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 is Sunday
    const startOfWeek = new Date(now);
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

  const symptomCount =
    (currentLog?.symptoms?.length || 0) +
    (currentLog?.moods?.length || 0) +
    (currentLog?.sex_activity?.length || 0);

  const symptomChips = [
    { label: 'Symptoms', count: symptomCount > 0 ? `+${symptomCount}` : '+0', icon: ICONS.people },
    { label: 'Ovulation', count: `${cycleLength - 14}`, icon: ICONS.cycle },
    { label: 'Cycle Day', count: `${currentCycleDay}`, icon: ICONS.flash },
  ];

  const displayName = profile?.full_name || userName || 'Monalisa';

  return (
    <View className="flex-1 bg-bg dark:bg-dark-bg">
      <SafeAreaView edges={['top']} className="bg-card dark:bg-dark-card px-4 pb-4 border-b border-gray-100 dark:border-dark-border">
        <View className="flex-row items-center justify-between mb-3 pt-2">
          <View>
            <Text className="text-sm font-semibold text-muted dark:text-dark-muted">Hi {displayName},</Text>
            <Text className="text-lg font-extrabold text-text dark:text-dark-text">
              {activeGoal === 'Track My Pregnancy'
                ? 'Your Pregnancy Overview'
                : activeGoal === 'Try to conceive'
                ? 'Conception Tracker'
                : 'Your current cycle'}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => navigation.navigate('AIHealthAssistant')}
              className="w-9 h-9 rounded-full bg-pink-light dark:bg-dark-card-hover items-center justify-center active:opacity-80"
            >
              <Icon name={ICONS.sparkles} size={18} color={colors.pinkPrimary} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Account')}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-dark-card-hover items-center justify-center active:opacity-80"
            >
              <Icon name={ICONS.settings} size={18} color={isDark ? themeColors.text : colors.text} />
            </Pressable>
          </View>
        </View>

        {activeGoal === 'Track My Pregnancy' ? (
          <View className="bg-pink-soft dark:bg-dark-card-hover rounded-2xl p-4 my-2 border border-pink-light dark:border-dark-border items-center gap-2">
            <View className="flex-row items-center gap-2">
              <Icon name={ICONS.goalPregnancy} size={24} color={colors.pinkPrimary} />
              <Text className="text-base font-extrabold text-text dark:text-dark-text">Pregnancy Progress</Text>
            </View>

            <View className="flex-row justify-around w-full mt-2">
              <View className="items-center">
                <Text className="text-xs text-muted dark:text-dark-muted font-bold">Gestational Age</Text>
                <Text className="text-xl font-extrabold text-pink-primary mt-0.5">14 Wks 3 Days</Text>
              </View>
              <View className="w-px h-10 bg-gray-200 dark:bg-dark-border" />
              <View className="items-center">
                <Text className="text-xs text-muted dark:text-dark-muted font-bold">Due Date</Text>
                <Text className="text-xl font-extrabold text-teal-dark mt-0.5">Nov 18, 2026</Text>
              </View>
            </View>

            <View className="w-full bg-white dark:bg-dark-card p-3 rounded-xl mt-2 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-full bg-pink-light items-center justify-center">
                <Text className="text-base">🍋</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-text dark:text-dark-text">Baby Size: Lemon</Text>
                <Text className="text-[11px] text-muted dark:text-dark-muted font-semibold">
                  Approx. 8.5 cm length • Trimester 2
                </Text>
              </View>
            </View>

            <Text className="text-[10px] text-muted dark:text-dark-muted font-semibold italic mt-1">
              Estimate only — not a substitute for medical advice.
            </Text>
          </View>
        ) : activeGoal === 'Try to conceive' ? (
          <View className="bg-tealLight dark:bg-dark-card-hover rounded-2xl p-4 my-2 border border-teal dark:border-dark-border items-center gap-2">
            <View className="flex-row items-center gap-2">
              <Icon name={ICONS.goalConceive} size={24} color={colors.tealDark} />
              <Text className="text-base font-extrabold text-text dark:text-dark-text">Fertile Window Prediction</Text>
            </View>

            <View className="items-center my-1">
              <Text className="text-2xl font-extrabold text-teal-dark">High Fertility Window</Text>
              <Text className="text-xs font-bold text-text dark:text-dark-text mt-1">
                Predicted Ovulation: Day {cycleLength - 14}
              </Text>
            </View>

            <View className="w-full bg-white dark:bg-dark-card p-3 rounded-xl flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Icon name={ICONS.cycle} size={20} color={colors.teal} />
                <Text className="text-xs font-bold text-text dark:text-dark-text">Fertile Days</Text>
              </View>
              <Text className="text-xs font-extrabold text-teal-dark">Days {cycleLength - 19} – {cycleLength - 13}</Text>
            </View>

            <Text className="text-[10px] text-muted dark:text-dark-muted font-semibold italic">
              Estimate only — not a substitute for medical advice.
            </Text>
          </View>
        ) : (
          /* Standard Cycle Wheel (Track My Cycle) */
          <View className="items-center justify-center my-2">
            <View className="items-center justify-center">
              <Svg width={160} height={160} viewBox="0 0 180 180">
                <Circle cx={90} cy={90} r={80} fill="none" stroke={isDark ? '#2A2A30' : colors.pinkLight} strokeWidth={14} />
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
                <Text className="text-2xl font-extrabold text-text dark:text-dark-text">Day {currentCycleDay}</Text>
                <Text className="text-xs font-bold text-pink-primary">
                  {periodDayNumber ? `Period Day ${periodDayNumber}` : 'Cycle Day ' + currentCycleDay}
                </Text>
                <Text className="text-[10px] font-semibold text-muted dark:text-dark-muted mt-0.5 text-center px-6">
                  {pregnancyChance} chance to get pregnant
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="flex-row gap-3 justify-center mb-3 mt-1">
          <Pressable
            onPress={() => navigation.navigate('LogPeriod')}
            className="px-5 py-2 rounded-full border-2 border-pink-primary active:opacity-80"
          >
            <Text className="text-pink-primary text-sm font-bold">Edit period</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('CycleInfo')}
            className="px-5 py-2 rounded-full bg-pink-primary active:opacity-80"
          >
            <Text className="text-white text-sm font-bold">Details</Text>
          </Pressable>
        </View>

        <View className="flex-row justify-between gap-1">
          {weekDays.map((d, i) => {
            const dateNum = weekDates[i];
            const rawDate = rawDates[i];
            const isPeriod = isDatePeriod(rawDate);
            const isToday = rawDate.toDateString() === new Date().toDateString();
            return (
              <View key={i} className="items-center gap-0.5">
                <Text className="text-[10px] font-bold text-muted dark:text-dark-muted">{d}</Text>
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    isToday ? 'bg-pink-primary' : isPeriod ? 'bg-pink-light dark:bg-dark-card-hover' : ''
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isToday ? 'text-white' : isPeriod ? 'text-pink-dark' : 'text-text dark:text-dark-text'
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

      <ScrollView className="flex-1 px-4" contentContainerClassName="py-3 pb-24" showsVerticalScrollIndicator={false}>

        {isPeriodActiveToday && (
          <View className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mb-3 border border-pink-light dark:border-dark-border">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2 flex-1 pr-2">
                <Icon name={ICONS.flowMedium} size={18} color={colors.pinkPrimary} />
                <Text className="font-extrabold text-text dark:text-dark-text text-sm" numberOfLines={1}>
                  {padConfig?.productType || 'Pad'} Change Tracker
                </Text>
              </View>
              <Pressable
                onPress={() => setPadModalVisible(true)}
                className="p-1.5 rounded-full bg-gray-100 dark:bg-dark-card-hover active:opacity-70"
                accessibilityLabel="Reminder settings"
              >
                <Icon name="options-outline" size={16} color={colors.pinkPrimary} />
              </Pressable>
            </View>

            <View className="flex-row flex-wrap items-center justify-between gap-3 py-1">
              <View className="min-w-[120px]">
                <Text className="text-xs text-muted dark:text-dark-muted font-semibold">Last changed:</Text>
                <Text className="text-base font-extrabold text-text dark:text-dark-text mt-0.5">
                  {wearTimeInfo.elapsedText}
                </Text>
              </View>
              <Pressable
                onPress={handleLogChange}
                className="px-4 py-2.5 rounded-full bg-pink-primary items-center active:opacity-80 shadow-sm"
                accessibilityLabel="Log a product change now"
              >
                <Text className="text-white text-xs font-bold">✓ Logged a change</Text>
              </Pressable>
            </View>

            {wearTimeInfo.isNearingCeiling && (
              <View className="mt-2.5 p-2.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-800 flex-row items-center gap-2">
                <Icon name="alert-circle-outline" size={16} color="#EF4444" />
                <Text className="text-xs font-bold text-red-600 dark:text-red-400 flex-1">
                  Tampon worn for &gt;6 hours. Change soon (max 8h TSS limit).
                </Text>
              </View>
            )}
          </View>
        )}

        <PadReminderModal
          visible={padModalVisible}
          onClose={() => setPadModalVisible(false)}
          isPeriodActive={isPeriodActiveToday}
          isHeavyFlow={isHeavyFlow}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <View className="flex-row gap-2 items-center">
            {symptomChips.map((c, i) => (
              <Pressable
                key={i}
                onPress={() => navigation.navigate('SymptomsLog')}
                className="bg-card dark:bg-dark-card rounded-2xl p-3 items-center min-w-[90px] shadow-sm border border-pink-light dark:border-dark-border active:opacity-80"
              >
                {i === 0 ? (
                  <View className="flex-row items-center gap-1 mb-1">
                    <Icon name={c.icon} size={22} color={isDark ? themeColors.text : colors.text} />
                    <View className="w-6 h-6 rounded-full bg-teal items-center justify-center">
                      <Text className="text-white text-[10px] font-bold">{c.count}</Text>
                    </View>
                  </View>
                ) : (
                  <View className="w-10 h-10 rounded-full border-2 border-pink-primary items-center justify-center mb-1">
                    <Icon name={c.icon} size={20} color={colors.pinkPrimary} />
                  </View>
                )}
                <Text className="text-xs font-bold text-muted dark:text-dark-muted">{c.label}</Text>
                {i !== 0 && (
                  <Text className="text-base font-extrabold text-pink-primary">{c.count}</Text>
                )}
              </Pressable>
            ))}
            <Pressable
              onPress={() => navigation.navigate('SymptomsLog')}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-card-hover items-center justify-center active:opacity-80"
            >
              <Icon name={ICONS.chevronForward} size={16} color="#6B7280" />
            </Pressable>
          </View>
        </ScrollView>

        <Pressable
          onPress={() => navigation.navigate('AIHealthAssistant')}
          className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mb-3 border border-pink-light dark:border-dark-border flex-row items-center justify-between active:opacity-80"
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-pink-light dark:bg-dark-card-hover items-center justify-center">
              <Icon name={ICONS.sparkles} size={20} color={colors.pinkPrimary} />
            </View>
            <View className="flex-1">
              <Text className="font-extrabold text-text dark:text-dark-text text-sm">Ask CycleWise AI</Text>
              <Text className="text-xs text-muted dark:text-dark-muted font-medium">Empathetic cycle & symptom insights</Text>
            </View>
          </View>
          <Icon name={ICONS.chevronForward} size={16} color={colors.pinkPrimary} />
        </Pressable>

        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mb-3 border border-gray-100 dark:border-dark-border">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <Icon name={ICONS.history} size={20} color={colors.pinkPrimary} />
              <Text className="font-extrabold text-text dark:text-dark-text text-base">History</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('CycleInfo')} className="flex-row items-center gap-1 active:opacity-80">
              <Text className="text-sm font-bold text-pink-primary">See more</Text>
              <Icon name={ICONS.chevronForward} size={14} color={colors.pinkPrimary} />
            </Pressable>
          </View>

          <View className="mb-3">
            <Text className="font-bold text-sm text-text dark:text-dark-text mb-1">
              Current cycle: {currentCycleDay} Days
            </Text>
            <Text className="text-xs text-muted dark:text-dark-muted font-semibold mb-2">
              {cycleLength} Day Cycle Goal
            </Text>
            <View className="h-6 bg-gray-100 dark:bg-dark-card-hover rounded-full overflow-hidden">
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

          <View>
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="font-bold text-sm text-text dark:text-dark-text">31 Days</Text>
              <View className="w-5 h-5 rounded-full bg-green-500 items-center justify-center">
                <Icon name={ICONS.check} size={12} color="white" />
              </View>
            </View>
            <Text className="text-xs text-muted dark:text-dark-muted font-semibold mb-2">Previous Cycle Completed</Text>
            <View className="h-6 bg-gray-100 dark:bg-dark-card-hover rounded-full overflow-hidden">
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

        <View className="bg-card dark:bg-dark-card rounded-2xl p-4 shadow-sm mb-3 border border-gray-100 dark:border-dark-border">
          <View className="flex-row items-center gap-2 mb-3">
            <Icon name={ICONS.grid} size={18} color={colors.pinkPrimary} />
            <Text className="font-extrabold text-text dark:text-dark-text text-base">Home screen widget</Text>
          </View>

          {widgetPage === 0 && (
            <LinearGradient
              colors={isDark ? ['#1E1E22', '#2A2A30'] : [colors.pinkLight, colors.pinkPastelLight, colors.lightBlue]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 16, overflow: 'hidden', padding: 16 }}
            >
              <Text className="text-lg font-extrabold text-text dark:text-dark-text">Cycle day {currentCycleDay}</Text>
              <Text className="text-sm font-semibold text-muted dark:text-dark-muted mb-3">
                {pregnancyChance} chance to get pregnant
              </Text>
              <View className="h-3 bg-white/50 dark:bg-dark-card-hover rounded-full mt-4">
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
                {currentLog?.water_ml ?? 460} / 2000 ml
              </Text>
            </View>
          )}

          <View className="flex-row justify-center gap-1.5 mt-3">
            {[0, 1, 2].map((i) => (
              <Pressable
                key={i}
                onPress={() => setWidgetPage(i)}
                className={`h-2 rounded-full ${widgetPage === i ? 'bg-pink-primary w-4' : 'bg-gray-300 dark:bg-dark-border w-2'}`}
              />
            ))}
          </View>

          <View className="flex-row gap-2 mt-3">
            <Pressable
              onPress={() => navigation.navigate('Widgets')}
              className="flex-1 py-2.5 rounded-full border-2 border-pink-primary items-center active:opacity-80"
            >
              <Text className="text-pink-primary text-sm font-bold">More Widgets</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('SymptomsLog')}
              className="flex-1 py-2.5 rounded-full bg-pink-primary items-center active:opacity-80"
            >
              <Text className="text-white text-sm font-bold">+ Add</Text>
            </Pressable>
          </View>
        </View>

        <View className="flex-row gap-2">
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
      </ScrollView>
    </View>
  );
}

