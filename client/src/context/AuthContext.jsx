import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndSetUser = async (authUser) => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Fetch the full profile from public.profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
        
      if (profile) {
        setUser({ ...authUser, ...profile });
      } else {
        setUser(authUser); // Fallback
      }

      // Check and send welcome email (only sends if it hasn't been sent yet)
      import('../services/api').then(({ api }) => {
        api.checkAndSendWelcomeEmail();
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setUser(authUser);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfileAndSetUser(session?.user ?? null);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchProfileAndSetUser(session?.user ?? null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Standard Email/Password Login
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      return { success: false, error: error.message };
    }
    // Profile will be fetched by onAuthStateChange listener
    return { success: true, user: data.user };
  };

  // Registration
  const register = async (email, password, full_name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name,
        }
      }
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user, message: 'Registration successful. Please check your email for verification.' };
  };

  // Google OAuth Login
  const supabaseGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) {
      console.error('Supabase Google Login Error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  // Password Reset Request
  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  // Update Password (after reset)
  const updateUserPassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, supabaseGoogleLogin, logout, isAdmin, sendPasswordReset, updateUserPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
