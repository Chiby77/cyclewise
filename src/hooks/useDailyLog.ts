import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getLocalDailyLog, upsertLocalDailyLog, DailyLog } from '@/db/sqlite';
import { subscribeToSyncUpdates, syncService } from '@/services/syncService';
import { updateWidgetData } from '@/services/widgetService';

export function useDailyLog(logDate: string) {
  const { userId } = useAuth();

  const getFallbackLog = useCallback(
    (): DailyLog => ({
      id: `${userId || 'guest'}_${logDate}`,
      user_id: userId || 'guest',
      log_date: logDate,
      flow: null,
      symptoms: [],
      moods: [],
      sex_activity: [],
      physical_activity: [],
      other_factors: [],
      discharge: null,
      digestion: [],
      tests: null,
      weight: null,
      temperature: null,
      sleep_minutes: null,
      water_ml: null,
      note: null,
    }),
    [userId, logDate]
  );

  const [dailyLog, setDailyLog] = useState<DailyLog>(() => {
    if (!userId) return getFallbackLog();
    return getLocalDailyLog(userId, logDate) || getFallbackLog();
  });

  const refreshLog = useCallback(() => {
    if (!userId) {
      setDailyLog(getFallbackLog());
      return;
    }
    const log = getLocalDailyLog(userId, logDate);
    setDailyLog(log || getFallbackLog());
  }, [userId, logDate, getFallbackLog]);

  useEffect(() => {
    refreshLog();
    const unsubscribe = subscribeToSyncUpdates(refreshLog);
    return unsubscribe;
  }, [refreshLog]);

  const updateLog = useCallback(
    (updates: Partial<DailyLog>) => {
      if (!userId) return;
      const updated = upsertLocalDailyLog(
        {
          id: dailyLog.id || `${userId}_${logDate}`,
          user_id: userId,
          log_date: logDate,
          ...updates,
        },
        1
      );
      setDailyLog(updated);
      if (updates.water_ml !== undefined && updates.water_ml !== null) {
        updateWidgetData({ waterIntake: updates.water_ml }).catch(console.warn);
      }
      syncService.syncPendingData().catch(console.warn);
    },
    [userId, logDate, dailyLog.id]
  );

  const toggleArrayItem = useCallback(
    (field: keyof Pick<DailyLog, 'symptoms' | 'moods' | 'sex_activity' | 'physical_activity' | 'other_factors' | 'digestion'>, item: string) => {
      const currentList = dailyLog[field] || [];
      const updatedList = currentList.includes(item)
        ? currentList.filter((x) => x !== item)
        : [...currentList, item];
      updateLog({ [field]: updatedList });
    },
    [dailyLog, updateLog]
  );

  return {
    dailyLog,
    updateLog,
    toggleArrayItem,
    refreshLog,
  };
}
