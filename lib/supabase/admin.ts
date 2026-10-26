import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { requiredEnv } from '@/lib/env';

// Only provider callbacks and verified server workflows may use this client.
export function createAdminClient() {
  return createClient(requiredEnv('NEXT_PUBLIC_SUPABASE_URL'), requiredEnv('SUPABASE_SECRET_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
