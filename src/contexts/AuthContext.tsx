import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isPremium: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Storage cleanup function
  const clearStorage = () => {
    try {
      const keysToRemove: string[] = [];
      
      // Scan localStorage for Supabase auth keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('sb-') && key.includes('-auth-token') ||
          key.includes('supabase.auth') ||
          key.includes('supabase-auth-token')
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Remove identified keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🔧 Cleared localStorage: ${key}`);
      });
      
      // Clear common sessionStorage keys
      const sessionKeys = ['supabase.auth.token', 'supabase-auth-token'];
      sessionKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
          console.log(`🔧 Cleared sessionStorage: ${key}`);
        }
      });
      
      console.log('✅ Auth storage cleanup completed');
      
    } catch (error) {
      console.error('❌ Storage cleanup failed:', error);
    }
  };

  // Professional auth initialization
  useEffect(() => {
    console.log('🚀 Initializing auth context');
    let isMounted = true;
    
    // Profile fetching function (scoped to this effect)
    const fetchProfile = async (userId: string) => {
      console.log(`👤 Fetching profile for user: ${userId}`);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (!isMounted) return;

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Profile fetch error:', error);
          setProfile(null);
        } else if (data) {
          console.log('✅ Profile loaded successfully');
          setProfile(data);
        } else {
          console.log('ℹ️  No profile found, creating default');
          setProfile({
            id: userId,
            email: '',
            is_premium: false
          });
        }
      } catch (error) {
        console.error('❌ Profile fetch exception:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('❌ Session fetch error:', error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('✅ Valid session found');
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('ℹ️  No session found');
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Professional auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (!isMounted) return;
        
        console.log(`🔔 Auth event: ${event}`, session ? 'with session' : 'no session');
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              setUser(session.user);
              await fetchProfile(session.user.id);
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('👋 Processing sign out event');
            setUser(null);
            setProfile(null);
            setLoading(false);
            clearStorage();
            break;
            
          case 'TOKEN_REFRESHED':
            if (session?.user) {
              setUser(session.user);
              // Don't refetch profile on token refresh
              setLoading(false);
            }
            break;
            
          default:
            if (session?.user) {
              setUser(session.user);
              await fetchProfile(session.user.id);
            } else {
              setUser(null);
              setProfile(null);
              setLoading(false);
            }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove all dependencies to prevent infinite loops

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    console.log('🚪 Sign out initiated');
    
    try {
      // Step 1: Optimistic UI update for instant feedback
      setUser(null);
      setProfile(null);
      setLoading(false);
      
      // Step 2: Call Supabase signOut with explicit scope
      console.log('📡 Calling Supabase signOut...');
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('❌ Supabase signOut error:', error);
      } else {
        console.log('✅ Supabase signOut successful');
      }
      
      // Step 3: Aggressive storage cleanup (regardless of Supabase response)
      console.log('🧹 Cleaning auth storage...');
      clearStorage();
      
      // Step 4: Force session refresh to ensure clean state
      console.log('🔄 Forcing session refresh...');
      await supabase.auth.getSession();
      
      console.log('✅ Sign out process completed');
      return { error: null };
      
    } catch (err) {
      console.error('❌ Sign out failed:', err);
      
      // Fail-safe: ensure UI is cleared even if everything else fails
      setUser(null);
      setProfile(null);
      setLoading(false);
      clearStorage();
      
      return { error: err };
    }
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    isPremium: profile?.is_premium || false,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 