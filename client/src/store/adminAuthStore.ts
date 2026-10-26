import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

interface AdminAuthState {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
}));
