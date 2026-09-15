'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Shield, Sparkles, LogIn, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { switchRole } = useAuth();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'HOD' | 'FACULTY'>('ADMIN');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
            },
          },
        });
        if (error) throw error;
        switchRole(role);
        setSuccessMsg('Account created successfully! Redirecting to Agent 27 workspace...');
        setTimeout(() => router.push('/app'), 1500);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Signed in! Loading your institutional profile...');
        setTimeout(() => router.push('/app'), 1000);
      }
    } catch (err: any) {
      console.warn('[Supabase Auth Note]', err.message);
      // If running local demo / offline mode, allow easy transition
      setErrorMsg(err.message || 'Authentication error. You can also use One-Click Institutional Demo below.');
    } finally {
      setLoading(false);
    }
  };

  const handleOneClickDemo = (selectedRole: 'ADMIN' | 'HOD' | 'FACULTY') => {
    switchRole(selectedRole);
    router.push('/app');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 50% -20%, #1e3a8a 0%, #030712 100%)', padding: '24px' }}>
      <div className="card agent27-hud-card" style={{ maxWidth: '520px', width: '100%', padding: '40px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '14px', background: 'rgba(37, 99, 235, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', marginBottom: '16px' }}>
            <Shield size={36} color="#38bdf8" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', letterSpacing: '-0.02em' }}>
            FacultyForge AI <span style={{ color: '#38bdf8' }}>Agent 27</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            {isSignUp ? 'Register Institutional Faculty Account' : 'Sign In with Supabase Authentication'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '13px', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#86efac', fontSize: '13px', marginBottom: '20px' }}>
            {successMsg}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Ayesha Khan"
                className="input-field"
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '14px' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Academic Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@university.edu"
                className="input-field"
                style={{ width: '100%', padding: '12px 14px', paddingLeft: '40px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '14px' }}
              />
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field"
                style={{ width: '100%', padding: '12px 14px', paddingLeft: '40px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '14px' }}
              />
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Primary Institutional Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid #334155', borderRadius: '8px', color: '#f8fafc', fontSize: '14px' }}
              >
                <option value="ADMIN">Admin / FDP Coordinator</option>
                <option value="HOD">HOD / IQAC Approver</option>
                <option value="FACULTY">Faculty Member / Participant</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '8px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', color: '#ffffff', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Supabase Account' : 'Sign In with Supabase'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an institutional login? Sign Up"}
          </button>
        </div>

        {/* Demo Roles Instant Access */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(51, 65, 85, 0.6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              One-Click Instant Role Demo
            </span>
            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              Deterministic
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button
              onClick={() => handleOneClickDemo('ADMIN')}
              className="btn btn-outline"
              style={{ padding: '10px', fontSize: '12px', textAlign: 'center', borderRadius: '8px', border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.08)', color: '#93c5fd', cursor: 'pointer' }}
            >
              <Sparkles size={14} style={{ display: 'block', margin: '0 auto 4px' }} />
              Admin / Coord
            </button>
            <button
              onClick={() => handleOneClickDemo('HOD')}
              className="btn btn-outline"
              style={{ padding: '10px', fontSize: '12px', textAlign: 'center', borderRadius: '8px', border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.08)', color: '#fcd34d', cursor: 'pointer' }}
            >
              <UserCheck size={14} style={{ display: 'block', margin: '0 auto 4px' }} />
              HOD / IQAC
            </button>
            <button
              onClick={() => handleOneClickDemo('FACULTY')}
              className="btn btn-outline"
              style={{ padding: '10px', fontSize: '12px', textAlign: 'center', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.08)', color: '#6ee7b7', cursor: 'pointer' }}
            >
              <LogIn size={14} style={{ display: 'block', margin: '0 auto 4px' }} />
              Faculty
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/" style={{ fontSize: '13px', color: '#64748b' }}>
            &larr; Back to Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
}
