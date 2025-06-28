import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client for development when environment variables are missing
const mockSupabaseClient = {
  auth: {
    getSession: () => {
      console.log('Mock: getSession called - Supabase not configured');
      return Promise.resolve({ data: { session: null }, error: null });
    },
    onAuthStateChange: (callback: any) => {
      console.log('Mock: onAuthStateChange called - Supabase not configured');
      // Don't call callback immediately to avoid race conditions
      // Just return the subscription object
      return { data: { subscription: { unsubscribe: () => console.log('Mock: unsubscribed') } } };
    },
    signInWithPassword: () => {
      console.error('Mock: signInWithPassword called - Please configure Supabase environment variables');
      return Promise.resolve({ error: new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.') });
    },
    signUp: () => {
      console.error('Mock: signUp called - Please configure Supabase environment variables');
      return Promise.resolve({ error: new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.') });
    },
    signInWithOAuth: () => {
      console.error('Mock: signInWithOAuth called - Please configure Supabase environment variables');
      return Promise.resolve({ error: new Error('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.') });
    },
    signOut: () => {
      console.log('Mock: signOut called - Supabase not configured');
      return Promise.resolve({ error: null });
    },
    refreshSession: () => {
      console.log('Mock: refreshSession called - Supabase not configured');
      return Promise.resolve({ data: { session: null }, error: null });
    }
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => {
          console.log('Mock: Database query called - Supabase not configured');
          return Promise.resolve({ data: null, error: { code: 'PGRST116', message: 'No rows found (mock client)' } });
        }
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => {
          console.log('Mock: Database update called - Supabase not configured');
          return Promise.resolve({ data: [], error: new Error('Supabase not configured') });
        }
      })
    })
  })
} as any;

// Check if environment variables are configured
const isConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.error('⚠️  Supabase environment variables not found!');
  console.error('Please create a .env.local file with the following variables:');
  console.error('VITE_SUPABASE_URL=your-supabase-url');
  console.error('VITE_SUPABASE_ANON_KEY=your-supabase-anon-key');
  console.error('You can copy .env.example to .env.local and update the values.');
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (() => {
      console.warn('Using mock Supabase client. Authentication will not work properly.');
      return mockSupabaseClient;
    })();

export interface UserProfile {
  id: string;
  email: string;
  is_premium: boolean;
  stripe_customer_id?: string;
  subscription_status?: string;
  lemon_order_id?: string;
}