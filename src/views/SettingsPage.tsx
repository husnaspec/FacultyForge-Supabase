'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Settings, Cpu, ShieldCheck, Database, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { currentRole, switchRole, roles } = useAuth();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <Settings size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Platform Settings & System Status</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Architecture diagnostics, AI provider configuration, and hackathon demo switches.
        </p>
      </div>

      {/* System Status Banner */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Backend Service Status: ONLINE</h3>
          </div>
          <a
            href="http://127.0.0.1:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline btn-sm"
          >
            <ExternalLink size={13} />
            <span>Open FastAPI Swagger Docs</span>
          </a>
        </div>

        <div className="grid-3" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', fontSize: '0.8125rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>SERVICE</span>
            <p style={{ fontWeight: 700 }}>{health?.service || 'FacultyForge AI API'}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>VERSION</span>
            <p style={{ fontWeight: 700 }}>{health?.version || '1.0.0'}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>INTELLIGENCE ENGINE</span>
            <p style={{ fontWeight: 700, color: '#34d399' }}>Deterministic Multi-Agent (Offline)</p>
          </div>
        </div>
      </div>

      {/* AI Provider Architecture Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={20} style={{ color: 'var(--brand-primary)' }} />
          <h3 style={{ fontSize: '1.125rem' }}>Dual-Mode AI Provider Architecture</h3>
        </div>

        <div className="grid-2">
          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-approved" style={{ fontSize: '0.6875rem' }}>ACTIVE</span>
              <h4 style={{ fontSize: '0.9375rem' }}>Mode 1: Deterministic Intelligent Fallback</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Executes multi-criteria matching, Jaccard keyword vectors, empirical learning gain computations,
              and educational taxonomy logic offline. 100% reliable for hackathon demonstrations without requiring external API keys.
            </p>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-draft" style={{ fontSize: '0.6875rem' }}>OPTIONAL</span>
              <h4 style={{ fontSize: '0.9375rem' }}>Mode 2: External LLM via Environment</h4>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Set <code>AI_PROVIDER="llm"</code> and <code>AI_API_KEY="your-key"</code> in <code>backend/.env</code> to dynamically
              connect to Gemini or OpenAI-compatible models for natural language completions.
            </p>
          </div>
        </div>
      </div>

      {/* Demo Switcher Box */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem' }}>Demo Role Context Switcher</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Switch active user persona to simulate administrative approvals, coordinator workflows, or faculty self-service.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => switchRole(r.id)}
              className={`btn ${currentRole === r.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.75rem 1.25rem' }}
            >
              <span>{r.label}</span>
              {currentRole === r.id && <CheckCircle2 size={16} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
