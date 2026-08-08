import type { AgentRole } from '@/types/telemetry';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  full_name: string | null;
  role: AgentRole;
}

export interface ChecklistRecord {
  id: number;
  user_id: string;
  recommendation_id: string;
  title: string;
  checklist: { id: string; label: string; complete: boolean }[];
  complete_count: number;
  total_count: number;
  is_complete: boolean;
  roles: AgentRole[];
  notes: string;
  updated_at: string;
}

// Creates a profile row on first login if one doesn't exist yet, defaulting
// to the 'user' role. Uses ignoreDuplicates so it never overwrites an
// existing role — this only ever fires once per account.
export async function ensureProfile(userId: string, fullName: string | null): Promise<void> {
  if (!supabase || getSupabaseConfigError()) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, full_name: fullName, role: 'user' }, { onConflict: 'id', ignoreDuplicates: true });
  if (error) console.error('Failed to ensure profile:', error.message);
}

export async function fetchMyProfile(userId: string): Promise<Profile | null> {
  if (!supabase || getSupabaseConfigError()) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('Failed to fetch profile:', error.message);
    return null;
  }
  return data as Profile | null;
}

// Demo-only: lets the signed-in user set their own role. In production this
// should be admin-assigned rather than self-service — see the note in
// supabase/schema.sql next to the profiles update policy.
export async function updateMyRole(userId: string, role: AgentRole): Promise<{ error: string | null }> {
  if (!supabase || getSupabaseConfigError()) {
    return { error: getSupabaseConfigError() ?? 'Supabase is not configured.' };
  }
  const { error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', userId);
  return { error: error?.message ?? null };
}

// Fetches recommendation_checklists visible to the caller. No user_id filter
// here on purpose: RLS decides the result set. A plain 'user' role only ever
// gets rows back where user_id = auth.uid(); an oversight role gets every
// user's rows from this exact same query.
export async function fetchVisibleChecklists(): Promise<ChecklistRecord[]> {
  if (!supabase || getSupabaseConfigError()) return [];
  const { data, error } = await supabase
    .from('recommendation_checklists')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch recommendation checklists:', error.message);
    return [];
  }
  return (data ?? []) as ChecklistRecord[];
}
