import React, { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    console.log('🚀 Initializing auth context');
    let isMounted = true;
    
    const initAuth = async () => {
      try {
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
          
          // Fetch profile
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError && profileError.code !== 'PGRST116') {
              console.error('❌ Profile fetch error:', profileError);
              setProfile(null);
            } else if (profileData) {
              console.log('✅ Profile loaded');
              setProfile(profileData);
            } else {
              console.log('ℹ️ Creating default profile');
              setProfile({
                id: session.user.id,
                email: session.user.email || '',
                is_premium: false
              });
            }
          } catch (profileError) {
            console.error('❌ Profile fetch exception:', profileError);
            setProfile(null);
          }
        } else {
          console.log('ℹ️ No session found');
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        if (!isMounted) return;
        
        console.log(`🔔 Auth event: ${event}`);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setLoading(false);
        } else if (session?.user) {
          setUser(session.user);
          // Don't fetch profile again on every auth change to avoid loading loops
          if (!profile) {
            setProfile({
              id: session.user.id,
              email: session.user.email || '',
              is_premium: false
            });
          }
          setLoading(false);
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('🚪 Sign out initiated');
    
    try {
      // Always clear UI state first
      setUser(null);
      setProfile(null);
      setLoading(false);
      
      const { error } = await supabase.auth.signOut();
      
      // Handle specific auth errors that are expected
      if (error) {
        if (error.message?.includes('Auth session missing') || 
            error.message?.includes('session_not_found') ||
            error.name === 'AuthSessionMissingError') {
          console.log('ℹ️ Session already cleared (expected)');
          return { error: null }; // Treat as success since user is already signed out
        } else {
          console.error('❌ Supabase signOut error:', error);
          return { error };
        }
      } else {
        console.log('✅ Supabase signOut successful');
        return { error: null };
      }
    } catch (err: any) {
      console.error('❌ Sign out failed:', err);
      
      // If it's a session missing error, treat as success
      if (err?.message?.includes('Auth session missing') || 
          err?.message?.includes('session_not_found') ||
          err?.name === 'AuthSessionMissingError') {
        console.log('ℹ️ Session already cleared (caught exception)');
        return { error: null };
      }
      
      return { error: err };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error };
  };

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