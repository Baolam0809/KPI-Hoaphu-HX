import { createClient } from '@supabase/supabase-js';
import { User, OKR, KPI, SystemSettings, GroupAssignment, AuditLog } from './types';

// Read from environment variables, or fallback to the provided credentials
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || "https://gpqnfxocdtlerynbkfst.supabase.co";
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwcW5meG9jZHRsZXJ5bmJrZnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODg0NjgsImV4cCI6MjA5Nzg2NDQ2OH0.tI9t42_SVVYVO44gFxbi-jtvZi0qraWpeXzg_97z_GA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SQL_MIGRATION_SCRIPT = `-- SQL Script để khởi tạo cơ sở dữ liệu trên Supabase SQL Editor
-- Copy đoạn mã dưới đây dán vào phần SQL Editor của dự án Supabase của bạn và ấn RUN.

-- 1. Tạo bảng thcs_hp_users
CREATE TABLE IF NOT EXISTS thcs_hp_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT NOT NULL,
  email TEXT NOT NULL,
  bio TEXT NOT NULL,
  password TEXT,
  "isTeacher" BOOLEAN NOT NULL DEFAULT true,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tạo bảng thcs_hp_okrs
CREATE TABLE IF NOT EXISTS thcs_hp_okrs (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES thcs_hp_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kr1 TEXT NOT NULL,
  "kr1Progress" INTEGER NOT NULL DEFAULT 0,
  kr2 TEXT NOT NULL,
  "kr2Progress" INTEGER NOT NULL DEFAULT 0,
  kr3 TEXT NOT NULL,
  "kr3Progress" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tạo bảng thcs_hp_kpis
CREATE TABLE IF NOT EXISTS thcs_hp_kpis (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT REFERENCES thcs_hp_users(id) ON DELETE CASCADE,
  criterion TEXT NOT NULL,
  weight INTEGER NOT NULL,
  "desc" TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tạo bảng thcs_hp_settings
CREATE TABLE IF NOT EXISTS thcs_hp_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Kích hoạt RLS bảo mật (Tùy chọn) hoặc tạo các chính sách truy cập công khai không giới hạn cho ứng dụng quản trị này:
ALTER TABLE thcs_hp_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE thcs_hp_okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE thcs_hp_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE thcs_hp_settings ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách cho thcs_hp_users
DROP POLICY IF EXISTS "Allow public users access" ON thcs_hp_users;
CREATE POLICY "Allow public users access" ON thcs_hp_users FOR ALL USING (true) WITH CHECK (true);

-- Tạo chính sách cho thcs_hp_okrs
DROP POLICY IF EXISTS "Allow public okrs access" ON thcs_hp_okrs;
CREATE POLICY "Allow public okrs access" ON thcs_hp_okrs FOR ALL USING (true) WITH CHECK (true);

-- Tạo chính sách cho thcs_hp_kpis
DROP POLICY IF EXISTS "Allow public kpis access" ON thcs_hp_kpis;
CREATE POLICY "Allow public kpis access" ON thcs_hp_kpis FOR ALL USING (true) WITH CHECK (true);

-- Tạo chính sách cho thcs_hp_settings
DROP POLICY IF EXISTS "Allow public settings access" ON thcs_hp_settings;
CREATE POLICY "Allow public settings access" ON thcs_hp_settings FOR ALL USING (true) WITH CHECK (true);

-- 5. Tạo bảng thcs_hp_audit_logs
CREATE TABLE IF NOT EXISTS thcs_hp_audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  user_name TEXT,
  user_role TEXT,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE thcs_hp_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public audit logs access" ON thcs_hp_audit_logs;
CREATE POLICY "Allow public audit logs access" ON thcs_hp_audit_logs FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Check if the Supabase table setup exists and can be queried.
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; tablesExist: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('thcs_hp_users').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        // Table does not exist
        return { connected: true, tablesExist: false, error: 'Chưa tạo các bảng cơ sở dữ liệu trên Supabase.' };
      }
      return { connected: false, tablesExist: false, error: error.message };
    }
    return { connected: true, tablesExist: true };
  } catch (err: any) {
    return { connected: false, tablesExist: false, error: err.message || String(err) };
  }
}

/**
 * Load all data from Supabase. If anything fails, it will bubble up the error.
 */
export async function loadAllDataFromSupabase(): Promise<{
  users: User[];
  allOkrs: Record<string, OKR[]>;
  allKpis: Record<string, KPI[]>;
  settings: SystemSettings | null;
  groupAssignments?: GroupAssignment[] | null;
  auditLogs?: AuditLog[] | null;
}> {
  // 1. Fetch Users
  const { data: usersData, error: usersError } = await supabase
    .from('thcs_hp_users')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (usersError) throw usersError;

  // 2. Fetch OKRs
  const { data: okrsData, error: okrsError } = await supabase
    .from('thcs_hp_okrs')
    .select('*');

  if (okrsError) throw okrsError;

  // 3. Fetch KPIs
  const { data: kpisData, error: kpisError } = await supabase
    .from('thcs_hp_kpis')
    .select('*')
    .order('id', { ascending: true });

  if (kpisError) throw kpisError;

  // 4. Fetch Settings
  const { data: settingsData, error: settingsError } = await supabase
    .from('thcs_hp_settings')
    .select('*')
    .eq('key', 'system')
    .single();

  // Settings might not be initialized yet, so we don't throw if not found
  let settings: SystemSettings | null = null;
  if (!settingsError && settingsData) {
    settings = settingsData.value as SystemSettings;
  }

  // 5. Fetch Group Assignments
  const { data: groupAssignmentsData, error: groupAssignmentsError } = await supabase
    .from('thcs_hp_settings')
    .select('*')
    .eq('key', 'group_assignments')
    .single();

  let groupAssignments: GroupAssignment[] | null = null;
  if (!groupAssignmentsError && groupAssignmentsData) {
    groupAssignments = groupAssignmentsData.value as GroupAssignment[];
  }

  // 6. Fetch Audit Logs
  let auditLogs: AuditLog[] | null = null;
  const { data: auditLogsData, error: auditLogsError } = await supabase
    .from('thcs_hp_audit_logs')
    .select('*');

  if (!auditLogsError && auditLogsData) {
    // Sort client-side or parse
    const sortedLogs = [...auditLogsData].sort((a, b) => {
      return (b.created_at || b.id).localeCompare(a.created_at || a.id);
    });
    auditLogs = sortedLogs.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userRole: row.user_role,
      action: row.action,
      details: row.details,
      timestamp: row.timestamp,
      ipAddress: row.ip_address
    }));
  } else {
    // Fallback: load from thcs_hp_settings if table is missing or errors out
    const { data: fallbackData } = await supabase
      .from('thcs_hp_settings')
      .select('*')
      .eq('key', 'audit_logs')
      .single();
    if (fallbackData) {
      auditLogs = fallbackData.value as AuditLog[];
    }
  }

  // Parse arrays into dictionary records mapped by user_id
  const allOkrs: Record<string, OKR[]> = {};
  const allKpis: Record<string, KPI[]> = {};

  // Initialize dicts
  if (usersData) {
    usersData.forEach((u: any) => {
      allOkrs[u.id] = [];
      allKpis[u.id] = [];
    });
  }

  // Populate OKRs
  if (okrsData) {
    okrsData.forEach((okr: any) => {
      const { user_id, ...rest } = okr;
      if (user_id) {
        if (!allOkrs[user_id]) allOkrs[user_id] = [];
        allOkrs[user_id].push(rest as OKR);
      }
    });
  }

  // Populate KPIs
  if (kpisData) {
    kpisData.forEach((kpi: any) => {
      const { user_id, id, created_at, ...rest } = kpi;
      if (user_id) {
        if (!allKpis[user_id]) allKpis[user_id] = [];
        
        let desc = rest.desc || '';
        let evidences: any[] = [];
        const match = desc.match(/ \[EVIDENCES_JSON_METADATA:(.*)\]$/);
        if (match) {
          try {
            evidences = JSON.parse(match[1]);
            desc = desc.replace(/ \[EVIDENCES_JSON_METADATA:(.*)\]$/, '');
          } catch (e) {
            console.error('Error parsing evidences metadata:', e);
          }
        }
        
        allKpis[user_id].push({
          ...rest,
          desc,
          evidences: evidences.length > 0 ? evidences : undefined
        });
      }
    });
  }

  return {
    users: (usersData || []) as User[],
    allOkrs,
    allKpis,
    settings,
    groupAssignments,
    auditLogs
  };
}

/**
 * Upsert user to Supabase
 */
export async function saveUserToSupabase(user: User): Promise<void> {
  const { error } = await supabase
    .from('thcs_hp_users')
    .upsert({
      id: user.id,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      email: user.email,
      bio: user.bio || '',
      password: user.password || '',
      isTeacher: user.isTeacher ?? true,
      type: user.type
    });
  
  if (error) throw error;
}

/**
 * Delete user from Supabase (this will cascade delete their OKRs & KPIs)
 */
export async function deleteUserFromSupabase(userId: string): Promise<void> {
  const { error } = await supabase
    .from('thcs_hp_users')
    .delete()
    .eq('id', userId);
  
  if (error) throw error;
}

/**
 * Save / Upsert a single OKR
 */
export async function saveOkrToSupabase(userId: string, okr: OKR): Promise<void> {
  const { error } = await supabase
    .from('thcs_hp_okrs')
    .upsert({
      id: okr.id,
      user_id: userId,
      title: okr.title,
      kr1: okr.kr1,
      kr1Progress: okr.kr1Progress,
      kr2: okr.kr2,
      kr2Progress: okr.kr2Progress,
      kr3: okr.kr3,
      kr3Progress: okr.kr3Progress
    });

  if (error) throw error;
}

/**
 * Delete a single OKR
 */
export async function deleteOkrFromSupabase(okrId: string): Promise<void> {
  const { error } = await supabase
    .from('thcs_hp_okrs')
    .delete()
    .eq('id', okrId);

  if (error) throw error;
}

/**
 * Save / replace all KPIs for a user
 */
export async function saveUserKpisToSupabase(userId: string, kpis: KPI[]): Promise<void> {
  // To keep it simple and clean, we first delete the existing KPIs for the user and then insert the new ones
  const { error: deleteError } = await supabase
    .from('thcs_hp_kpis')
    .delete()
    .eq('user_id', userId);

  if (deleteError) throw deleteError;

  if (kpis.length === 0) return;

  const rowsToInsert = kpis.map(kpi => {
    let finalDesc = kpi.desc;
    if (kpi.evidences && kpi.evidences.length > 0) {
      finalDesc = `${kpi.desc} [EVIDENCES_JSON_METADATA:${JSON.stringify(kpi.evidences)}]`;
    }
    return {
      user_id: userId,
      criterion: kpi.criterion,
      weight: kpi.weight,
      desc: finalDesc,
      value: kpi.value
    };
  });

  const { error: insertError } = await supabase
    .from('thcs_hp_kpis')
    .insert(rowsToInsert);

  if (insertError) throw insertError;
}

/**
 * Save group assignments to Supabase
 */
export async function saveGroupAssignmentsToSupabase(groupAssignments: GroupAssignment[]): Promise<void> {
  const { error } = await supabase
    .from('thcs_hp_settings')
    .upsert({
      key: 'group_assignments',
      value: groupAssignments
    });

  if (error) throw error;
}

/**
 * Save system settings
 */
export async function saveSettingsToSupabase(settings: SystemSettings): Promise<void> {
  const { error } = await supabase
    .from('thcs_hp_settings')
    .upsert({
      key: 'system',
      value: settings
    });

  if (error) throw error;
}

/**
 * Seed initial mock data to Supabase (helper tool for first setups)
 */
export async function seedSupabaseInitialData(
  users: User[],
  allOkrs: Record<string, OKR[]>,
  allKpis: Record<string, KPI[]>,
  settings: SystemSettings,
  groupAssignments?: GroupAssignment[]
): Promise<void> {
  // 1. Seed users
  for (const user of users) {
    await saveUserToSupabase(user);
  }

  // 2. Seed OKRs
  for (const [userId, okrs] of Object.entries(allOkrs)) {
    for (const okr of okrs) {
      await saveOkrToSupabase(userId, okr);
    }
  }

  // 3. Seed KPIs
  for (const [userId, kpis] of Object.entries(allKpis)) {
    await saveUserKpisToSupabase(userId, kpis);
  }

  // 4. Seed Settings
  await saveSettingsToSupabase(settings);

  // 5. Seed Group Assignments
  if (groupAssignments && groupAssignments.length > 0) {
    await saveGroupAssignmentsToSupabase(groupAssignments);
  }
}

/**
 * Save an audit log to Supabase
 */
export async function saveAuditLogToSupabase(log: AuditLog): Promise<void> {
  try {
    const { error } = await supabase
      .from('thcs_hp_audit_logs')
      .insert({
        id: log.id,
        user_id: log.userId,
        user_name: log.userName,
        user_role: log.userRole,
        action: log.action,
        details: log.details,
        timestamp: log.timestamp,
        ip_address: log.ipAddress || ''
      });

    if (error) {
      console.warn("Table thcs_hp_audit_logs error, falling back to thcs_hp_settings:", error.message);
      throw error;
    }
  } catch (err) {
    // FALLBACK: Store in thcs_hp_settings under key 'audit_logs'
    try {
      const { data: currentData } = await supabase
        .from('thcs_hp_settings')
        .select('*')
        .eq('key', 'audit_logs')
        .single();
      
      let currentLogs: AuditLog[] = [];
      if (currentData && Array.isArray(currentData.value)) {
        currentLogs = currentData.value as AuditLog[];
      }
      
      // Keep up to 1000 logs to prevent unbounded growth of a single row
      currentLogs = [log, ...currentLogs].slice(0, 1000);
      
      await supabase
        .from('thcs_hp_settings')
        .upsert({
          key: 'audit_logs',
          value: currentLogs
        });
    } catch (e) {
      console.error("Critical error saving audit log fallback to Supabase:", e);
    }
  }
}

