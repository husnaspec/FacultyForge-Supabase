'use client';
import React, { useState, useEffect } from 'react';
import { GraduationCap, Award, Sparkles, ShieldCheck, ArrowRight, Users, Layers, Cpu, BookOpen, CheckCircle, FileText, Activity } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(15);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 70);

    const autoTimer = setTimeout(() => {
      handleProceed();
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(autoTimer);
    };
  }, []);

  const handleProceed = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 550);
  };

  return (
    <div className={`splash-backdrop ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="splash-grid-bg" />

      {/* Main Agent 27 Card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '720px',
          width: '94%',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          borderRadius: '28px',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 50px rgba(37, 99, 235, 0.3)',
          padding: '2.5rem 2.25rem',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem',
        }}
      >
        {/* Top Glowing Beam */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #38bdf8, #60a5fa, transparent)',
            boxShadow: '0 0 16px #38bdf8',
          }}
        />

        {/* Insignia Icon with Glowing Ring */}
        <div
          style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 35px rgba(59, 130, 246, 0.6), inset 0 0 15px rgba(255, 255, 255, 0.3)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
          }}
        >
          <GraduationCap size={44} color="#ffffff" />
          <div
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#10b981',
              border: '3px solid #0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 10px #10b981',
            }}
          />
        </div>

        {/* Title Header */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                padding: '0.25rem 0.85rem',
                borderRadius: '9999px',
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.25)',
              }}
            >
              AGENT 27
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#34d399',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <Activity size={13} />
              AUTONOMOUS ACTIVE
            </span>
          </div>

          <h1
            style={{
              fontSize: '2rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem',
            }}
          >
            Faculty Development Programme and Workshop Agent
          </h1>

          <p
            style={{
              fontSize: '0.9375rem',
              color: '#94a3b8',
              lineHeight: 1.5,
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            Manages the full lifecycle of faculty development programmes, workshops, seminars, and short-term training, and maintains the participation record that both appraisal and accreditation depend on.
          </p>
        </div>

        {/* 4 Architectural Pillars Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            width: '100%',
          }}
        >
          {[
            {
              icon: Users,
              label: 'Primary Users',
              desc: 'Coordinators, HODs, Faculty & IQAC Cell',
              color: '#38bdf8',
            },
            {
              icon: Layers,
              label: 'Lifecycle Flow',
              desc: 'Proposals, Attendance, Assessments & Reports',
              color: '#818cf8',
            },
            {
              icon: Award,
              label: 'Accreditation',
              desc: 'Cryptographic Certificates & NAAC/NBA Proofs',
              color: '#34d399',
            },
            {
              icon: Cpu,
              label: 'Integration Bus',
              desc: 'Feeds Agents 9, 57, 58, 59, 60, 62',
              color: '#f472b6',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '14px',
                padding: '0.875rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <item.icon size={20} color={item.color} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f1f5f9' }}>
                {item.label}
              </span>
              <span style={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: 1.25 }}>
                {item.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Loading Bar */}
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
            <span style={{ color: '#94a3b8' }}>Orchestrating Agent 27 Lifecycle Services...</span>
            <span style={{ color: '#60a5fa', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {Math.min(progress, 100)}%
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(30, 41, 59, 0.8)',
              borderRadius: '9999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(progress, 100)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2563eb, #38bdf8, #34d399)',
                boxShadow: '0 0 12px #38bdf8',
                borderRadius: '9999px',
                transition: 'width 0.1s ease-out',
              }}
            />
          </div>
        </div>

        {/* Bottom Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '0.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b' }}>
            <ShieldCheck size={15} color="#34d399" />
            <span>Autonomous Institutional Faculty Development Platform</span>
          </div>

          <button
            type="button"
            onClick={handleProceed}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.35rem',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.5)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <span>Enter Agent 27 Workspace</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
