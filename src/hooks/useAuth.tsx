import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, type ProfileRow } from '../lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  isAdmin: boolean;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    isAdmin: false,
    loading: true,
  });

  const loadProfile = async (uid: string): Promise<ProfileRow | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (error) return null;
    return (data as ProfileRow) ?? null;
  };

  const applySession = async (session: Session | null) => {
    if (!session?.user) {
      setState({ session: null, user: null, profile: null, isAdmin: false, loading: false });
      return;
    }
    const profile = await loadProfile(session.user.id);
    setState({
      session,
      user: session.user,
      profile,
      isAdmin: profile?.is_admin ?? false,
      loading: false,
    });
  };

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      applySession(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Wrap async work to avoid deadlock inside the synchronous callback
      (async () => {
        await applySession(session);
      })();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error ? error.message : null };
      },
      signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) return { error: error.message };
        if (!data.user) return { error: 'Sign-up failed. Please try again.' };
        return { error: null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshProfile: async () => {
        if (!state.user) return;
        const profile = await loadProfile(state.user.id);
        setState((s) => ({ ...s, profile, isAdmin: profile?.is_admin ?? false }));
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
