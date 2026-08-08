import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseConfigError, supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const configError = getSupabaseConfigError();
    if (configError || !supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const configError = getSupabaseConfigError();
    if (!supabase || configError) {
      return { error: configError ?? 'Supabase is not configured.' };
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const configError = getSupabaseConfigError();
    if (!supabase || configError) {
      return { error: configError ?? 'Supabase is not configured.' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes('email') && message.includes('confirm')) {
        return { error: 'Please confirm your email before signing in.' };
      }
      if (message.includes('invalid login credentials')) {
        return { error: 'Incorrect email or password.' };
      }
      return { error: error.message };
    }

    if (!data.session || !data.user) {
      return { error: 'Sign-in failed. Please try again.' };
    }

    return { error: null };
  };

  const signInWithGoogle = async () => {
    const configError = getSupabaseConfigError();
    if (!supabase || configError) {
      return { error: configError ?? 'Supabase is not configured.' };
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, loading, signUp, signIn, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
