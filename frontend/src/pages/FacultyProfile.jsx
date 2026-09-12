import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  User,
  GraduationCap,
  Sparkles,
  Award,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  Calendar,
  Compass,
  ArrowRight,
} from 'lucide-react';

export default function FacultyProfile() {
  const { id } = useParams();
  const facultyId = parseInt(id) || 1;

  const [faculty, setFaculty] = useState(null);
  const [activeTab, setActiveTab] = useState('skill-gaps');
  const [loading, setLoading] = useState(true);

  // Agent State
  const [skillGaps, setSkillGaps] = useState([]);
  const [analyzingGaps, setAnalyzingGaps] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [generatingRecs, setGeneratingRecs] = useState(false);
  const [compliance, setCompliance] = useState(null);
  const [passport, setPassport] = useState(null);
  const [agentSuccessMsg, setAgentSuccessMsg] = useState('');

  // Extended Intelligence State
  const [peerMentors, setPeerMentors] = useState([]);
  const [careerPath, setCareerPath] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState('RESEARCH_MENTOR');

  useEffect(() => {
    loadFacultyData();
  }, [facultyId]);

  const loadFacultyData = async () => {
    setLoading(true);
    try {
      const [facData, gapsData, recsData, compData, passData, mentorsData, careerData] = await Promise.all([
        api.getFaculty(facultyId),
        api.getFacultySkillGaps(facultyId),
        api.getFacultyRecommendations(facultyId),
        api.getFacultyCompliance(facultyId),
        api.getFacultyPassport(facultyId),
        api.getPeerMentors(facultyId).catch(() => ({ mentor_matches: [] })),
        api.getCareerGrowthPath(facultyId, selectedGoal).catch(() => null),
      ]);
      setFaculty(facData);
      setSkillGaps(gapsData.skill_gaps || []);
      setRecommendations(recsData.recommendations || []);
      setCompliance(compData);
      setPassport(passData);
      setPeerMentors(mentorsData?.mentor_matches || []);
      setCareerPath(careerData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalChange = async (newGoal) => {
    setSelectedGoal(newGoal);
    try {
      const data = await api.getCareerGrowthPath(facultyId, newGoal);
      setCareerPath(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunSkillGapAnalysis = async () => {
    setAnalyzingGaps(true);
    setAgentSuccessMsg('');
    try {
      const res = await api.runSkillGapAgent(facultyId);
      setSkillGaps(res.skill_gaps || []);
      setAgentSuccessMsg(`Skill Gap Agent completed analysis: identified ${res.skill_gaps?.length} active competency deficits.`);
      // Refresh passport
      const p = await api.getFacultyPassport(facultyId);
      setPassport(p);
    } catch (err) {
      alert(err.message || 'Analysis failed');
    } finally {
      setAnalyzingGaps(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    setGeneratingRecs(true);
    setAgentSuccessMsg('');
    try {
      const res = await api.runRecommendationAgent(facultyId);
      setRecommendations(res.recommendations || []);
      setAgentSuccessMsg(`Recommendation Agent synthesized ${res.recommendations?.length} tailored development proposals.`);
      const p = await api.getFacultyPassport(facultyId);
      setPassport(p);
    } catch (err) {
      alert(err.message || 'Failed to generate recommendations');
    } finally {
      setGeneratingRecs(false);
    }
  };

  if (loading || !faculty) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
        <p>Loading Faculty Intelligence Profile...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Profile Header Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-card) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.5rem',
              fontWeight: 800,
              boxShadow: 'var(--brand-glow)',
            }}
          >
            {faculty.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{faculty.full_name}</h1>
              <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                {faculty.department_name || 'CSE'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {faculty.designation} &bull; {faculty.qualification} &bull; {faculty.years_of_experience} Years Experience
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {faculty.faculty_code} &bull; {faculty.email}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to={`/app/faculty/${faculty.id}/passport`} className="btn btn-primary btn-sm">
            <GraduationCap size={15} />
            <span>Digital Passport</span>
          </Link>
          <button onClick={handleRunSkillGapAnalysis} disabled={analyzingGaps} className="btn btn-secondary btn-sm">
            <BrainCircuit size={15} />
            <span>{analyzingGaps ? 'Analyzing...' : 'Run AI Skill Analysis'}</span>
          </button>
        </div>
      </div>

      {agentSuccessMsg && (
        <div className="alert alert-success">
          <Sparkles size={16} />
          <span>{agentSuccessMsg}</span>
        </div>
      )}

      {/* Tabs Header */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'skill-gaps' ? 'active' : ''}`}
          onClick={() => setActiveTab('skill-gaps')}
        >
          Skill Gaps ({skillGaps.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          Training Recommendations ({recommendations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Profile Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'training-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('training-history')}
        >
          Training History ({passport?.training_history?.length || 0})
        </button>
        <button
          className={`tab-btn ${activeTab === 'peer-mentors' ? 'active' : ''}`}
          onClick={() => setActiveTab('peer-mentors')}
        >
          Peer Mentors ({peerMentors.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'career-growth' ? 'active' : ''}`}
          onClick={() => setActiveTab('career-growth')}
        >
          Career Growth
        </button>
        <button
          className={`tab-btn ${activeTab === 'compliance' ? 'active' : ''}`}
          onClick={() => setActiveTab('compliance')}
        >
          Compliance Status
        </button>
      </div>

      {/* TAB CONTENT: SKILL GAPS */}
      {activeTab === 'skill-gaps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>AI Skill Gap Analysis</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Evaluates syllabus requirements, teaching interests, and past training history
              </p>
            </div>
            <button
              onClick={handleRunSkillGapAnalysis}
              disabled={analyzingGaps}
              className="btn btn-primary btn-sm"
            >
              <Sparkles size={14} />
              <span>{analyzingGaps ? 'Analyzing AI Agents...' : 'RUN AI SKILL ANALYSIS'}</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Competency / Skill</th>
                  <th>Current Level</th>
                  <th>Required Level</th>
                  <th>Gap Score</th>
                  <th>Priority</th>
                  <th>Empirical Reasoning</th>
                </tr>
              </thead>
              <tbody>
                {skillGaps.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No active skill gaps identified. Click 'RUN AI SKILL ANALYSIS' to analyze competency profile.
                    </td>
                  </tr>
                ) : (
                  skillGaps.map((g, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 700 }}>{g.skill}</td>
                      <td>
                        <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                          {g.current_level}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-draft" style={{ fontSize: '0.6875rem' }}>
                          {g.required_level}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 800, color: g.gap_score >= 75 ? '#f87171' : '#fbbf24' }}>
                          {g.gap_score}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={g.priority} />
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '400px' }}>
                        {g.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Personalized Training Recommendations</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Synthesized by Recommendation Agent targeting identified skill gaps
              </p>
            </div>
            <button
              onClick={handleGenerateRecommendations}
              disabled={generatingRecs}
              className="btn btn-primary btn-sm"
            >
              <Sparkles size={14} />
              <span>{generatingRecs ? 'Generating...' : 'GENERATE TRAINING RECOMMENDATIONS'}</span>
            </button>
          </div>

          <div className="grid-2">
            {recommendations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>
                No recommendations generated yet. Click 'GENERATE TRAINING RECOMMENDATIONS'.
              </p>
            ) : (
              recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="card"
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <StatusBadge status={rec.priority} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Duration: {rec.recommended_duration}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.0625rem', marginBottom: '0.5rem' }}>{rec.title}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {rec.reason}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                      Confidence: {Math.round((rec.confidence_score || 0.9) * 100)}%
                    </span>
                    <Link
                      to={`/app/ai-generator?prompt=${encodeURIComponent(`Create a 2-day FDP on ${rec.title}`)}`}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <span>Create FDP Draft</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFILE OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Teaching & Research Specializations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                TEACHING INTERESTS
              </span>
              <p style={{ fontSize: '0.875rem' }}>{faculty.teaching_interests || 'Computer Science'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                RESEARCH DOMAINS
              </span>
              <p style={{ fontSize: '0.875rem' }}>{faculty.research_interests || 'Artificial Intelligence'}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                DEVELOPMENT GOALS
              </span>
              <p style={{ fontSize: '0.875rem' }}>{faculty.development_interests || 'Generative AI'}</p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>Existing Validated Skills</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {faculty.existing_skills?.split(',').map((s, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.8125rem',
                    background: 'var(--bg-card)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontWeight: 600,
                  }}
                >
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TRAINING HISTORY */}
      {activeTab === 'training-history' && (
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Completed Training Programmes</h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Programme Title</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Date Completed</th>
                  <th>Certificate Code</th>
                </tr>
              </thead>
              <tbody>
                {passport?.training_history?.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      No completed training records found.
                    </td>
                  </tr>
                ) : (
                  passport?.training_history?.map((th, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{th.title}</td>
                      <td>
                        <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                          {th.event_type}
                        </span>
                      </td>
                      <td>{th.duration_hours} hrs</td>
                      <td>{th.completed_date}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#60a5fa' }}>
                        {th.certificate_code || 'Pending Issue'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COMPLIANCE */}
      {activeTab === 'compliance' && compliance && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Annual Faculty Development Compliance</h3>
            <StatusBadge status={compliance.status} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <div>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, color: compliance.status === 'COMPLIANT' ? '#34d399' : '#fbbf24' }}>
                {compliance.completed_hours} / {compliance.required_hours}
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>HOURS COMPLETED</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                <span>Compliance Progress</span>
                <span style={{ fontWeight: 700 }}>{compliance.compliance_percentage}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${compliance.compliance_percentage}%`,
                    background: compliance.status === 'COMPLIANT' ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {compliance.remaining_hours > 0
                  ? `${compliance.remaining_hours} hours remaining to meet annual institutional CPD target.`
                  : 'Institutional annual faculty development targets successfully fulfilled.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PEER MENTORS */}
      {activeTab === 'peer-mentors' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Internal Faculty Peer Mentors</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Identified internal mentors matching current competency deficits for {faculty.full_name}
              </p>
            </div>
            <Link to="/app/peer-mentors" className="btn btn-outline btn-sm">
              <Compass size={14} />
              <span>Full Peer Matching Desk</span>
            </Link>
          </div>

          {peerMentors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No peer mentor matches currently active.</p>
            </div>
          ) : (
            <div className="grid-2">
              {peerMentors.map((m) => (
                <div
                  key={m.mentor_faculty_id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.875rem',
                    border: m.match_score >= 90 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{m.mentor_name}</h4>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {m.designation} &bull; {m.department}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 900,
                        color: m.match_score >= 90 ? '#10b981' : '#2563eb',
                      }}
                    >
                      {m.match_score}% Match
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Competency Mastery:</span>
                    <span className="badge badge-high" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                      {m.skill_level}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'rgba(241, 245, 249, 0.6)', padding: '0.625rem', borderRadius: 'var(--radius-md)' }}>
                    {m.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CAREER GROWTH */}
      {activeTab === 'career-growth' && careerPath && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Professional Growth Trajectory</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Structured multi-step career progression framework
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Target Goal:</label>
              <select
                className="input"
                value={selectedGoal}
                onChange={(e) => handleGoalChange(e.target.value)}
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8125rem' }}
              >
                <option value="RESEARCH_MENTOR">Research Mentor & PI</option>
                <option value="AI_ENABLED_EDUCATOR">AI-Enabled Digital Educator</option>
                <option value="ACADEMIC_LEADER">Academic Leader & Quality Admin</option>
                <option value="INDUSTRY_READY_FACULTY">Industry-Ready Technical Educator</option>
                <option value="INNOVATION_MENTOR">Innovation & Incubation Mentor</option>
                <option value="PUBLICATION_FOCUSED_RESEARCHER">High-Impact Publication Specialist</option>
              </select>
            </div>
          </div>

          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(219, 234, 254, 0.9) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
                CURRENT MILESTONE PROGRESS ({careerPath.target_timeline_months} MONTHS)
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1e3a8a' }}>
                {careerPath.current_progress_percentage}%
              </span>
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1e3a8a' }}>
              {careerPath.goal_title}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#1e40af' }}>{careerPath.description}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {careerPath.path?.map((step) => (
              <div
                key={step.step_number}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1.25rem',
                  border: step.current_status === 'COMPLETED' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.875rem' }}>
                      Step {step.step_number}: {step.skill_or_milestone}
                    </span>
                    <StatusBadge status={step.priority} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Training: {step.recommended_training}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    background: step.current_status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: step.current_status === 'COMPLETED' ? '#059669' : '#d97706',
                  }}
                >
                  {step.current_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
