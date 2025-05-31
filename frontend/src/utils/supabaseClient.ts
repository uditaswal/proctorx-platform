'use client';

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

export const createClientComponentClient = (): SupabaseClient => {
  return createPagesBrowserClient(); // ✅ no arguments
};
