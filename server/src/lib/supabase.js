import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://xqpeeuvfrwndoqsiidbj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxcGVldXZmcnduZG9xc2lpZGJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDg5OTQ3MywiZXhwIjoyMTAwNDc1NDczfQ.otjJaunepOJ78x-lSUoPCMMJ1cPfJ4kdV5BydKVKVm4';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    })
  : null;

export const isSupabaseConfigured = !!supabase;

/**
 * دالة مزامنة كائن أو سجل منفرد مع Supabase
 */
export async function syncToSupabase(tableName, record) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from(tableName)
      .upsert(record);
    if (error) {
      console.warn(`[Supabase Sync Warning] ${tableName}:`, error.message);
    }
    return data;
  } catch (err) {
    console.error(`[Supabase Sync Error] ${tableName}:`, err.message);
    return null;
  }
}
