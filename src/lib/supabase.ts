import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

let supabaseClient: any = null;
if (rawUrl && rawKey && isValidUrl(rawUrl)) {
  try {
    supabaseClient = createClient(rawUrl, rawKey);
  } catch (e) {
    console.error('Failed to initialize Supabase client:', e);
  }
}

export const supabase = supabaseClient;

