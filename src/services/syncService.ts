import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  getDirtyProfiles,
  getDirtyDailyLogs,
  markProfileClean,
  markDailyLogClean,
  upsertLocalProfile,
  upsertLocalDailyLog,
  getLocalProfile,
  UserProfile,
  DailyLog,
} from '@/db/sqlite';

const LAST_SYNC_KEY = '@cyclewise_last_sync_time';

type SyncListener = () => void;
const syncListeners = new Set<SyncListener>();

export function subscribeToSyncUpdates(listener: SyncListener) {
  syncListeners.add(listener);
  return () => {
    syncListeners.delete(listener);
  };
}

function notifySyncListeners() {
  syncListeners.forEach((l) => {
    try {
      l();
    } catch (e) {
      console.warn('Error in sync listener:', e);
    }
  });
}

class SyncService {
  private isSyncing = false;
  private isOnline = true;
  private currentUserId: string | null = null;
  private unsubscribeNetInfo: (() => void) | null = null;

  init() {
    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      const wasOffline = !this.isOnline;
      this.isOnline = online;

      if (online && wasOffline) {
        console.log('[SyncService] Network reconnected, syncing pending changes...');
        this.syncPendingData().catch(console.warn);
      }
    });
  }

  destroy() {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
    }
  }

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
  }

  /**
   * Pushes dirty local rows to Supabase and pulls remote updates.
   */
  async syncPendingData(): Promise<void> {
    if (this.isSyncing || !this.isOnline || !isSupabaseConfigured || !this.currentUserId) {
      return;
    }

    this.isSyncing = true;
    try {
      // 1. PUSH PHASE: Profiles
      const dirtyProfiles = getDirtyProfiles();
      for (const profile of dirtyProfiles) {
        // Skip profiles that don't belong to the active authenticated user (e.g. offline mock user)
        if (profile.id !== this.currentUserId) {
          markProfileClean(profile.id);
          continue;
        }

        const { error } = await supabase.from('profiles').upsert({
          id: profile.id,
          full_name: profile.full_name,
          goal: profile.goal,
          period_length: profile.period_length,
          cycle_length: profile.cycle_length,
          luteal_phase: profile.luteal_phase,
          measurement_system: profile.measurement_system,
          app_lock_enabled: profile.app_lock_enabled,
          updated_at: profile.updated_at || new Date().toISOString(),
        });

        if (!error) {
          markProfileClean(profile.id);
        } else {
          console.warn('[SyncService] Failed to push profile:', error.message);
        }
      }

      // 2. PUSH PHASE: Daily Logs
      const dirtyLogs = getDirtyDailyLogs();
      for (const log of dirtyLogs) {
        if (log.user_id !== this.currentUserId) {
          continue;
        }
        const { error } = await supabase.from('daily_logs').upsert({
          id: log.id,
          user_id: log.user_id,
          log_date: log.log_date,
          flow: log.flow,
          symptoms: log.symptoms,
          moods: log.moods,
          sex_activity: log.sex_activity,
          physical_activity: log.physical_activity,
          other_factors: log.other_factors,
          discharge: log.discharge,
          digestion: log.digestion,
          tests: log.tests,
          weight: log.weight,
          temperature: log.temperature,
          sleep_minutes: log.sleep_minutes,
          water_ml: log.water_ml,
          note: log.note,
          updated_at: log.updated_at || new Date().toISOString(),
        });

        if (!error) {
          markDailyLogClean(log.id);
        } else {
          console.warn('[SyncService] Failed to push daily log:', error.message);
        }
      }

      // 3. PULL PHASE: Fetch remote changes since last sync
      const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
      const syncTimestamp = new Date().toISOString();

      // Pull Profiles
      let profileQuery = supabase.from('profiles').select('*').eq('id', this.currentUserId);
      if (lastSync) {
        profileQuery = profileQuery.gt('updated_at', lastSync);
      }
      const { data: remoteProfiles } = await profileQuery;
      if (remoteProfiles && remoteProfiles.length > 0) {
        for (const rp of remoteProfiles) {
          upsertLocalProfile(
            {
              id: rp.id,
              full_name: rp.full_name,
              goal: rp.goal,
              period_length: rp.period_length,
              cycle_length: rp.cycle_length,
              luteal_phase: rp.luteal_phase,
              measurement_system: rp.measurement_system,
              app_lock_enabled: Boolean(rp.app_lock_enabled),
              updated_at: rp.updated_at,
            },
            0 // is_dirty = 0 (clean remote data)
          );
        }
      }

      // Pull Daily Logs
      let logsQuery = supabase.from('daily_logs').select('*').eq('user_id', this.currentUserId);
      if (lastSync) {
        logsQuery = logsQuery.gt('updated_at', lastSync);
      }
      const { data: remoteLogs } = await logsQuery;
      if (remoteLogs && remoteLogs.length > 0) {
        for (const rl of remoteLogs) {
          upsertLocalDailyLog(
            {
              id: rl.id,
              user_id: rl.user_id,
              log_date: rl.log_date,
              flow: rl.flow,
              symptoms: Array.isArray(rl.symptoms) ? rl.symptoms : [],
              moods: Array.isArray(rl.moods) ? rl.moods : [],
              sex_activity: Array.isArray(rl.sex_activity) ? rl.sex_activity : [],
              physical_activity: Array.isArray(rl.physical_activity) ? rl.physical_activity : [],
              other_factors: Array.isArray(rl.other_factors) ? rl.other_factors : [],
              discharge: rl.discharge,
              digestion: Array.isArray(rl.digestion) ? rl.digestion : [],
              tests: rl.tests,
              weight: rl.weight,
              temperature: rl.temperature,
              sleep_minutes: rl.sleep_minutes,
              water_ml: rl.water_ml,
              note: rl.note,
              updated_at: rl.updated_at,
            },
            0 // is_dirty = 0
          );
        }
      }

      await AsyncStorage.setItem(LAST_SYNC_KEY, syncTimestamp);
      notifySyncListeners();
    } catch (err) {
      console.warn('[SyncService] Sync error:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Complete data restore on login or new device.
   */
  async restoreUserData(userId: string): Promise<void> {
    this.setCurrentUser(userId);

    if (!isSupabaseConfigured || !this.isOnline) {
      return;
    }

    try {
      // 1. Fetch remote profile
      const { data: remoteProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (remoteProfile) {
        upsertLocalProfile(
          {
            id: remoteProfile.id,
            full_name: remoteProfile.full_name,
            goal: remoteProfile.goal,
            period_length: remoteProfile.period_length,
            cycle_length: remoteProfile.cycle_length,
            luteal_phase: remoteProfile.luteal_phase,
            measurement_system: remoteProfile.measurement_system,
            app_lock_enabled: Boolean(remoteProfile.app_lock_enabled),
            updated_at: remoteProfile.updated_at,
          },
          0
        );
      } else {
        // Ensure local default exists
        const local = getLocalProfile(userId);
        if (!local) {
          upsertLocalProfile({ id: userId }, 1);
        }
      }

      // 2. Fetch all daily logs
      const { data: remoteLogs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId);

      if (remoteLogs && remoteLogs.length > 0) {
        for (const rl of remoteLogs) {
          upsertLocalDailyLog(
            {
              id: rl.id,
              user_id: rl.user_id,
              log_date: rl.log_date,
              flow: rl.flow,
              symptoms: Array.isArray(rl.symptoms) ? rl.symptoms : [],
              moods: Array.isArray(rl.moods) ? rl.moods : [],
              sex_activity: Array.isArray(rl.sex_activity) ? rl.sex_activity : [],
              physical_activity: Array.isArray(rl.physical_activity) ? rl.physical_activity : [],
              other_factors: Array.isArray(rl.other_factors) ? rl.other_factors : [],
              discharge: rl.discharge,
              digestion: Array.isArray(rl.digestion) ? rl.digestion : [],
              tests: rl.tests,
              weight: rl.weight,
              temperature: rl.temperature,
              sleep_minutes: rl.sleep_minutes,
              water_ml: rl.water_ml,
              note: rl.note,
              updated_at: rl.updated_at,
            },
            0
          );
        }
      }

      await AsyncStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      notifySyncListeners();
    } catch (error) {
      console.warn('[SyncService] restoreUserData error:', error);
    }
  }
}

export const syncService = new SyncService();
