import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, asArray } from '../services/api';
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
  const { activeFacultyId, currentFaculty } = useAuth();

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

  // Coordinator Assessment & Question Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    assessment_type: 'PRE',
    title: '',
    total_marks: 30,
    passing_marks: 15,
  });
  const [creatingAssessment, setCreatingAssessment] = useState(false);

  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [selectedAssessmentForQuestion, setSelectedAssessmentForQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'a',
    marks: 5,
    explanation: '',
  });
  const [addingQuestion, setAddingQuestion] = useState(false);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return;
    setCreatingAssessment(true);
    try {
      await api.createAssessment({
        event_id: Number(selectedEventId),
        ...createForm,
      });
      setShowCreateModal(false);
      setCreateForm({ assessment_type: 'POST', title: '', total_marks: 30, passing_marks: 15 });
      loadAssessmentsAndImpact(selectedEventId);
    } catch (err) {
      alert(err.message || 'Failed to create assessment');
    } finally {
      setCreatingAssessment(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedAssessmentForQuestion) return;
    setAddingQuestion(true);
    try {
      await api.addAssessmentQuestion(selectedAssessmentForQuestion.id, questionForm);
      setShowAddQuestionModal(false);
      setQuestionForm({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'a',
        marks: 5,
        explanation: '',
      });
      loadAssessmentsAndImpact(selectedEventId);
    } catch (err) {
      alert(err.message || 'Failed to add question');
    } finally {
      setAddingQuestion(false);
    }
  };

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
      const eventList = asArray(list, 'events');
      setEvents(eventList);
      if (eventList.length > 0) {
        if (!selectedEventId || !eventList.some((e) => String(e.id) === String(selectedEventId))) {
          setSelectedEventId(String(eventList[0].id));
        }
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setErrorMsg(err.message || 'Failed to load programmes');
    }
  };

  const loadAssessmentsAndImpact = async (eId) => {
    if (!eId) return;
    setLoading(true);
    try {
      const [assList, impact] = await Promise.all([
        api.getEventAssessments(eId),
        api.getEventLearningImpact(eId),
      ]);
      setAssessments(asArray(assList, 'assessments'));
      setLearningImpact(impact && typeof impact === 'object' ? impact : null);
    } catch (err) {
      console.error('Failed to load assessments:', err);
      setErrorMsg(err.message || 'Failed to load assessment data');
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

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Event Selector */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Select Programme:</label>
        <select
          className="form-select"
          style={{ minWidth: '320px' }}
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          {events.length === 0 && <option value="">No programmes available</option>}
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.event_code} - {e.title || e.programme_title}
            </option>
          ))}
        </select>
      </div>

      {/* Learning Gain Summary Banner */}
      {learningImpact && learningImpact.has_data ? (
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
                {learningImpact.learning_gain_pp >= 0 ? `+${learningImpact.learning_gain_pp}` : learningImpact.learning_gain_pp} pp
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
      ) : (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--border-subtle)' }}>
          <FileQuestion size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Assessment Data Available</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '600px', margin: '0 auto' }}>
            {learningImpact?.explanation || "No assessment attempts recorded yet for this programme. Pre and post assessment scores will populate once participants complete the tests."}
          </p>
        </div>
      )}

      {/* Assessments Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Programme Tests & Quizzes</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-outline btn-sm"
        >
          + Create Assessment
        </button>
      </div>

      {/* Assessments List */}
      <div className="grid-2">
        {assessments.length === 0 ? (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center', border: '1px dashed var(--border-subtle)', gridColumn: 'span 2' }}>
            <GraduationCap size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Assessments Configured</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Coordinators can create diagnostic PRE assessments and competency POST assessments to evaluate participant progress.
            </p>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
              Create First Assessment
            </button>
          </div>
        ) : (
          assessments.map((a) => (
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

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  onClick={() => {
                    setSelectedAssessmentForQuestion(a);
                    setShowAddQuestionModal(true);
                  }}
                  className="btn btn-outline btn-xs"
                >
                  + Add Question
                </button>
                <button
                  onClick={() => startTest(a)}
                  className="btn btn-primary btn-sm"
                  disabled={!a.questions || a.questions.length === 0}
                >
                  <span>Take {a.assessment_type} Assessment</span>
                </button>
              </div>
            </div>
          ))
        )}
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
                Participant: {attemptResult.faculty_name || (currentFaculty ? currentFaculty.full_name : 'Registered Participant')}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Select the best answer for each question. Answers are scored automatically.
              </p>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {takingAssessment?.questions?.length || 0} Questions Total
              </span>
            </div>

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

      {/* Create Assessment Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Programme Assessment"
        maxWidth="550px"
      >
        <form onSubmit={handleCreateAssessment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Assessment Type *</label>
            <select
              className="form-select"
              value={createForm.assessment_type}
              onChange={(e) => setCreateForm({ ...createForm, assessment_type: e.target.value })}
              required
            >
              <option value="PRE">PRE-ASSESSMENT (Diagnostic baseline)</option>
              <option value="POST">POST-ASSESSMENT (Post-training competency)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Assessment Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Diagnostic Pre-Assessment: AI for Engineers"
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div>
              <label className="form-label">Total Marks *</label>
              <input
                type="number"
                className="form-input"
                value={createForm.total_marks}
                onChange={(e) => setCreateForm({ ...createForm, total_marks: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="form-label">Passing Marks *</label>
              <input
                type="number"
                className="form-input"
                value={createForm.passing_marks}
                onChange={(e) => setCreateForm({ ...createForm, passing_marks: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={creatingAssessment} className="btn btn-primary btn-sm">
              {creatingAssessment ? 'Creating...' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Question Modal */}
      <Modal
        isOpen={showAddQuestionModal}
        onClose={() => setShowAddQuestionModal(false)}
        title={`Add Question to ${selectedAssessmentForQuestion?.title || 'Assessment'}`}
        maxWidth="600px"
      >
        <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="form-label">Question Text *</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Enter the question statement..."
              value={questionForm.question_text}
              onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div>
              <label className="form-label">Option A *</label>
              <input
                type="text"
                className="form-input"
                value={questionForm.option_a}
                onChange={(e) => setQuestionForm({ ...questionForm, option_a: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Option B *</label>
              <input
                type="text"
                className="form-input"
                value={questionForm.option_b}
                onChange={(e) => setQuestionForm({ ...questionForm, option_b: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Option C *</label>
              <input
                type="text"
                className="form-input"
                value={questionForm.option_c}
                onChange={(e) => setQuestionForm({ ...questionForm, option_c: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Option D *</label>
              <input
                type="text"
                className="form-input"
                value={questionForm.option_d}
                onChange={(e) => setQuestionForm({ ...questionForm, option_d: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="form-label">Correct Option *</label>
              <select
                className="form-select"
                value={questionForm.correct_option}
                onChange={(e) => setQuestionForm({ ...questionForm, correct_option: e.target.value })}
                required
              >
                <option value="a">Option A</option>
                <option value="b">Option B</option>
                <option value="c">Option C</option>
                <option value="d">Option D</option>
              </select>
            </div>
            <div>
              <label className="form-label">Marks *</label>
              <input
                type="number"
                className="form-input"
                value={questionForm.marks}
                onChange={(e) => setQuestionForm({ ...questionForm, marks: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Explanation (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Why this answer is correct..."
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowAddQuestionModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={addingQuestion} className="btn btn-primary btn-sm">
              {addingQuestion ? 'Saving...' : 'Add Question'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
