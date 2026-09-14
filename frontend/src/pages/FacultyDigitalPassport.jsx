import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  GraduationCap,
  Award,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Clock,
  Users,
} from 'lucide-react';

export default function FacultyDigitalPassport() {
  const { id } = useParams();
  const { activeFacultyId } = useAuth();
  const facultyId = parseInt(id) || activeFacultyId || 1;

  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPassport();
  }, [facultyId]);

  const loadPassport = async () => {
    setLoading(true);
    try {
      const data = await api.getFacultyPassport(facultyId);
      setPassport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !passport) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
        <p>Retrieving Faculty Digital Passport Dossier...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Passport Header Dossier */}
      <div
        className="card"
        style={{
          border: '1px solid rgba(59, 130, 246, 0.3)',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(23, 32, 51, 0.95) 100%)',
          boxShadow: 'var(--brand-glow)',
          padding: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            top: '-40px',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#60a5fa',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
              }}
            >
              <GraduationCap size={16} />
              <span>Official Institutional Academic Credential</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
              {passport.full_name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Department: <strong>{passport.department_name}</strong> &bull; {passport.designation} ({passport.qualification})
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              ID: {passport.faculty_code} &bull; Experience: {passport.years_of_experience} Years
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            {(() => {
              const status = passport.compliance?.status;
              let bg = 'rgba(148, 163, 184, 0.15)';
              let color = '#94a3b8';
              let border = '1px solid rgba(148, 163, 184, 0.3)';
              let text = status ? status.replace(/_/g, ' ') : 'PENDING EVALUATION';

              if (status === 'COMPLIANT') {
                bg = 'rgba(16, 185, 129, 0.15)';
                color = '#34d399';
                border = '1px solid rgba(16, 185, 129, 0.3)';
                text = 'COMPLIANT';
              } else if (status === 'ATTENTION_REQUIRED') {
                bg = 'rgba(245, 158, 11, 0.15)';
                color = '#fbbf24';
                border = '1px solid rgba(245, 158, 11, 0.3)';
                text = 'ATTENTION REQUIRED';
              } else if (status === 'NON_COMPLIANT') {
                bg = 'rgba(239, 68, 68, 0.15)';
                color = '#f87171';
                border = '1px solid rgba(239, 68, 68, 0.3)';
                text = 'NON-COMPLIANT';
              }

              return (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.4rem 0.9rem',
                    borderRadius: 'var(--radius-full)',
                    background: bg,
                    color: color,
                    border: border,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  {text}
                </span>
              );
            })()}
            <p
              style={{
                fontSize: '0.75rem',
                color: passport.is_academic_council_verified ? '#34d399' : 'var(--text-muted)',
                marginTop: '0.375rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.25rem',
              }}
            >
              {passport.is_academic_council_verified && <CheckCircle2 size={13} style={{ color: '#34d399' }} />}
              <span>{passport.verification_badge_label || (passport.is_academic_council_verified ? 'Academic Council Verified' : 'Institutional Record (Unverified)')}</span>
            </p>
          </div>
        </div>

        {/* 4 Quantitative Badges */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
          }}
        >
          <div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              {passport.fdps_completed}
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>FDPs COMPLETED</p>
          </div>
          <div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
              {passport.workshops_completed}
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>WORKSHOPS COMPLETED</p>
          </div>
          <div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
              {passport.total_training_hours} hrs
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TRAINING HOURS</p>
          </div>
          <div>
            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7' }}>
              {passport.certificates_count}
            </span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CERTIFICATES ISSUED</p>
          </div>
        </div>
      </div>

      {/* Row 2: Skills Acquired & Learning Impact */}
      <div className="grid-2">
        {/* Skills Acquired & Validated vs Profile Skills */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {passport.has_verified_skills && passport.validated_skills?.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={18} style={{ color: 'var(--brand-primary)' }} />
                <h3 style={{ fontSize: '1.125rem' }}>Skills Acquired & Validated</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Demonstrated competencies verified through FDP assessments and certified programmes:
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {passport.validated_skills.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      padding: '0.35rem 0.75rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.25)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <CheckCircle2 size={13} style={{ color: '#60a5fa' }} />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>

              {passport.profile_skills?.length > 0 && (
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Profile Skills (Self-Reported)
                  </p>
                  <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    {passport.profile_skills.map((skill, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.6rem',
                          background: 'rgba(148, 163, 184, 0.08)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={18} style={{ color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: '1.125rem' }}>Profile Skills</h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Self-reported profile competencies declared upon onboarding (Unverified &bull; Pending FDP Validation):
              </p>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {(passport.profile_skills?.length > 0 ? passport.profile_skills : passport.skills_acquired)?.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      padding: '0.35rem 0.75rem',
                      background: 'rgba(148, 163, 184, 0.08)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Empirical Learning Gain */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} style={{ color: passport.has_assessment_data ? 'var(--color-success)' : 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.125rem' }}>Measurable Learning Impact</h3>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Average normalized cognitive progression across all assessed workshops:
          </p>

          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: passport.has_assessment_data ? 'rgba(16, 185, 129, 0.08)' : 'rgba(148, 163, 184, 0.06)',
              border: passport.has_assessment_data ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: passport.has_assessment_data ? '2rem' : '1.35rem',
                  fontWeight: 900,
                  color: passport.has_assessment_data ? '#34d399' : 'var(--text-muted)',
                }}
              >
                {passport.has_assessment_data
                  ? (passport.learning_impact_label || `${passport.average_learning_gain_pp >= 0 ? '+' : ''}${passport.average_learning_gain_pp} pp`)
                  : 'No assessment data'}
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {passport.has_assessment_data
                  ? 'AVERAGE LEARNING GAIN (PERCENTAGE POINTS)'
                  : 'PRE/POST ASSESSMENT EVALUATION PENDING'}
              </p>
            </div>
            {(() => {
              if (!passport.has_assessment_data) {
                return (
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(148, 163, 184, 0.15)',
                      color: '#94a3b8',
                      border: '1px solid rgba(148, 163, 184, 0.25)',
                    }}
                  >
                    Impact: NO DATA
                  </span>
                );
              }
              const lvl = passport.learning_impact_level || 'LOW';
              let bg = 'rgba(245, 158, 11, 0.15)';
              let col = '#fbbf24';
              if (lvl === 'HIGH') {
                bg = 'rgba(16, 185, 129, 0.15)';
                col = '#6ee7b7';
              } else if (lvl === 'MODERATE') {
                bg = 'rgba(59, 130, 246, 0.15)';
                col = '#60a5fa';
              } else if (lvl === 'NO CHANGE') {
                bg = 'rgba(148, 163, 184, 0.15)';
                col = '#cbd5e1';
              }
              return (
                <span className="badge" style={{ background: bg, color: col }}>
                  Impact: {lvl}
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Row 3: Active Skill Gaps & Recommended Next Training */}
      <div className="grid-2">
        {/* Active Skill Gaps */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Active Competency Gaps</h3>
            <Link to={`/app/faculty/${facultyId}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              Run Analysis
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {passport.skill_gaps?.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No active skill gaps identified.
              </p>
            ) : (
              passport.skill_gaps?.map((g, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{g.skill}</span>
                  <StatusBadge status={g.priority} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Next Recommended Training */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--brand-accent)' }} />
            <h3 style={{ fontSize: '1.125rem' }}>Recommended Next Training</h3>
          </div>

          {passport.next_recommended_training ? (
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <StatusBadge status={passport.next_recommended_training.priority} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {passport.next_recommended_training.recommended_duration}
                </span>
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>
                {passport.next_recommended_training.title}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {passport.next_recommended_training.reason}
              </p>
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                <Link
                  to={`/app/ai-generator?prompt=${encodeURIComponent(`Create a 2-day FDP on ${passport.next_recommended_training.title}`)}`}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  <span>Launch Programme Draft</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              No pending recommendations.
            </p>
          )}
        </div>
      </div>

      {/* Row 4: Chronological Training Passport Dossier */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Verifiable Training Timeline</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Programme Title</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Date Completed</th>
                <th>Certificate Verification</th>
              </tr>
            </thead>
            <tbody>
              {passport.training_history?.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                    No completed programmes recorded yet.
                  </td>
                </tr>
              ) : (
                passport.training_history?.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{item.title}</td>
                    <td>
                      <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                        {item.event_type}
                      </span>
                    </td>
                    <td>{item.duration_hours} hrs</td>
                    <td>{item.completed_date}</td>
                    <td>
                      {item.verification_token ? (
                        <Link
                          to={`/verify-certificate/${item.verification_token}`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        >
                          <ExternalLink size={12} />
                          <span>Verify ({item.certificate_code})</span>
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Certificate Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW SECTION 1 & 2: VERIFIED SKILLS & SKILL EVIDENCE */}
      <div className="grid-2">
        {/* Verified Skills */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} style={{ color: '#059669' }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Verified Competency Passport</h3>
            </div>
            <Link to="/app/skill-evidence" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              Evidence Desk
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {passport.verified_skills?.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No verified skills recorded yet.
              </p>
            ) : (
              passport.verified_skills?.map((s, idx) => {
                const isV = s.verification_status === 'VERIFIED';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 0.875rem',
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      border: isV ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{s.skill_name}</span>
                      <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Level: {s.proficiency_level} &bull; {s.evidence_count} evidence item(s)
                      </p>
                    </div>

                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: isV ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: isV ? '#059669' : '#d97706',
                      }}
                    >
                      {s.verification_status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Applied Learning (Teaching Impact) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} style={{ color: '#0284c7' }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Applied Learning in Classrooms</h3>
            </div>
            <Link to="/app/teaching-impact" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              Impact Desk
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {passport.applied_learning?.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No practical classroom or laboratory applications recorded yet.
              </p>
            ) : (
              passport.applied_learning?.map((app, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 0.875rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                      {app.skill_name} ({app.application_type})
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        background: 'rgba(2, 132, 199, 0.1)',
                        color: '#0284c7',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                      }}
                    >
                      {app.impact_status}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {app.application_description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* NEW SECTION 3 & 4: CAREER GOAL & PEER MENTORS */}
      <div className="grid-2">
        {/* Career Growth Goal */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} style={{ color: '#2563eb' }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Career Growth Trajectory</h3>
            </div>
            <Link to={`/app/faculty/${facultyId}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              View Roadmap
            </Link>
          </div>

          {passport.career_goal ? (
            <div
              style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.7) 0%, rgba(219, 234, 254, 0.7) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e3a8a' }}>
                  {passport.career_goal.goal_title}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 900, color: '#2563eb' }}>
                  {passport.career_goal.progress_percentage}%
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#1e40af' }}>
                <strong>Next Priority Step:</strong> {passport.career_goal.next_recommended_step}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              No active career roadmap selected.
            </p>
          )}
        </div>

        {/* Peer Mentors */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: '#059669' }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Recommended Peer Mentors</h3>
            </div>
            <Link to="/app/peer-mentors" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              Peer Matching
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {passport.peer_mentors?.length === 0 ? (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                No peer mentors assigned currently.
              </p>
            ) : (
              passport.peer_mentors?.map((pm, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>{pm.mentor_name}</span>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      {pm.department} &bull; {pm.skill_level}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#059669' }}>
                    {pm.match_score}% Match
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* NEW SECTION 5: FDP EFFECTIVENESS HISTORY */}
      {passport.fdp_effectiveness_history?.length > 0 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Completed FDP Effectiveness History</h3>
            <Link to="/app/fdp-effectiveness" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              Full ROI Analytics
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Attended Programme</th>
                  <th>Effectiveness Score</th>
                  <th>Impact Level</th>
                  <th>Learning Score</th>
                  <th>Attendance Consistency</th>
                </tr>
              </thead>
              <tbody>
                {passport.fdp_effectiveness_history.map((eff, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{eff.event_title}</td>
                    <td>
                      <span style={{ fontWeight: 800, color: '#2563eb' }}>
                        {eff.effectiveness_score}/100
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#059669',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {eff.impact_level}
                      </span>
                    </td>
                    <td>{eff.learning_score}/100</td>
                    <td>{eff.attendance_score}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
