import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useAuth: Starting initialization');
    let isMounted = true;
    
    // Fallback timeout to ensure loading never gets stuck
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('useAuth: Timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 3000); // Reduced to 3 seconds
    
    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        console.log('useAuth: getSession result:', session ? 'has session' : 'no session');
        clearTimeout(timeoutId);
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          console.log('useAuth: No session, setting loading to false');
          setLoading(false);
        }
      } catch (error: any) {
        if (!isMounted) return;
        console.error('useAuth: Error getting session:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!isMounted) return;
        console.log('useAuth: Auth state changed:', event, session ? 'has session' : 'no session');
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    console.log('useAuth: fetchProfile called for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('useAuth: fetchProfile result:', { data, error });
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      console.log('useAuth: fetchProfile finished, setting loading to false');
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    profile,
    loading,
    isPremium: profile?.is_premium || false,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
};