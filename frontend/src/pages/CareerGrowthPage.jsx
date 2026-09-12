import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  GraduationCap,
  Award,
  BookOpen,
  Target,
  ChevronRight,
} from 'lucide-react';

const GOAL_OPTIONS = [
  { id: 'RESEARCH_MENTOR', label: 'Research Mentor & Principal Investigator' },
  { id: 'AI_ENABLED_EDUCATOR', label: 'AI-Enabled Digital Educator' },
  { id: 'ACADEMIC_LEADER', label: 'Academic Leader & Quality Administrator' },
  { id: 'INDUSTRY_READY_FACULTY', label: 'Industry-Ready Technical Educator' },
  { id: 'INNOVATION_MENTOR', label: 'Innovation & Incubation Mentor' },
  { id: 'PUBLICATION_FOCUSED_RESEARCHER', label: 'High-Impact Publication Specialist' },
];

export default function CareerGrowthPage() {
  const { activeFacultyId } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(activeFacultyId || 1);
  const [selectedGoal, setSelectedGoal] = useState('RESEARCH_MENTOR');
  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      loadCareerPath();
    }
  }, [selectedFacultyId, selectedGoal]);

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

  const loadCareerPath = async () => {
    setLoading(true);
    try {
      const data = await api.getCareerGrowthPath(selectedFacultyId, selectedGoal);
      setCareerData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span className="badge badge-high" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              PROFESSIONAL TRAJECTORY
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              AI Career Path Agent
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Faculty Career Growth Path</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '800px' }}>
            Select an institutional leadership or pedagogical goal to receive a structured developmental roadmap,
            sequenced training milestones, and personalized capability recommendations.
          </p>
        </div>
      </div>

      {/* Selectors */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1', minWidth: '220px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            FACULTY MEMBER
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '2', minWidth: '280px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            CAREER GROWTH GOAL
          </label>
          <select
            className="input"
            value={selectedGoal}
            onChange={(e) => setSelectedGoal(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            {GOAL_OPTIONS.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Goal Summary Card */}
      {careerData && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(219, 234, 254, 0.8) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Target size={18} style={{ color: '#2563eb' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
                  TARGET TRAJECTORY ({careerData.target_timeline_months} MONTHS)
                </span>
              </div>
              <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#1e3a8a' }}>
                {careerData.goal_title}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
                {careerData.description}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>ROADMAP PROGRESS</span>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>
                {careerData.current_progress_percentage}%
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.7)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${careerData.current_progress_percentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                borderRadius: '4px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          {/* Next Recommended Step */}
          {careerData.next_recommended_step && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#ffffff',
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                color: '#1e3a8a',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <Sparkles size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
              <span>
                <strong>Next Priority Action:</strong> {careerData.next_recommended_step}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Roadmap Timeline */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
          Development Roadmap Milestones
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Synthesizing developmental roadmap...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {careerData?.path?.map((step) => {
              const isCompleted = step.current_status === 'COMPLETED';
              const isInProgress = step.current_status === 'IN_PROGRESS';
              return (
                <div
                  key={step.step_number}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    border: isCompleted
                      ? '1px solid rgba(16, 185, 129, 0.4)'
                      : isInProgress
                      ? '1px solid rgba(245, 158, 11, 0.4)'
                      : '1px solid var(--border-subtle)',
                    padding: '1.125rem 1.25rem',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isCompleted ? '#10b981' : isInProgress ? '#f59e0b' : '#94a3b8',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.875rem',
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? <CheckCircle2 size={18} /> : step.step_number}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.375rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                        {step.step_number}. {step.skill_or_milestone}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 800,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: isCompleted
                              ? 'rgba(16, 185, 129, 0.12)'
                              : isInProgress
                              ? 'rgba(245, 158, 11, 0.12)'
                              : 'rgba(148, 163, 184, 0.12)',
                            color: isCompleted ? '#059669' : isInProgress ? '#d97706' : '#64748b',
                          }}
                        >
                          {step.current_status}
                        </span>
                        <StatusBadge status={step.priority} />
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#2563eb', fontWeight: 600, marginBottom: '0.25rem' }}>
                      Recommended Programme: {step.recommended_training}
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {step.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Guidance Note */}
      {careerData?.ai_guidance && (
        <div
          className="card"
          style={{
            background: 'rgba(248, 250, 252, 0.8)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1rem 1.25rem',
          }}
        >
          <Sparkles size={18} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {careerData.ai_guidance}
          </p>
        </div>
      )}
    </div>
  );
}
