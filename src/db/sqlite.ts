import * as SQLite from 'expo-sqlite';

export type UserProfile = {
  id: string;
  full_name: string | null;
  goal: string;
  period_length: number;
  cycle_length: number;
  luteal_phase: number;
  measurement_system: string;
  app_lock_enabled: boolean;
  is_dirty?: number;
  is_deleted?: number;
  updated_at?: string;
};

export type DailyLog = {
  id: string;
  user_id: string;
  log_date: string;
  flow: string | null;
  symptoms: string[];
  moods: string[];
  sex_activity: string[];
  physical_activity: string[];
  other_factors: string[];
  discharge: string | null;
  digestion: string[];
  tests: { pregnancy?: string; ovulation?: string } | null;
  weight: number | null;
  temperature: number | null;
  sleep_minutes: number | null;
  water_ml: number | null;
  note: string | null;
  is_dirty?: number;
  is_deleted?: number;
  updated_at?: string;
};

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('cyclewise.db');
  }
  return dbInstance;
}

export function initDatabase() {
  const db = getDatabase();

  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      full_name TEXT,
      goal TEXT DEFAULT 'Track My Cycle',
      period_length INTEGER DEFAULT 5,
      cycle_length INTEGER DEFAULT 28,
      luteal_phase INTEGER DEFAULT 14,
      measurement_system TEXT DEFAULT 'SI',
      app_lock_enabled INTEGER DEFAULT 0,
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      log_date TEXT NOT NULL,
      flow TEXT,
      symptoms TEXT,
      moods TEXT,
      sex_activity TEXT,
      physical_activity TEXT,
      other_factors TEXT,
      discharge TEXT,
      digestion TEXT,
      tests TEXT,
      weight REAL,
      temperature REAL,
      sleep_minutes INTEGER,
      water_ml INTEGER,
      note TEXT,
      is_dirty INTEGER DEFAULT 0,
      is_deleted INTEGER DEFAULT 0,
      updated_at TEXT,
      UNIQUE(user_id, log_date)
    );
  `);
}

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function getLocalProfile(userId: string): UserProfile | null {
  const db = getDatabase();
  const row = db.getFirstSync<any>(
    `SELECT * FROM profiles WHERE id = ? AND is_deleted = 0 LIMIT 1;`,
    [userId]
  );
  if (!row) return null;

  return {
    id: row.id,
    full_name: row.full_name,
    goal: row.goal || 'Track My Cycle',
    period_length: row.period_length ?? 5,
    cycle_length: row.cycle_length ?? 28,
    luteal_phase: row.luteal_phase ?? 14,
    measurement_system: row.measurement_system || 'SI',
    app_lock_enabled: Boolean(row.app_lock_enabled),
    is_dirty: row.is_dirty ?? 0,
    is_deleted: row.is_deleted ?? 0,
    updated_at: row.updated_at,
  };
}

export function upsertLocalProfile(profile: Partial<UserProfile> & { id: string }, isDirty: number = 1): UserProfile {
  const db = getDatabase();
  const existing = getLocalProfile(profile.id);
  const now = new Date().toISOString();

  const merged: UserProfile = {
    id: profile.id,
    full_name: profile.full_name !== undefined ? profile.full_name : existing?.full_name || null,
    goal: profile.goal !== undefined ? profile.goal : existing?.goal || 'Track My Cycle',
    period_length: profile.period_length !== undefined ? profile.period_length : existing?.period_length ?? 5,
    cycle_length: profile.cycle_length !== undefined ? profile.cycle_length : existing?.cycle_length ?? 28,
    luteal_phase: profile.luteal_phase !== undefined ? profile.luteal_phase : existing?.luteal_phase ?? 14,
    measurement_system: profile.measurement_system !== undefined ? profile.measurement_system : existing?.measurement_system || 'SI',
    app_lock_enabled: profile.app_lock_enabled !== undefined ? profile.app_lock_enabled : existing?.app_lock_enabled ?? false,
    is_dirty: isDirty,
    is_deleted: 0,
    updated_at: now,
  };

  db.runSync(
    `INSERT INTO profiles (id, full_name, goal, period_length, cycle_length, luteal_phase, measurement_system, app_lock_enabled, is_dirty, is_deleted, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       full_name = excluded.full_name,
       goal = excluded.goal,
       period_length = excluded.period_length,
       cycle_length = excluded.cycle_length,
       luteal_phase = excluded.luteal_phase,
       measurement_system = excluded.measurement_system,
       app_lock_enabled = excluded.app_lock_enabled,
       is_dirty = excluded.is_dirty,
       is_deleted = excluded.is_deleted,
       updated_at = excluded.updated_at;`,
    [
      merged.id,
      merged.full_name,
      merged.goal,
      merged.period_length,
      merged.cycle_length,
      merged.luteal_phase,
      merged.measurement_system,
      merged.app_lock_enabled ? 1 : 0,
      merged.is_dirty ?? 1,
      0,
      merged.updated_at ?? now,
    ]
  );

  return merged;
}

export function getLocalDailyLog(userId: string, logDate: string): DailyLog | null {
  const db = getDatabase();
  const row = db.getFirstSync<any>(
    `SELECT * FROM daily_logs WHERE user_id = ? AND log_date = ? AND is_deleted = 0 LIMIT 1;`,
    [userId, logDate]
  );
  if (!row) return null;

  return {
    id: row.id,
    user_id: row.user_id,
    log_date: row.log_date,
    flow: row.flow,
    symptoms: parseJson<string[]>(row.symptoms, []),
    moods: parseJson<string[]>(row.moods, []),
    sex_activity: parseJson<string[]>(row.sex_activity, []),
    physical_activity: parseJson<string[]>(row.physical_activity, []),
    other_factors: parseJson<string[]>(row.other_factors, []),
    discharge: row.discharge,
    digestion: parseJson<string[]>(row.digestion, []),
    tests: parseJson<any>(row.tests, null),
    weight: row.weight,
    temperature: row.temperature,
    sleep_minutes: row.sleep_minutes,
    water_ml: row.water_ml,
    note: row.note,
    is_dirty: row.is_dirty,
    is_deleted: row.is_deleted,
    updated_at: row.updated_at,
  };
}

export function getAllLocalDailyLogs(userId: string): DailyLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(
    `SELECT * FROM daily_logs WHERE user_id = ? AND is_deleted = 0 ORDER BY log_date ASC;`,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    log_date: row.log_date,
    flow: row.flow,
    symptoms: parseJson<string[]>(row.symptoms, []),
    moods: parseJson<string[]>(row.moods, []),
    sex_activity: parseJson<string[]>(row.sex_activity, []),
    physical_activity: parseJson<string[]>(row.physical_activity, []),
    other_factors: parseJson<string[]>(row.other_factors, []),
    discharge: row.discharge,
    digestion: parseJson<string[]>(row.digestion, []),
    tests: parseJson<any>(row.tests, null),
    weight: row.weight,
    temperature: row.temperature,
    sleep_minutes: row.sleep_minutes,
    water_ml: row.water_ml,
    note: row.note,
    is_dirty: row.is_dirty,
    is_deleted: row.is_deleted,
    updated_at: row.updated_at,
  }));
}

export function getLoggedPeriodDates(userId: string): string[] {
  const db = getDatabase();
  const rows = db.getAllSync<{ log_date: string }>(
    `SELECT log_date FROM daily_logs
     WHERE user_id = ? AND is_deleted = 0 AND flow IS NOT NULL AND flow != '' AND flow != 'None'
     ORDER BY log_date ASC;`,
    [userId]
  );
  return rows.map((r) => r.log_date);
}

export function upsertLocalDailyLog(log: Partial<DailyLog> & { id: string; user_id: string; log_date: string }, isDirty: number = 1): DailyLog {
  const db = getDatabase();
  const existing = getLocalDailyLog(log.user_id, log.log_date);
  const now = new Date().toISOString();

  const merged: DailyLog = {
    id: log.id || existing?.id || `${log.user_id}_${log.log_date}`,
    user_id: log.user_id,
    log_date: log.log_date,
    flow: log.flow !== undefined ? log.flow : existing?.flow || null,
    symptoms: log.symptoms !== undefined ? log.symptoms : existing?.symptoms || [],
    moods: log.moods !== undefined ? log.moods : existing?.moods || [],
    sex_activity: log.sex_activity !== undefined ? log.sex_activity : existing?.sex_activity || [],
    physical_activity: log.physical_activity !== undefined ? log.physical_activity : existing?.physical_activity || [],
    other_factors: log.other_factors !== undefined ? log.other_factors : existing?.other_factors || [],
    discharge: log.discharge !== undefined ? log.discharge : existing?.discharge || null,
    digestion: log.digestion !== undefined ? log.digestion : existing?.digestion || [],
    tests: log.tests !== undefined ? log.tests : existing?.tests || null,
    weight: log.weight !== undefined ? log.weight : existing?.weight ?? null,
    temperature: log.temperature !== undefined ? log.temperature : existing?.temperature ?? null,
    sleep_minutes: log.sleep_minutes !== undefined ? log.sleep_minutes : existing?.sleep_minutes ?? null,
    water_ml: log.water_ml !== undefined ? log.water_ml : existing?.water_ml ?? null,
    note: log.note !== undefined ? log.note : existing?.note ?? null,
    is_dirty: isDirty,
    is_deleted: 0,
    updated_at: now,
  };

  db.runSync(
    `INSERT INTO daily_logs (
      id, user_id, log_date, flow, symptoms, moods, sex_activity, physical_activity, other_factors,
      discharge, digestion, tests, weight, temperature, sleep_minutes, water_ml, note, is_dirty, is_deleted, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, log_date) DO UPDATE SET
      flow = excluded.flow,
      symptoms = excluded.symptoms,
      moods = excluded.moods,
      sex_activity = excluded.sex_activity,
      physical_activity = excluded.physical_activity,
      other_factors = excluded.other_factors,
      discharge = excluded.discharge,
      digestion = excluded.digestion,
      tests = excluded.tests,
      weight = excluded.weight,
      temperature = excluded.temperature,
      sleep_minutes = excluded.sleep_minutes,
      water_ml = excluded.water_ml,
      note = excluded.note,
      is_dirty = excluded.is_dirty,
      is_deleted = excluded.is_deleted,
      updated_at = excluded.updated_at;`,
    [
      merged.id,
      merged.user_id,
      merged.log_date,
      merged.flow,
      JSON.stringify(merged.symptoms),
      JSON.stringify(merged.moods),
      JSON.stringify(merged.sex_activity),
      JSON.stringify(merged.physical_activity),
      JSON.stringify(merged.other_factors),
      merged.discharge,
      JSON.stringify(merged.digestion),
      merged.tests ? JSON.stringify(merged.tests) : null,
      merged.weight,
      merged.temperature,
      merged.sleep_minutes,
      merged.water_ml,
      merged.note,
      merged.is_dirty ?? 1,
      0,
      merged.updated_at ?? now,
    ]
  );

  return merged;
}

// -------------------------------------------------------------
// SYNC ENGINE QUERIES
// -------------------------------------------------------------

export function getDirtyProfiles(): UserProfile[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(`SELECT * FROM profiles WHERE is_dirty = 1;`);
  return rows.map((r) => ({
    id: r.id,
    full_name: r.full_name,
    goal: r.goal,
    period_length: r.period_length,
    cycle_length: r.cycle_length,
    luteal_phase: r.luteal_phase,
    measurement_system: r.measurement_system,
    app_lock_enabled: Boolean(r.app_lock_enabled),
    is_dirty: r.is_dirty,
    is_deleted: r.is_deleted,
    updated_at: r.updated_at,
  }));
}

export function getDirtyDailyLogs(): DailyLog[] {
  const db = getDatabase();
  const rows = db.getAllSync<any>(`SELECT * FROM daily_logs WHERE is_dirty = 1;`);
  return rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    log_date: r.log_date,
    flow: r.flow,
    symptoms: parseJson<string[]>(r.symptoms, []),
    moods: parseJson<string[]>(r.moods, []),
    sex_activity: parseJson<string[]>(r.sex_activity, []),
    physical_activity: parseJson<string[]>(r.physical_activity, []),
    other_factors: parseJson<string[]>(r.other_factors, []),
    discharge: r.discharge,
    digestion: parseJson<string[]>(r.digestion, []),
    tests: parseJson<any>(r.tests, null),
    weight: r.weight,
    temperature: r.temperature,
    sleep_minutes: r.sleep_minutes,
    water_ml: r.water_ml,
    note: r.note,
    is_dirty: r.is_dirty,
    is_deleted: r.is_deleted,
    updated_at: r.updated_at,
  }));
}

export function markProfileClean(id: string, updatedAt?: string) {
  const db = getDatabase();
  db.runSync(`UPDATE profiles SET is_dirty = 0 WHERE id = ?;`, [id]);
}

export function markDailyLogClean(id: string, updatedAt?: string) {
  const db = getDatabase();
  db.runSync(`UPDATE daily_logs SET is_dirty = 0 WHERE id = ?;`, [id]);
}
