import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';
import {
  getLocalDailyLog,
  getAllLocalDailyLogs,
  getLoggedPeriodDates,
  upsertLocalDailyLog,
  DailyLog,
} from '@/db/sqlite';
import { syncService, subscribeToSyncUpdates } from '@/services/syncService';
import {
  getPadReminderConfig,
  scheduleNextChangeReminder,
  cancelPadReminders,
} from '@/services/padReminderService';

type HealthContextValue = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  currentLog: DailyLog | null;
  periodDays: string[];
  allLogs: DailyLog[];
  updateStat: (key: 'weight' | 'temperature' | 'sleep_minutes' | 'water_ml', value: number | null) => Promise<void>;
  updateDailyLog: (updates: Partial<DailyLog>) => Promise<void>;
  togglePeriodDate: (dateStr: string, flowLevel?: string) => Promise<void>;
  setPeriodDates: (dates: string[]) => Promise<void>;
  refreshHealthData: () => void;
};

const HealthContext = createContext<HealthContextValue | undefined>(undefined);

export function HealthProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [currentLog, setCurrentLog] = useState<DailyLog | null>(null);
  const [periodDays, setPeriodDaysState] = useState<string[]>([]);
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);

  const loadDataForUser = useCallback(() => {
    if (!userId) {
      setCurrentLog(null);
      setPeriodDaysState([]);
      setAllLogs([]);
      return;
    }
    const log = getLocalDailyLog(userId, selectedDate);
    const periods = getLoggedPeriodDates(userId);
    const logs = getAllLocalDailyLogs(userId);

    setCurrentLog(log);
    setPeriodDaysState(periods);
    setAllLogs(logs);
  }, [userId, selectedDate]);

  useEffect(() => {
    loadDataForUser();
  }, [loadDataForUser]);

  useEffect(() => {
    const unsubscribe = subscribeToSyncUpdates(() => {
      loadDataForUser();
    });
    return () => unsubscribe();
  }, [loadDataForUser]);

  const updateDailyLog = async (updates: Partial<DailyLog>) => {
    if (!userId) return;
    const logId = currentLog?.id || `${userId}_${selectedDate}`;
    const newLog = upsertLocalDailyLog({
      id: logId,
      user_id: userId,
      log_date: selectedDate,
      ...updates,
    });
    setCurrentLog(newLog);
    loadDataForUser();
    syncService.syncPendingData().catch(console.warn);
  };

  const updateStat = async (
    key: 'weight' | 'temperature' | 'sleep_minutes' | 'water_ml',
    value: number | null
  ) => {
    await updateDailyLog({ [key]: value });
  };

  const togglePeriodDate = async (dateStr: string, flowLevel: string = 'Medium') => {
    if (!userId) return;
    const existing = getLocalDailyLog(userId, dateStr);
    const isPeriodCurrently = Boolean(existing?.flow && existing.flow !== 'None');

    const newFlow = isPeriodCurrently ? null : flowLevel;
    const logId = existing?.id || `${userId}_${dateStr}`;

    upsertLocalDailyLog({
      id: logId,
      user_id: userId,
      log_date: dateStr,
      flow: newFlow,
    });

    loadDataForUser();
    syncService.syncPendingData().catch(console.warn);
  };

  const setPeriodDates = async (dates: string[]) => {
    if (!userId) return;
    // Current period dates
    const current = getLoggedPeriodDates(userId);
    const datesSet = new Set(dates);

    // Turn off flow for dates removed
    for (const d of current) {
      if (!datesSet.has(d)) {
        const log = getLocalDailyLog(userId, d);
        if (log) {
          upsertLocalDailyLog({
            id: log.id,
            user_id: userId,
            log_date: d,
            flow: null,
          });
        }
      }
    }

    // Turn on flow for new dates
    for (const d of dates) {
      const log = getLocalDailyLog(userId, d);
      upsertLocalDailyLog({
        id: log?.id || `${userId}_${d}`,
        user_id: userId,
        log_date: d,
        flow: log?.flow || 'Medium',
      });
    }

    // Lifecycle check for Pad/Tampon reminders
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const isTodayActive = datesSet.has(todayKey);
    if (!isTodayActive) {
      cancelPadReminders().catch(console.warn);
    } else {
      getPadReminderConfig().then((cfg) => {
        if (cfg.enabled) {
          scheduleNextChangeReminder(cfg).catch(console.warn);
        }
      });
    }

    loadDataForUser();
    syncService.syncPendingData().catch(console.warn);
  };

  const value = useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
      currentLog,
      periodDays,
      allLogs,
      updateStat,
      updateDailyLog,
      togglePeriodDate,
      setPeriodDates,
      refreshHealthData: loadDataForUser,
    }),
    [selectedDate, currentLog, periodDays, allLogs, loadDataForUser]
  );

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
}

export function useHealth() {
  const ctx = useContext(HealthContext);
  if (!ctx) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return ctx;
}
