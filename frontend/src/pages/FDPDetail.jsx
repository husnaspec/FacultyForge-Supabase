import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  Calendar,
  Clock,
  Compass,
  FileCheck2,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  MessageSquareCode,
  FileText,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';

export default function FDPDetail() {
  const { id } = useParams();
  const eventId = parseInt(id);
  const navigate = useNavigate();
  const { isAdmin, isApprover, activeFacultyId } = useAuth();

  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resource Matcher State
  const [matchingRP, setMatchingRP] = useState(false);
  const [rankedMatches, setRankedMatches] = useState([]);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Action status message
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadEventData();
  }, [eventId]);

  const loadEventData = async () => {
    setLoading(true);
    try {
      const [ev, regs] = await Promise.all([
        api.getEvent(eventId),
        api.getEventRegistrations(eventId),
      ]);
      setEvent(ev);
      setRegistrations(regs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchResourcePerson = async () => {
    setMatchingRP(true);
    setActionMsg('');
    try {
      const res = await api.runResourceMatcherAgent(eventId);
      setRankedMatches(res.matches || []);
      setShowMatchModal(true);
    } catch (err) {
      setActionError(err.message || 'Resource matching failed');
    } finally {
      setMatchingRP(false);
    }
  };

  const handleSubmitProposal = async () => {
    setActionMsg('');
    setActionError('');
    try {
      await api.submitProposal(eventId, 'Programme Coordinator');
      setActionMsg('FDP proposal submitted to HOD / IQAC for approval.');
      loadEventData();
    } catch (err) {
      setActionError(err.message || 'Failed to submit proposal');
    }
  };

  const handleOpenRegistration = async () => {
    setActionMsg('');
    setActionError('');
    try {
      await api.updateEvent(eventId, { status: 'REGISTRATION_OPEN' });
      setActionMsg('Programme registration is now open to faculty members!');
      loadEventData();
    } catch (err) {
      setActionError(err.message || 'Failed to open registration');
    }
  };

  const handleQuickRegister = async () => {
    setActionMsg('');
    setActionError('');
    try {
      await api.registerForEvent(eventId, activeFacultyId);
      setActionMsg('Registered faculty successfully for this programme!');
      loadEventData();
    } catch (err) {
      setActionError(err.message || 'Registration failed');
    }
  };

  const handleGenerateCertificates = async () => {
    setActionMsg('');
    setActionError('');
    try {
      const certs = await api.generateCertificates(eventId);
      setActionMsg(`Successfully generated ${certs.length} verified digital certificates.`);
      loadEventData();
    } catch (err) {
      setActionError(err.message || 'Certificate generation failed');
    }
  };

  if (loading || !event) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
        <p>Loading Programme Details...</p>
      </div>
    );
  }

  const isRegistered = registrations.some((r) => r.faculty_id === activeFacultyId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-low">{event.event_type}</span>
              <span className="badge badge-draft">{event.delivery_mode}</span>
              <StatusBadge status={event.status} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{event.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Department: <strong>{event.department_name}</strong> &bull; Coordinator: {event.coordinator_name || 'Academic Committee'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Code: {event.event_code} &bull; Capacity: {registrations.length} / {event.capacity} seats
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleMatchResourcePerson}
              disabled={matchingRP}
              className="btn btn-primary btn-sm"
            >
              <Compass size={14} />
              <span>{matchingRP ? 'Ranking Experts...' : 'FIND BEST RESOURCE PERSON'}</span>
            </button>

            {event.status === 'DRAFT' && (
              <button onClick={handleSubmitProposal} className="btn btn-secondary btn-sm">
                <FileCheck2 size={14} />
                <span>Submit for Approval</span>
              </button>
            )}

            {event.status === 'APPROVED' && (
              <button onClick={handleOpenRegistration} className="btn btn-success btn-sm">
                <Users size={14} />
                <span>Open Registration</span>
              </button>
            )}

            {event.status === 'REGISTRATION_OPEN' && (
              <button
                onClick={handleQuickRegister}
                disabled={isRegistered}
                className={`btn ${isRegistered ? 'btn-secondary' : 'btn-success'} btn-sm`}
              >
                <Users size={14} />
                <span>{isRegistered ? 'Registered' : 'Register (Demo Faculty)'}</span>
              </button>
            )}

            <button onClick={handleGenerateCertificates} className="btn btn-outline btn-sm">
              <Award size={14} />
              <span>Generate Certificates</span>
            </button>
          </div>
        </div>

        {actionMsg && (
          <div className="alert alert-success">
            <CheckCircle2 size={16} />
            <span>{actionMsg}</span>
          </div>
        )}

        {actionError && (
          <div className="alert alert-danger">
            <AlertCircle size={16} />
            <span>{actionError}</span>
          </div>
        )}

        {/* Programme Nav Links */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          <Link to={`/app/attendance?event_id=${event.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
            <span>Record Attendance</span>
          </Link>
          <Link to={`/app/assessments?event_id=${event.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
            <TrendingUp size={13} />
            <span>Assessments & Learning Gain</span>
          </Link>
          <Link to={`/app/feedback-intelligence?event_id=${event.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
            <MessageSquareCode size={13} />
            <span>Feedback Intelligence</span>
          </Link>
          <Link to={`/app/reports/${event.id}`} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem' }}>
            <FileText size={13} />
            <span>Final FDP Dossier Report</span>
          </Link>
        </div>
      </div>

      {/* Description & Syllabus */}
      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem' }}>Programme Objectives</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {event.objectives || 'Equip faculty with hands-on laboratory capabilities and modern syllabus delivery.'}
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem' }}>NBA Learning Outcomes</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {event.learning_outcomes || 'Competency to formulate lesson rubrics and integrate state-of-the-art topics.'}
          </p>
        </div>
      </div>

      {/* Day-Wise Sessions */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Programme Schedule & Sessions ({event.sessions?.length || 0})</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {event.sessions?.length === 0 ? (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              No sessions scheduled yet.
            </p>
          ) : (
            event.sessions.map((s, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.875rem 1rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                      Session {idx + 1}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {s.start_time || '09:30 AM'} - {s.end_time || '12:30 PM'}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{s.title}</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {s.learning_objective || s.description}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', marginTop: '0.25rem' }}>
                    Resource Person: {s.resource_person_name || 'Assigned Expert'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Registrations List */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
          Registered Faculty ({registrations.length} / {event.capacity})
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Code</th>
                <th>Participant Name</th>
                <th>Department</th>
                <th>Registered At</th>
                <th>Completion Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No faculty registrations yet.
                  </td>
                </tr>
              ) : (
                registrations.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {r.faculty_code}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.faculty_name}</td>
                    <td>{r.department_name || 'CSE'}</td>
                    <td>{new Date(r.registered_at).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={r.completion_status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Matcher Modal (Section 10) */}
      <Modal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        title={`Ranked Resource Persons for ${event.title}`}
        maxWidth="750px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Resource Matcher Agent evaluated active trainers based on topic similarity, participant feedback ratings, and delivery experience:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {rankedMatches.map((m, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: idx === 0 ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: idx === 0 ? 'var(--brand-primary)' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{m.name}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#34d399', fontWeight: 700 }}>
                      Match: {m.match_score}%
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#fbbf24' }}>
                      ★ {m.rating}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {m.designation} &bull; {m.organization} &bull; {m.experience_years} Years Exp
                </p>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                  "{m.reason}"
                </p>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {m.expertise_areas?.slice(0, 4).map((area, aIdx) => (
                    <span
                      key={aIdx}
                      style={{
                        fontSize: '0.6875rem',
                        background: 'rgba(255,255,255,0.05)',
                        padding: '0.15rem 0.4rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setShowMatchModal(false)} className="btn btn-secondary btn-sm">
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
