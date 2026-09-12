import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import {
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileQuestion,
  BarChart,
} from 'lucide-react';

export default function AssessmentsPage() {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('event_id');
  const { activeFacultyId } = useAuth();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || '');
  const [assessments, setAssessments] = useState([]);
  const [learningImpact, setLearningImpact] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test Taking State
  const [takingAssessment, setTakingAssessment] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [attemptResult, setAttemptResult] = useState(null);
  const [submittingTest, setSubmittingTest] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadAssessmentsAndImpact(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const list = await api.getEvents();
      setEvents(list);
      if (!selectedEventId && list.length > 0) {
        setSelectedEventId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAssessmentsAndImpact = async (eId) => {
    setLoading(true);
    try {
      const [assList, impact] = await Promise.all([
        api.getEventAssessments(eId),
        api.getEventLearningImpact(eId),
      ]);
      setAssessments(assList);
      setLearningImpact(impact);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (assessment) => {
    setTakingAssessment(assessment);
    setUserAnswers({});
    setAttemptResult(null);
    setErrorMsg('');
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    setSubmittingTest(true);
    setErrorMsg('');

    try {
      const res = await api.submitAssessment(takingAssessment.id, {
        faculty_id: activeFacultyId,
        answers: userAnswers,
      });
      setAttemptResult(res);
      // Refresh learning gain impact
      loadAssessmentsAndImpact(selectedEventId);
    } catch (err) {
      setErrorMsg(err.message || 'Submission failed');
    } finally {
      setSubmittingTest(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <GraduationCap size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Assessments & Learning Gain Measurement</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Outcome-based cognitive evaluation tracking normalized learning gains (percentage points) between diagnostic PRE and competency POST tests.
        </p>
      </div>

      {/* Event Selector */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Programme:</label>
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

      {/* Learning Gain Summary Banner */}
      {learningImpact && (
        <div
          className="card"
          style={{
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(16, 185, 129, 0.05) 100%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                LEARNING IMPACT AGENT ANALYSIS
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{learningImpact.event_title}</h2>
            </div>
            <span className="badge badge-high" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
              Impact: {learningImpact.impact_level}
            </span>
          </div>

          <div className="grid-4" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRE-ASSESSMENT AVERAGE</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#93c5fd' }}>
                {learningImpact.pre_average}%
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>POST-ASSESSMENT AVERAGE</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
                {learningImpact.post_average}%
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>LEARNING GAIN (DELTA)</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399' }}>
                +{learningImpact.learning_gain_pp} pp
              </p>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>COHORT ATTENDANCE</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                {learningImpact.attendance_rate}%
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {learningImpact.explanation}
          </p>
        </div>
      )}

      {/* Assessments List */}
      <div className="grid-2">
        {assessments.map((a) => (
          <div
            key={a.id}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className={`badge ${a.assessment_type === 'PRE' ? 'badge-low' : 'badge-completed'}`}>
                  {a.assessment_type}-ASSESSMENT
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Passing: {a.passing_marks} / {a.total_marks} Marks
                </span>
              </div>

              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>{a.title}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Contains {a.questions?.length || 0} multiple choice diagnostic questions.
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => startTest(a)}
                className="btn btn-primary btn-sm"
              >
                <span>Take {a.assessment_type} Test (Demo)</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Test Modal */}
      <Modal
        isOpen={!!takingAssessment}
        onClose={() => setTakingAssessment(null)}
        title={takingAssessment ? takingAssessment.title : 'Take Assessment'}
        maxWidth="700px"
      >
        {attemptResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Assessment Submitted!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Participant: {attemptResult.faculty_name || 'Dr. Ayesha Khan'}
              </p>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', display: 'inline-block', margin: '0 auto' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#34d399' }}>
                {attemptResult.percentage}%
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Score: {attemptResult.score} Marks
              </p>
            </div>

            <button onClick={() => setTakingAssessment(null)} className="btn btn-primary" style={{ alignSelf: 'center' }}>
              Close & View Updated Learning Gain
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTest} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Select the best answer for each question. Answers will be scored dynamically.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {takingAssessment?.questions?.map((q, idx) => (
                <div
                  key={q.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    {idx + 1}. {q.question_text}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['a', 'b', 'c', 'd'].map((opt) => {
                      const optText = q[`option_${opt}`];
                      if (!optText) return null;
                      return (
                        <label
                          key={opt}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.625rem',
                            fontSize: '0.8125rem',
                            cursor: 'pointer',
                            padding: '0.35rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            background: userAnswers[q.id] === opt ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                          }}
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            value={opt}
                            checked={userAnswers[q.id] === opt}
                            onChange={() => setUserAnswers({ ...userAnswers, [q.id]: opt })}
                            required
                          />
                          <span><strong>{opt.toUpperCase()}:</strong> {optText}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
              <button type="button" onClick={() => setTakingAssessment(null)} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button type="submit" disabled={submittingTest} className="btn btn-primary btn-sm">
                {submittingTest ? 'Scoring...' : 'Submit Answers'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
