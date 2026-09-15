'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/lib/supabase/types';

interface AuthContextType {
  user: any | null;
  currentRole: UserRole;
  activeFacultyId: number;
  isAdmin: boolean;
  isApprover: boolean;
  isFaculty: boolean;
  switchRole: (role: UserRole) => void;
  setActiveFacultyId: (id: number) => void;
  signOut: () => Promise<void>;
  roles: Array<{ id: UserRole; label: string; badgeColor: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [activeFacultyId, setActiveFacultyIdState] = useState<number>(1);
  const supabase = createClient();

  useEffect(() => {
    // Check local storage for initial role preference if set
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('facultyforge_role') as UserRole;
      if (storedRole && ['ADMIN', 'HOD', 'FACULTY'].includes(storedRole)) {
        setCurrentRole(storedRole);
      }
      const storedId = Number(localStorage.getItem('facultyforge_active_faculty_id'));
      if (storedId) {
        setActiveFacultyIdState(storedId);
      }
    }

    // Listen to Supabase Auth state
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          // Query profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, faculty_id')
            .eq('id', user.id)
            .single();

          if (profile) {
            if (profile.role) setCurrentRole(profile.role as UserRole);
            if (profile.faculty_id) setActiveFacultyIdState(profile.faculty_id);
          }
        }
      } catch (err) {
        // Fallback for demo or when Supabase keys are default/local
        console.warn('[Auth] Running in local demo/deterministic mode:', err);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, faculty_id')
          .eq('id', session.user.id)
          .single();

        if (profile?.role) setCurrentRole(profile.role as UserRole);
        if (profile?.faculty_id) setActiveFacultyIdState(profile.faculty_id);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('facultyforge_role', newRole);
    }
  };

  const setActiveFacultyId = (id: number) => {
    setActiveFacultyIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('facultyforge_active_faculty_id', String(id));
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const roles: Array<{ id: UserRole; label: string; badgeColor: string }> = [
    { id: 'ADMIN', label: 'Admin / FDP Coordinator', badgeColor: 'badge-high' },
    { id: 'HOD', label: 'HOD / IQAC / Approver', badgeColor: 'badge-medium' },
    { id: 'FACULTY', label: 'Faculty / Participant', badgeColor: 'badge-low' },
  ];

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        activeFacultyId,
        isAdmin: currentRole === 'ADMIN',
        isApprover: currentRole === 'HOD',
        isFaculty: currentRole === 'FACULTY',
        switchRole,
        setActiveFacultyId,
        signOut,
        roles,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
