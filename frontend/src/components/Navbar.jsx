import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Award } from 'lucide-react';

export default function Navbar() {
  const { currentRole, switchRole, roles } = useAuth();

  return (
    <header
      style={{
        height: '50px',
        borderBottom: '1px solid var(--border-subtle)',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
      }}
    >
      {/* Left: Context Workspace Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-light-blue)',
            border: '1px solid var(--bg-soft-blue)',
            color: 'var(--brand-primary)',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <Sparkles size={13} />
          <span>Agent 27 Workspace</span>
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontWeight: 500,
          }}
          className="desktop-pill"
        >
          National Institutional Academic Framework • NAAC Criterion 6.3 Audit Hub
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* Verification Link */}
        <Link
          to="/verify-certificate/TOKEN-DEMO-2026"
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', height: '32px' }}
          title="Open Public Certificate Verification Portal"
        >
          <Award size={13} color="var(--brand-primary)" />
          <span>Verify Certificate</span>
        </Link>

        {/* Demo Mode Role Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#f8fafc',
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            height: '32px',
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-secondary)', paddingLeft: '0.15rem' }}>
            ROLE:
          </span>
          <select
            value={currentRole}
            onChange={(e) => switchRole(e.target.value)}
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--brand-navy)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              padding: '0.15rem 0.4rem',
            }}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Agent 27 Live Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--brand-primary)',
            background: 'var(--bg-light-blue)',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--bg-soft-blue)',
            height: '32px',
          }}
          title="Agent 27 Multi-Agent Reasoning Engine Active"
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
          <span>Active</span>
        </div>
      </div>
    </header>
  );
}
