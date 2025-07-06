
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Defer subscription check to prevent deadlocks
          setTimeout(() => {
            checkSubscription();
          }, 100);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const cleanupAuthState = () => {
    // Clear all auth-related localStorage items
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up any existing auth state
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      toast({
        title: "Sign In Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up any existing auth state
      cleanupAuthState();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      if (data.user) {
        if (data.user.email_confirmed_at) {
          toast({
            title: "Account Created!",
            description: "You have successfully signed up and are now logged in.",
          });
        } else {
          toast({
            title: "Account Created!",
            description: "Please check your email to verify your account.",
          });
        }
      }

      return { error: null };
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      toast({
        title: "Sign Up Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        cleanupAuthState();
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error: any) {
      console.error('Unexpected sign out error:', error);
      toast({
        title: "Sign Out Error",
        description: error.message || "An error occurred while signing out",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    if (!session?.access_token) return;

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) {
        console.error('Error checking subscription:', error);
      } else {
        console.log('Subscription check result:', data);
      }
    } catch (error) {
      console.error('Error invoking check-subscription function:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
