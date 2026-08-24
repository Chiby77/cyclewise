import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, performGoogleOAuth } from '@/lib/supabase';
import { initDatabase, getLocalProfile, upsertLocalProfile, markProfileClean } from '@/db/sqlite';
import { syncService } from '@/services/syncService';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  error: string | null;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOCK_LOCAL_USER_ID = 'local-offline-user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [localFallbackUser, setLocalFallbackUser] = useState<{ email: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize SQLite & Sync Service on App Startup
  useEffect(() => {
    try {
      initDatabase();
      syncService.init();
    } catch (e) {
      console.warn('Database initialization error:', e);
    }

    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        handleUserAuthenticated(session.user);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await handleUserAuthenticated(session.user);
      } else {
        syncService.setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      syncService.destroy();
    };
  }, []);

  const handleUserAuthenticated = async (authenticatedUser: User, customName?: string) => {
    // Clear offline mock user dirty state so it doesn't push to Supabase
    markProfileClean(MOCK_LOCAL_USER_ID);
    syncService.setCurrentUser(authenticatedUser.id);

    const name =
      customName ||
      authenticatedUser.user_metadata?.full_name ||
      authenticatedUser.user_metadata?.name ||
      authenticatedUser.email?.split('@')[0] ||
      'CycleWise User';

    // Ensure local profile row in SQLite
    const existing = getLocalProfile(authenticatedUser.id);
    if (!existing) {
      upsertLocalProfile({
        id: authenticatedUser.id,
        full_name: name,
        goal: 'Track My Cycle',
        period_length: 5,
        cycle_length: 28,
        luteal_phase: 14,
        measurement_system: 'SI',
        app_lock_enabled: false,
      });
    }

    // Restore remote history and sync
    await syncService.restoreUserData(authenticatedUser.id);
    await syncService.syncPendingData();
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setError(null);

    if (!isSupabaseConfigured) {
      // Local fallback mode
      const name = email.split('@')[0];
      setLocalFallbackUser({ email, name });
      upsertLocalProfile({
        id: MOCK_LOCAL_USER_ID,
        full_name: name,
        goal: 'Track My Cycle',
      });
      syncService.setCurrentUser(MOCK_LOCAL_USER_ID);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user) {
      await handleUserAuthenticated(data.user);
    }
  };

  const signUp = async (name: string, email: string, password: string, confirmPassword: string) => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Fill in every field to continue.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);

    if (!isSupabaseConfigured) {
      setLocalFallbackUser({ email, name });
      upsertLocalProfile({
        id: MOCK_LOCAL_USER_ID,
        full_name: name,
        goal: 'Track My Cycle',
        period_length: 5,
        cycle_length: 28,
        luteal_phase: 14,
        measurement_system: 'SI',
        app_lock_enabled: false,
      });
      syncService.setCurrentUser(MOCK_LOCAL_USER_ID);
      return;
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    if (data.user) {
      await handleUserAuthenticated(data.user, name);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);

    if (!isSupabaseConfigured) {
      setLocalFallbackUser({ email: 'you@gmail.com', name: 'Google User' });
      upsertLocalProfile({
        id: MOCK_LOCAL_USER_ID,
        full_name: 'Google User',
        goal: 'Track My Cycle',
        period_length: 5,
        cycle_length: 28,
        luteal_phase: 14,
        measurement_system: 'SI',
        app_lock_enabled: false,
      });
      syncService.setCurrentUser(MOCK_LOCAL_USER_ID);
      return;
    }

    try {
      await performGoogleOAuth();
    } catch (err: any) {
      setError(err?.message || 'Google Sign-in failed.');
    }
  };

  const signOut = async () => {
    setError(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setLocalFallbackUser(null);
    syncService.setCurrentUser(null);
  };

  const activeUserId = user?.id || (localFallbackUser ? MOCK_LOCAL_USER_ID : '');
  const isAuthenticated = Boolean(user || localFallbackUser);
  const userEmail = user?.email || localFallbackUser?.email || null;
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    localFallbackUser?.name ||
    (userEmail ? userEmail.split('@')[0] : null);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      user,
      userId: activeUserId,
      userEmail,
      userName,
      error,
      clearError: () => setError(null),
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [isAuthenticated, isLoading, user, activeUserId, userEmail, userName, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
