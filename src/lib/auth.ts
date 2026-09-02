import { supabase } from './supabase';

export const auth = {
  signInWithPassword: (email: string, password: string) => supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string) => supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } }),
  sendMagicLink: (email: string) => supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } }),
  // Recuperación de contraseña: envía el e-mail y, de vuelta en la app, actualiza la contraseña de la sesión.
  sendPasswordReset: (email: string) => supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' }),
  updatePassword: (password: string) => supabase.auth.updateUser({ password }),
  getSession: () => supabase.auth.getSession(),
  onAuthChange: (callback: (userId: string | null) => void) => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session?.user?.id ?? null));
    return () => data.subscription.unsubscribe();
  },
  signOut: () => supabase.auth.signOut(),
};
