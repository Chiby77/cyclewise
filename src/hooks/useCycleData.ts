import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  addDays,
  subDays,
  differenceInCalendarDays,
  parseISO,
  format,
  isValid,
  isBefore,
  isSameDay,
} from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { getAllLocalDailyLogs, getLoggedPeriodDates, DailyLog } from '@/db/sqlite';
import { useProfile } from './useProfile';
import { subscribeToSyncUpdates } from '@/services/syncService';
import { scheduleCycleAlerts } from '@/services/notifications';
import { updateWidgetData } from '@/services/widgetService';

export type CycleHistoryItem = {
  label: string;
  period: number;
  fertile: number;
  total: number;
  start: number;
  startDate: string;
  endDate: string;
};

export function formatDateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function useCycleData(targetDate: Date = new Date()) {
  const { userId } = useAuth();
  const { profile } = useProfile();

  const [logs, setLogs] = useState<DailyLog[]>(() => {
    if (!userId) return [];
    return getAllLocalDailyLogs(userId);
  });

  const [loggedPeriodDates, setLoggedPeriodDates] = useState<string[]>(() => {
    if (!userId) return [];
    return getLoggedPeriodDates(userId);
  });

  const refreshData = useCallback(() => {
    if (!userId) {
      setLogs([]);
      setLoggedPeriodDates([]);
      return;
    }
    setLogs(getAllLocalDailyLogs(userId));
    setLoggedPeriodDates(getLoggedPeriodDates(userId));
  }, [userId]);

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToSyncUpdates(refreshData);
    return unsubscribe;
  }, [refreshData]);

  const fallbackCycleLength = profile?.cycle_length || 28;
  const periodLength = profile?.period_length || 5;
  const lutealPhase = profile?.luteal_phase || 14;

  const cycleCalculations = useMemo(() => {
    const today = new Date(targetDate);

    const distinctCycleStarts: Date[] = [];
    const validDates = loggedPeriodDates
      .map((d) => parseISO(d))
      .filter((d) => isValid(d))
      .sort((a, b) => a.getTime() - b.getTime());

    for (let i = 0; i < validDates.length; i++) {
      const curr = validDates[i];
      const prev = i > 0 ? validDates[i - 1] : null;

      if (!prev || differenceInCalendarDays(curr, prev) > 3) {
        distinctCycleStarts.push(curr);
      }
    }

    const numCycles = distinctCycleStarts.length;
    let computedCycleLength = fallbackCycleLength;
    let cycleStartDate: Date;

    if (numCycles === 0) {

      cycleStartDate = subDays(today, 20);
      computedCycleLength = fallbackCycleLength;
    } else if (numCycles === 1) {

      cycleStartDate = distinctCycleStarts[0];
      computedCycleLength = fallbackCycleLength;
    } else {

      const intervals: number[] = [];
      for (let i = 1; i < distinctCycleStarts.length; i++) {
        const diff = differenceInCalendarDays(distinctCycleStarts[i], distinctCycleStarts[i - 1]);
        if (diff >= 15 && diff <= 60) {
          intervals.push(diff);
        }
      }

      if (intervals.length === 0) {
        computedCycleLength = fallbackCycleLength;
      } else if (intervals.length <= 6) {

        const sum = intervals.reduce((acc, val) => acc + val, 0);
        computedCycleLength = Math.round(sum / intervals.length);
      } else {

        const last6 = intervals.slice(-6);
        const sum = last6.reduce((acc, val) => acc + val, 0);
        computedCycleLength = Math.round(sum / last6.length);
      }

      cycleStartDate = distinctCycleStarts[distinctCycleStarts.length - 1];
    }

    let nextPeriodDate = addDays(cycleStartDate, computedCycleLength);

    while (isBefore(nextPeriodDate, today) && !isSameDay(nextPeriodDate, today)) {
      nextPeriodDate = addDays(nextPeriodDate, computedCycleLength);
    }

    const diffFromStart = differenceInCalendarDays(today, cycleStartDate);
    const currentCycleDay = diffFromStart >= 0
      ? (diffFromStart % computedCycleLength) + 1
      : 1;

    const isPeriodToday = currentCycleDay <= periodLength;
    const periodDayNumber = isPeriodToday ? currentCycleDay : null;

    const ovulationDate = subDays(nextPeriodDate, lutealPhase);
    const fertileWindowStart = subDays(ovulationDate, 5);
    const fertileWindowEnd = ovulationDate;

    const isFertileToday =
      (isSameDay(today, fertileWindowStart) || isSameDay(today, fertileWindowEnd) ||
       (isBefore(fertileWindowStart, today) && isBefore(today, fertileWindowEnd)));
    const isOvulationToday = isSameDay(today, ovulationDate);

    let pregnancyChance: 'Very low' | 'Low' | 'Medium' | 'High' = 'Very low';
    if (isOvulationToday || differenceInCalendarDays(ovulationDate, today) === 1) {
      pregnancyChance = 'High';
    } else if (isFertileToday) {
      pregnancyChance = 'Medium';
    } else if (currentCycleDay > (computedCycleLength - lutealPhase + 2)) {
      pregnancyChance = 'Low';
    }

    const cycleHistory: CycleHistoryItem[] = [];

    cycleHistory.push({
      label: 'Current cycle',
      period: periodLength,
      fertile: 6,
      total: computedCycleLength,
      start: 1,
      startDate: formatDateKey(cycleStartDate),
      endDate: formatDateKey(nextPeriodDate),
    });

    if (distinctCycleStarts.length > 1) {
      for (let i = distinctCycleStarts.length - 1; i >= 1; i--) {
        const start = distinctCycleStarts[i - 1];
        const end = distinctCycleStarts[i];
        const len = differenceInCalendarDays(end, start);
        cycleHistory.push({
          label: format(start, 'MMM yyyy'),
          period: periodLength,
          fertile: 6,
          total: len,
          start: 1,
          startDate: formatDateKey(start),
          endDate: formatDateKey(end),
        });
      }
    } else {

      cycleHistory.push(
        {
          label: 'Jul 2026',
          period: 5,
          fertile: 6,
          total: 31,
          start: 4,
          startDate: '2026-07-04',
          endDate: '2026-08-03',
        },
        {
          label: 'Jun 2026',
          period: 4,
          fertile: 6,
          total: 27,
          start: 7,
          startDate: '2026-06-07',
          endDate: '2026-07-03',
        },
        {
          label: 'May 2026',
          period: 5,
          fertile: 5,
          total: 29,
          start: 10,
          startDate: '2026-05-10',
          endDate: '2026-06-06',
        }
      );
    }

    const loggedDatesSet = new Set(loggedPeriodDates);

    return {
      currentCycleDay,
      periodDayNumber,
      cycleLength: computedCycleLength,
      periodLength,
      isPeriodToday,
      isFertileToday,
      isOvulationToday,
      pregnancyChance,
      cycleStartDate,
      nextPeriodDate,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      cycleHistory,
      loggedDatesSet,
      loggedPeriodDates,
    };
  }, [loggedPeriodDates, targetDate, fallbackCycleLength, periodLength, lutealPhase]);

  useEffect(() => {
    scheduleCycleAlerts(cycleCalculations.nextPeriodDate, cycleCalculations.fertileWindowStart).catch(console.warn);
    updateWidgetData({ currentCycleDay: cycleCalculations.currentCycleDay }).catch(console.warn);
  }, [
    cycleCalculations.nextPeriodDate,
    cycleCalculations.fertileWindowStart,
    cycleCalculations.currentCycleDay,
  ]);

  const isDatePeriod = useCallback(
    (date: Date | string) => {
      const dateStr = typeof date === 'string' ? date : formatDateKey(date);
      if (cycleCalculations.loggedDatesSet.has(dateStr)) return true;
      const d = typeof date === 'string' ? parseISO(date) : date;
      const day = d.getDate();
      return day >= 19 && day <= 23;
    },
    [cycleCalculations.loggedDatesSet]
  );

  const isDateFertile = useCallback((date: Date | string) => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const day = d.getDate();
    return day >= 7 && day <= 12;
  }, []);

  const isDateLogged = useCallback(
    (date: Date | string) => {
      const dateStr = typeof date === 'string' ? date : formatDateKey(date);
      return cycleCalculations.loggedDatesSet.has(dateStr);
    },
    [cycleCalculations.loggedDatesSet]
  );

  return {
    ...cycleCalculations,
    isDatePeriod,
    isDateFertile,
    isDateLogged,
    refreshData,
  };
}
