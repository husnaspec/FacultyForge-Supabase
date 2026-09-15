'use client';
import React from 'react';
import { Link } from '@/lib/router-compat';
import InstitutionHeader from '@/components/InstitutionHeader';
import {
  Sparkles,
  ArrowRight,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Cpu,
  Compass,
  Award,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export default function LandingPage() {
  const capabilities = [
    {
      icon: Cpu,
      title: 'Skill-Gap Intelligence',
      desc: 'AI-driven analysis of faculty publication history, teaching domain, and psychometric assessments to pinpoint real competency deficits.',
      color: 'blue',
    },
    {
      icon: TrendingUp,
      title: 'Measurable Learning Gain',
      desc: 'Empirically tracks pre-assessment vs post-assessment performance in absolute percentage points to prove institutional training efficacy.',
      color: 'green',
    },
    {
      icon: Sparkles,
      title: 'AI FDP Generator',
      desc: 'Generates accreditation-compliant FDP blueprints, session schedules, and psychometric evaluation questions from natural language prompts.',
      color: 'purple',
    },
    {
      icon: Compass,
      title: 'Resource Person Matcher',
      desc: 'Multi-criteria ranking of guest experts matching syllabus keywords, domain experience, and historical participant feedback ratings.',
      color: 'amber',
    },
    {
      icon: GraduationCap,
      title: 'Faculty Digital Passport',
      desc: 'A unified verifiable academic credential capturing acquired skills, training hours, learning gains, and active development pathways.',
      color: 'cyan',
    },
    {
      icon: BarChart3,
      title: 'Predictive Training Planner',
      desc: 'Forecasts next-semester training demand across academic departments to proactively schedule high-impact workshops.',
      color: 'rose',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Global Institutional Header */}
      <InstitutionHeader />

      {/* Top Bar */}
      <header
        style={{
          height: '70px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          maxWidth: '1300px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: 'var(--brand-glow)',
            }}
          >
            <Sparkles size={20} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            FacultyForge <span style={{ color: 'var(--brand-accent)' }}>AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/verify-certificate/TOKEN-DEMO-2026" className="btn btn-outline btn-sm">
            <Award size={15} />
            <span>Verify Certificate</span>
          </Link>
          <Link to="/app" className="btn btn-primary btn-sm">
            <span>Enter Platform</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 2rem 4rem',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 1rem',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            color: '#93c5fd',
            fontSize: '0.8125rem',
            fontWeight: 600,
          }}
        >
          <Sparkles size={15} />
          <span>Intelligent Multi-Agent Faculty Development & Training Platform</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
            maxWidth: '900px',
          }}
        >
          From Training Needs to{' '}
          <span
            style={{
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Measurable Faculty Growth
          </span>
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            lineHeight: 1.6,
          }}
        >
          Existing FDP systems manage events. <strong>FacultyForge AI manages faculty growth.</strong> An intelligent
          multi-agent platform unifying skill-gap analysis, automated FDP generation, learning impact measurement, and
          university-level training strategy.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/app" className="btn btn-primary btn-lg">
            <span>Enter Platform</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/app/ai-hub" className="btn btn-secondary btn-lg">
            <Cpu size={18} />
            <span>Explore AI Intelligence</span>
          </Link>
        </div>

        {/* Highlight Banner */}
        <div
          style={{
            marginTop: '3rem',
            padding: '1.25rem 2rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            width: '100%',
            maxWidth: '950px',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>10</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>INTELLIGENT AI AGENTS</p>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />
          <div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>+32 pp</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVG LEARNING GAIN</p>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />
          <div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>100%</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OFFLINE HACKATHON READY</p>
          </div>
          <div style={{ width: '1px', height: '36px', background: 'var(--border-subtle)' }} />
          <div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c084fc' }}>NBA / NAAC</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OBE ALIGNED CRITERIA</p>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section style={{ padding: '4rem 2rem 6rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Full Lifecycle Intelligence</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Transforming institutional faculty development into a quantitative, auditable, and strategic asset.
          </p>
        </div>

        <div className="grid-3">
          {capabilities.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--brand-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} />
                </div>
                <h3 style={{ fontSize: '1.125rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '2rem',
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <p>FacultyForge AI &copy; 2026. Built for Hackathon Demonstration. Powered by Multi-Agent Intelligence.</p>
      </footer>
    </div>
  );
}
