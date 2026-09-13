import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Award, ExternalLink, QrCode, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CertificatesPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadCertificates(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const list = await api.getEvents();
      setEvents(list);
      if (list.length > 0) setSelectedEventId(list[0].id);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCertificates = async (eId) => {
    setLoading(true);
    try {
      const certs = await api.getEventCertificates(eId);
      setCertificates(certs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    setGenerating(true);
    setActionMsg('');
    try {
      const created = await api.generateCertificates(selectedEventId);
      setActionMsg(`Generated ${created.length} digital certificates for eligible participants.`);
      loadCertificates(selectedEventId);
    } catch (err) {
      alert(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <Award size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Institutional Certificate Management</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Token-verifiable digital credentials verifiable publicly with unique tokens and QR verification.
        </p>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Programme:</label>
          <select
            className="form-select"
            style={{ minWidth: '320px' }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.event_code} - {e.title}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleGenerateAll} disabled={generating} className="btn btn-primary btn-sm">
          <Award size={14} />
          <span>{generating ? 'Issuing...' : 'Generate For All Eligible Faculty'}</span>
        </button>
      </div>

      {actionMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Certificates Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem' }}>Issued Credentials ({certificates.length})</h3>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
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
                    No certificates issued for this programme yet. Click 'Generate For All Eligible Faculty'.
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
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
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
