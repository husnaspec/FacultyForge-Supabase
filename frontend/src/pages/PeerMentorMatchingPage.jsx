import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Send,
  Filter,
  GraduationCap,
  MessageSquare,
  Shield,
  Star,
} from 'lucide-react';

export default function PeerMentorMatchingPage() {
  const { activeFacultyId } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(activeFacultyId || 1);
  const [skillNameFilter, setSkillNameFilter] = useState('');
  const [mentorData, setMentorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState({});

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      loadMentorMatches();
    }
  }, [selectedFacultyId, skillNameFilter]);

  const loadFaculty = async () => {
    try {
      const list = await api.getFacultyList();
      setFacultyList(list || []);
      if (!selectedFacultyId && list.length > 0) {
        setSelectedFacultyId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadMentorMatches = async () => {
    setLoading(true);
    try {
      const data = await api.getPeerMentors(selectedFacultyId, skillNameFilter || undefined);
      setMentorData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = (mentorId, mentorName) => {
    setRequestSent((prev) => ({ ...prev, [mentorId]: true }));
    setTimeout(() => {
      alert(`Mentorship request successfully dispatched to ${mentorName}. Notification queued for departmental HOD approval.`);
    }, 150);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span className="badge badge-high" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              INTERNAL FACULTY MENTORSHIP
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              AI Intelligence Agent
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Faculty Peer Mentor Matcher</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '800px' }}>
            Identify high-proficiency internal faculty mentors to resolve identified competency deficits
            through peer coaching, collaborative course development, and research mentorship.
          </p>
        </div>
      </div>

      {/* Control Filters */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1', minWidth: '220px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            TARGET FACULTY MEMBER
          </label>
          <select
            className="input"
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(parseInt(e.target.value))}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.full_name} ({f.department_name || f.faculty_code})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1', minWidth: '220px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            SKILL GAP FILTER (OPTIONAL)
          </label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Research Methodology, Generative AI..."
            value={skillNameFilter}
            onChange={(e) => setSkillNameFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          />
        </div>

        <div style={{ alignSelf: 'flex-end' }}>
          <button onClick={loadMentorMatches} className="btn btn-secondary btn-sm" disabled={loading}>
            <Sparkles size={15} />
            <span>{loading ? 'Matching...' : 'Refresh Matches'}</span>
          </button>
        </div>
      </div>

      {/* Results Header */}
      {mentorData && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Award size={20} style={{ color: '#2563eb' }} />
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                Matched Mentors for Competency: <span style={{ color: '#2563eb' }}>{mentorData.skill_gap}</span>
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Comparing faculty skills, training completions, assessment performances, and years of experience.
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {mentorData.mentor_matches?.length || 0} Internal Candidates
          </span>
        </div>
      )}

      {/* Mentor Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Evaluating internal faculty skill vectors...
        </div>
      ) : mentorData?.mentor_matches?.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No matching internal mentors found for this specific filter.</p>
        </div>
      ) : (
        <div className="grid-2">
          {mentorData?.mentor_matches?.map((m) => {
            const isRequested = requestSent[m.mentor_faculty_id];
            return (
              <div
                key={m.mentor_faculty_id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: m.match_score >= 90 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                  position: 'relative',
                }}
              >
                {m.match_score >= 90 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      color: '#059669',
                      background: 'rgba(16, 185, 129, 0.12)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    BEST MATCH
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.125rem',
                      flexShrink: 0,
                    }}
                  >
                    {m.mentor_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>

                  <div style={{ flex: '1', paddingRight: '4rem' }}>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                      {m.mentor_name}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {m.designation} &bull; {m.department}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {m.years_of_experience} Years Academic Experience
                    </p>
                  </div>
                </div>

                {/* Score & Level Metrics */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      PROFICIENCY
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                      <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{m.skill_level}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      MATCH SCORE
                    </span>
                    <div style={{ fontSize: '1.125rem', fontWeight: 900, color: m.match_score >= 90 ? '#10b981' : '#2563eb' }}>
                      {m.match_score}%
                    </div>
                  </div>
                </div>

                {/* AI Reasoning */}
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, background: 'rgba(241, 245, 249, 0.6)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Why this match: </strong>
                  {m.reason}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleSendRequest(m.mentor_faculty_id, m.mentor_name)}
                    disabled={isRequested}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Send size={14} />
                    <span>{isRequested ? 'Mentorship Requested' : 'Connect for Peer Mentoring'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
