import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client for development when environment variables are missing
const mockSupabaseClient = {
  auth: {
    getSession: () => {
      console.log('Mock: getSession called');
      return Promise.resolve({ data: { session: null }, error: null });
    },
    onAuthStateChange: (callback: any) => {
      console.log('Mock: onAuthStateChange called');
      // Call the callback immediately with no session
      setTimeout(() => callback('SIGNED_OUT', null), 0);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signInWithPassword: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signUp: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signInWithOAuth: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
    refreshSession: () => Promise.resolve({ data: { session: null }, error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found' } })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => Promise.resolve({ data: [], error: new Error('Supabase not configured') })
      })
    })
  })
} as any;

export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? (() => {
      console.warn('Missing Supabase environment variables. Using mock client.');
      return mockSupabaseClient;
    })()
  : createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  email: string;
  is_premium: boolean;
  stripe_customer_id?: string;
  subscription_status?: string;
  lemon_order_id?: string;
}