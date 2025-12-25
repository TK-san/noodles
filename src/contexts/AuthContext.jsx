import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(!isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return { data, error };
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }

    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { data, error };
  };

  const verifyOtp = async (email, token, type = 'signup') => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    return { data, error };
  };

  const resendOtp = async (email) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase not configured' } };
    }

    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    return { data, error };
  };

  const value = {
    user,
    loading,
    isOfflineMode,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    verifyOtp,
    resendOtp,
    setIsOfflineMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
