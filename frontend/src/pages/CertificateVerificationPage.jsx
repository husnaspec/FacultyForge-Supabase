import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Award, CheckCircle2, XCircle, Sparkles, ArrowLeft, ShieldCheck, QrCode } from 'lucide-react';

export default function CertificateVerificationPage() {
  const { token } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputToken, setInputToken] = useState(token || '');

  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  const verifyToken = async (tok) => {
    setLoading(true);
    setError('');
    setVerification(null);
    try {
      const data = await api.verifyCertificate(tok);
      setVerification(data);
    } catch (err) {
      setError(err.message || 'Certificate verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (inputToken.trim()) {
      verifyToken(inputToken.trim());
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Verification Header */}
      <header style={{ height: '64px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
        <Link to="/app" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <Sparkles size={16} />
          </div>
          <span style={{ fontSize: '1rem', fontWeight: 800 }}>
            FacultyForge <span style={{ color: 'var(--brand-accent)' }}>AI</span> Certificate Verification Portal
          </span>
        </Link>

        <Link to="/app" className="btn btn-outline btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Platform</span>
        </Link>
      </header>

      {/* Verification Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '650px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Lookup Input */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <form onSubmit={handleManualVerify} style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
                placeholder="Enter Verification Token / UUID..."
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Verify
              </button>
            </form>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Verifying cryptographic digital credentials...
            </div>
          )}

          {error && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', borderColor: 'var(--color-danger)' }}>
              <XCircle size={40} style={{ color: 'var(--color-danger)', margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.25rem', color: '#f87171' }}>Invalid or Revoked Certificate</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                {error}. Please check the verification token or contact the institutional academic office.
              </p>
            </div>
          )}

          {verification && (
            <div
              className="card"
              style={{
                border: '1px solid rgba(16, 185, 129, 0.4)',
                background: 'linear-gradient(180deg, var(--bg-surface) 0%, rgba(16, 185, 129, 0.05) 100%)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative',
              }}
            >
              {/* Verified Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
                  <ShieldCheck size={22} />
                  <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                    {verification.verification_status}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {verification.certificate_code}
                </span>
              </div>

              {/* Certificate Details */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    PARTICIPANT NAME
                  </span>
                  <p style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {verification.participant_name}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    COMPLETED PROGRAMME
                  </span>
                  <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    {verification.event_name}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {verification.event_type} &bull; Organized by Department of {verification.organizing_department}
                  </p>
                </div>

                <div className="grid-2">
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      TRAINING HOURS
                    </span>
                    <p style={{ fontSize: '1rem', fontWeight: 700 }}>{verification.duration_hours} Verified Hours</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                      DATE OF CONFERRAL
                    </span>
                    <p style={{ fontSize: '1rem', fontWeight: 700 }}>{verification.issue_date}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Issued by FacultyForge AI Continuous Academic Development Cell</span>
                <span>Tier-1 NBA Compliant</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
