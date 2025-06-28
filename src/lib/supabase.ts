import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Create a mock client for development when environment variables are missing
const mockSupabaseClient = {
  auth: {
    getSession: () => {
      console.log('Mock: getSession called');
      return Promise.resolve({ data: { session: null }, error: null });
    },
    onAuthStateChange: (callback: any) => {
      console.log('Mock: onAuthStateChange called');
      // Don't call callback immediately to avoid race conditions
      // Just return the subscription object
      return { data: { subscription: { unsubscribe: () => console.log('Mock: unsubscribed') } } };
    },
    signInWithPassword: () => Promise.resolve({ error: new Error('Authentication requires Supabase configuration. Please set up VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.') }),
    signUp: () => Promise.resolve({ error: new Error('Authentication requires Supabase configuration. Please set up VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.') }),
    signInWithOAuth: () => Promise.resolve({ error: new Error('Authentication requires Supabase configuration. Please set up VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.') }),
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
  : (() => {
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          storage: localStorage,
          storageKey: 'slimsnap.auth.token',
        },
      });

      if (typeof window !== 'undefined') {
        const tokenKey = 'slimsnap.auth.token';

        client.auth.onAuthStateChange((_event, session) => {
          if (session) {
            const tokens = {
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            };
            localStorage.setItem(tokenKey, JSON.stringify(tokens));
          } else {
            localStorage.removeItem(tokenKey);
          }
        });

        (async () => {
          const {
            data: { session },
          } = await client.auth.getSession();
          if (!session) {
            const raw = localStorage.getItem(tokenKey);
            if (raw) {
              try {
                const { access_token, refresh_token } = JSON.parse(raw);
                if (access_token && refresh_token) {
                  await client.auth.setSession({ access_token, refresh_token });
                }
              } catch (err) {
                console.error('Failed to restore auth tokens', err);
                localStorage.removeItem(tokenKey);
              }
            }
          }
        })();
      }

      return client;
    })();

export interface UserProfile {
  id: string;
  email: string;
  is_premium: boolean;
  stripe_customer_id?: string;
  subscription_status?: string;
  lemon_order_id?: string;
}