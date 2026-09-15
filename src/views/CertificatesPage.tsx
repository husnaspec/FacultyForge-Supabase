'use client';
import React, { useState, useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { api, asArray } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import {
  Award,
  ExternalLink,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Users,
  ShieldCheck,
  XCircle,
  FileCheck2,
} from 'lucide-react';

export default function CertificatesPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadCertificates(selectedEventId);
      loadEligibility(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const list = await api.getEvents();
      const eventList = asArray(list, 'events');
      setEvents(eventList);
      if (eventList.length > 0) {
        if (!selectedEventId || !eventList.some((e) => String(e.id) === String(selectedEventId))) {
          setSelectedEventId(String(eventList[0].id));
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load programmes');
    }
  };

  const loadCertificates = async (eId) => {
    if (!eId) return;
    setLoading(true);
    try {
      const certs = await api.getEventCertificates(eId);
      setCertificates(asArray(certs, 'certificates'));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  const loadEligibility = async (eId) => {
    if (!eId) return;
    setEligibilityLoading(true);
    try {
      const data = await api.getCertificateEligibility(eId);
      setEligibilityData(data);
    } catch (err) {
      console.error('Failed to load certificate eligibility:', err);
      // Do not silently mask error
      setErrorMsg(err.message || 'Failed to load certificate eligibility');
    } finally {
      setEligibilityLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    setGenerating(true);
    setActionMsg('');
    setErrorMsg('');
    try {
      const res = await api.generateCertificates(selectedEventId);
      const genCount = res?.generated_count !== undefined ? res.generated_count : (Array.isArray(res) ? res.length : 0);
      const skipCount = res?.skipped_count !== undefined ? res.skipped_count : 0;
      const reasons = res?.reasons || [];

      let msg = `Generated ${genCount} digital certificate${genCount === 1 ? '' : 's'} for eligible participants.`;
      if (skipCount > 0) {
        msg += ` (${skipCount} participant${skipCount === 1 ? '' : 's'} skipped due to unmet eligibility criteria).`;
      }
      setActionMsg(msg);

      // Refresh both certificates and eligibility table immediately
      await Promise.all([
        loadCertificates(selectedEventId),
        loadEligibility(selectedEventId),
      ]);
    } catch (err) {
      console.error('Generation failed:', err);
      setErrorMsg(err.message || 'Certificate generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const participants = eligibilityData?.participants || [];
  const eligibleCount = eligibilityData?.eligible_count ?? 0;
  const ineligibleCount = eligibilityData?.ineligible_count ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1180px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <Award size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Institutional Certificate Management</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Token-verifiable digital credentials verifiable publicly with unique tokens and QR verification.
          Participants must satisfy verified attendance, assessment, feedback, and programme completion thresholds.
        </p>
      </div>

      {/* Programme Selector & Action Card */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Programme:</label>
          <select
            className="form-select"
            style={{ minWidth: '340px' }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            id="certificate-programme-select"
          >
            {events.length === 0 && <option value="">No programmes available</option>}
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.event_code} - {e.title || e.programme_title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={() => {
              loadEligibility(selectedEventId);
              loadCertificates(selectedEventId);
            }}
            disabled={eligibilityLoading || loading}
            className="btn btn-outline btn-sm"
            title="Refresh participant eligibility status"
            id="refresh-eligibility-btn"
          >
            <RefreshCw size={14} className={eligibilityLoading ? 'animate-spin' : ''} />
            <span>Refresh Eligibility</span>
          </button>

          <button
            onClick={handleGenerateAll}
            disabled={generating}
            className="btn btn-primary btn-sm"
            id="generate-certificates-btn"
          >
            <Award size={14} />
            <span>{generating ? 'Issuing...' : 'Generate For All Eligible Faculty'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '6px' }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {actionMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#047857', padding: '0.75rem 1rem', borderRadius: '6px' }}>
          <CheckCircle2 size={18} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Real-time Participant Eligibility Verification Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck2 size={18} style={{ color: 'var(--brand-primary)' }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
                Participant Certificate Eligibility ({participants.length})
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {eligibilityData?.criteria_summary || (
                participants.some((p) => p.pre_status !== 'Not Required' || p.post_status !== 'Not Required')
                  ? 'Audited participant-level criteria: Confirmed Registration, Attendance ≥ 60%, PRE/POST Assessments, Feedback, and Programme Completion.'
                  : 'Audited participant-level criteria: Confirmed Registration, Attendance ≥ 60%, Feedback, and Programme Completion (PRE/POST assessments not required for this programme).'
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#059669', fontWeight: 700 }}>
              Eligible: {eligibleCount}
            </span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', fontWeight: 700 }}>
              Not Eligible: {ineligibleCount}
            </span>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'rgba(241, 245, 249, 0.6)' }}>
                <th>Participant</th>
                <th>Registration Status</th>
                <th>Attendance %</th>
                <th>PRE</th>
                <th>POST</th>
                <th>Feedback</th>
                <th>Programme Completion</th>
                <th>Eligibility</th>
                <th style={{ minWidth: '220px' }}>Reason</th>
              </tr>
            </thead>
            <tbody>
              {eligibilityLoading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    Evaluating participant eligibility from backend...
                  </td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No registered participants found for this programme.
                  </td>
                </tr>
              ) : (
                participants.map((p) => {
                  const isEligible = p.is_eligible;
                  const isIssued = p.already_issued;

                  return (
                    <tr key={p.registration_id} style={{ background: isIssued ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                      {/* Participant */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 700 }}>{p.participant_name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {p.faculty_code ? `${p.faculty_code} · ` : ''}{p.email || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Registration Status */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: p.registration_status_pass ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                            color: p.registration_status_pass ? '#059669' : '#dc2626',
                          }}
                        >
                          {p.registration_status}
                        </span>
                      </td>

                      {/* Attendance % */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: p.attendance_pass ? '#059669' : '#dc2626',
                            }}
                          >
                            {Math.round(p.attendance_percentage)}%
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            ({p.attended_sessions}/{p.total_sessions})
                          </span>
                        </div>
                      </td>

                      {/* PRE */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: p.pre_pass ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: p.pre_pass ? '#059669' : '#d97706',
                          }}
                        >
                          {p.pre_status}
                        </span>
                      </td>

                      {/* POST */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: p.post_pass ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: p.post_pass ? '#059669' : '#d97706',
                          }}
                        >
                          {p.post_status}
                        </span>
                      </td>

                      {/* Feedback */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: p.feedback_pass ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: p.feedback_pass ? '#059669' : '#d97706',
                          }}
                        >
                          {p.feedback_status}
                        </span>
                      </td>

                      {/* Programme Completion */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            background: p.programme_pass ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                            color: p.programme_pass ? '#059669' : '#64748b',
                          }}
                        >
                          {p.programme_status}
                        </span>
                      </td>

                      {/* Eligibility */}
                      <td>
                        {isIssued ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: 'rgba(37, 99, 235, 0.12)',
                              color: '#2563eb',
                            }}
                          >
                            <CheckCircle2 size={12} />
                            ISSUED
                          </span>
                        ) : isEligible ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: 'rgba(16, 185, 129, 0.14)',
                              color: '#059669',
                            }}
                          >
                            <CheckCircle2 size={12} />
                            ELIGIBLE
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              background: 'rgba(239, 68, 68, 0.12)',
                              color: '#dc2626',
                            }}
                          >
                            <XCircle size={12} />
                            NOT ELIGIBLE
                          </span>
                        )}
                      </td>

                      {/* Reason */}
                      <td style={{ fontSize: '0.75rem', color: isEligible ? '#059669' : 'var(--text-secondary)' }}>
                        {isIssued ? (
                          <span style={{ color: '#2563eb', fontWeight: 600 }}>
                            Certificate issued: {p.certificate_code}
                          </span>
                        ) : (
                          p.reason
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Issued Credentials ({certificates.length})</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Publicly verifiable cryptographic credentials issued upon complete criteria satisfaction
            </p>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'rgba(241, 245, 249, 0.6)' }}>
                <th>Certificate Code</th>
                <th>Recipient Name</th>
                <th>Programme</th>
                <th>Hours</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Public Verification</th>
              </tr>
            </thead>
            <tbody>
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No certificates issued for this programme yet. Click 'Generate For All Eligible Faculty' when participants meet all requirements.
                  </td>
                </tr>
              ) : (
                certificates.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>
                      {c.certificate_code}
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.faculty_name}</td>
                    <td style={{ fontSize: '0.8125rem' }}>{c.event_title}</td>
                    <td>{c.training_hours} hrs</td>
                    <td>{new Date(c.issue_date).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <Link
                        to={`/verify-certificate/${c.verification_token}`}
                        target="_blank"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <ExternalLink size={12} />
                        <span>Verify Token</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
