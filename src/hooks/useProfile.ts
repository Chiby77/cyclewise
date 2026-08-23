import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getLocalProfile, upsertLocalProfile, UserProfile } from '@/db/sqlite';
import { subscribeToSyncUpdates, syncService } from '@/services/syncService';

const DEFAULT_PROFILE: UserProfile = {
  id: 'default',
  full_name: 'CycleWise User',
  goal: 'Track My Cycle',
  period_length: 5,
  cycle_length: 28,
  luteal_phase: 14,
  measurement_system: 'SI',
  app_lock_enabled: false,
};

export function useProfile() {
  const { userId, userName } = useAuth();
  const [profile, setProfile] = useState<UserProfile>(() => {
    if (!userId) return DEFAULT_PROFILE;
    return (
      getLocalProfile(userId) || {
        ...DEFAULT_PROFILE,
        id: userId,
        full_name: userName || 'CycleWise User',
      }
    );
  });

  const refreshProfile = useCallback(() => {
    if (!userId) return;
    const local = getLocalProfile(userId);
    if (local) {
      setProfile(local);
    }
  }, [userId]);

  useEffect(() => {
    refreshProfile();
    const unsubscribe = subscribeToSyncUpdates(refreshProfile);
    return unsubscribe;
  }, [refreshProfile]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!userId) return;
      const updated = upsertLocalProfile({ id: userId, ...updates }, 1);
      setProfile(updated);
      syncService.syncPendingData().catch(console.warn);
    },
    [userId]
  );

  return {
    profile,
    updateProfile,
    refreshProfile,
  };
}
