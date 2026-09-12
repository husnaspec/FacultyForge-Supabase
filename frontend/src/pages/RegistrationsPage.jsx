import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import { UserCheck2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegistrationsPage() {
  const { activeFacultyId } = useAuth();
  const [openEvents, setOpenEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadOpenEvents();
  }, []);

  const loadOpenEvents = async () => {
    setLoading(true);
    try {
      const all = await api.getEvents();
      // Programmes with registration open or approved
      const available = all.filter((e) =>
        ['REGISTRATION_OPEN', 'APPROVED', 'ONGOING'].includes(e.status)
      );
      setOpenEvents(available);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    setMsg('');
    setError('');
    try {
      await api.registerForEvent(eventId, activeFacultyId);
      setMsg('Registered successfully! Completion status: IN_PROGRESS.');
      loadOpenEvents();
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <UserCheck2 size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Programme Registration Portal</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Browse accredited programmes currently accepting faculty enrolments. Prevents duplicate registrations.
        </p>
      </div>

      {msg && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {openEvents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>
            No programmes are currently open for registration.
          </p>
        ) : (
          openEvents.map((ev) => (
            <div
              key={ev.id}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <StatusBadge status={ev.status} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Seats: {ev.registered_count || 0} / {ev.capacity}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem' }}>{ev.title}</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Dept: {ev.department_name} &bull; Mode: {ev.delivery_mode} &bull; Duration: {ev.duration_hours} hrs
                </p>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {ev.description || 'Intensive pedagogical and research development workshop for engineering faculty.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link to={`/app/events/${ev.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                  View Syllabus
                </Link>

                <button
                  onClick={() => handleRegister(ev.id)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  <span>Enrol (Dr. Ayesha Khan)</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
