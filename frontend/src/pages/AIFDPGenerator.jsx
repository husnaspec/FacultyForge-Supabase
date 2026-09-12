import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Sparkles,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  GraduationCap,
  Users,
  DollarSign,
  BookOpen,
} from 'lucide-react';

export default function AIFDPGenerator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState(
    searchParams.get('prompt') || 'Create a 2-day FDP on Generative AI for Engineering Faculty'
  );
  const [targetDays, setTargetDays] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [generatedFDP, setGeneratedFDP] = useState(null);
  const [error, setError] = useState('');
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  const samplePrompts = [
    'Create a 2-day FDP on Generative AI for Engineering Faculty',
    'Design a 3-day STTP on Cybersecurity and Zero-Trust Architecture',
    'Generate an Outcome-Based Education (OBE) & Bloom Attainment Workshop',
    'Create a 3-day FDP on High-Impact Research Methodology & Scopus Publishing',
  ];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setGenerating(true);
    setError('');
    setGeneratedFDP(null);
    setProposalSubmitted(false);

    try {
      const blueprint = await api.generateFDP(prompt, 1, targetDays);
      setGeneratedFDP(blueprint);
    } catch (err) {
      setError(err.message || 'AI Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!generatedFDP?.created_draft_event_id) return;
    setSubmittingProposal(true);
    try {
      await api.submitProposal(generatedFDP.created_draft_event_id, 'FDP Coordinator');
      setProposalSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setSubmittingProposal(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--brand-glow)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI FDP Generator Agent</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Synthesizes complete curriculum blueprints, day-wise schedules, pre/post evaluation questions, and budget drafts.
          All generated programmes are strictly created in <strong>DRAFT</strong> state for review.
        </p>
      </div>

      {/* Input Generator Form */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Enter Programme Description / Topic Prompt</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Natural Language Pedagogical Specification</span>
            </label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '80px', fontSize: '0.9375rem' }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a 2-day FDP on Generative AI for Engineering Faculty"
              required
            />
          </div>

          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Try Demo:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(p)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Target Duration:</label>
              <select
                className="form-select"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8125rem' }}
                value={targetDays}
                onChange={(e) => setTargetDays(parseInt(e.target.value))}
              >
                <option value={1}>1 Day (8 Hours)</option>
                <option value={2}>2 Days (16 Hours - Recommended)</option>
                <option value={3}>3 Days (24 Hours)</option>
                <option value={5}>5 Days (40 Hours STTP)</option>
              </select>
            </div>

            <button type="submit" disabled={generating} className="btn btn-primary">
              <Sparkles size={16} />
              <span>{generating ? 'Synthesizing FDP Blueprint...' : 'Generate FDP Programme'}</span>
            </button>
          </div>
        </form>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Generated Result Blueprint */}
      {generatedFDP && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Action Callout Bar */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <CheckCircle2 size={18} style={{ color: '#34d399' }} />
                <span style={{ fontWeight: 800, color: '#34d399' }}>
                  FDP Successfully Generated & Saved as DRAFT!
                </span>
                <StatusBadge status="DRAFT" />
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Event ID #{generatedFDP.created_draft_event_id} created in database. Ready for coordinator review and HOD submission.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link
                to={`/app/events/${generatedFDP.created_draft_event_id}`}
                className="btn btn-secondary btn-sm"
              >
                <span>Edit Full Event</span>
              </Link>
              {proposalSubmitted ? (
                <span className="badge badge-pending" style={{ padding: '0.5rem 0.85rem' }}>
                  Proposal Submitted (Pending Approval)
                </span>
              ) : (
                <button
                  onClick={handleSubmitForApproval}
                  disabled={submittingProposal}
                  className="btn btn-primary btn-sm"
                >
                  <FileCheck2 size={14} />
                  <span>{submittingProposal ? 'Submitting...' : 'Submit for Approval'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Blueprint Overview */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-low" style={{ marginBottom: '0.5rem' }}>
                  {generatedFDP.event_type} &bull; {generatedFDP.delivery_mode}
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{generatedFDP.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Duration: {generatedFDP.duration_hours} Training Hours &bull; Capacity: {generatedFDP.capacity} seats &bull; Budget Draft: Rs. {generatedFDP.estimated_budget?.toLocaleString()}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              {generatedFDP.description}
            </p>

            <div className="grid-2">
              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>
                  OBJECTIVES
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {generatedFDP.objectives}
                </p>
              </div>

              <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--brand-primary)' }}>
                  LEARNING OUTCOMES (NBA-OBE)
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {generatedFDP.learning_outcomes}
                </p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem', color: 'var(--brand-primary)' }}>
                RESOURCE PERSON EXPERTISE REQUIREMENT
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {generatedFDP.trainer_expertise_requirement}
              </p>
            </div>
          </div>

          {/* Schedule Blueprint */}
          <div className="card">
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Day-Wise Session Schedule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {generatedFDP.schedule?.map((s, idx) => (
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
                        Day {s.day} &bull; Session {s.session_num}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.time}</span>
                    </div>
                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{s.title}</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {s.objective}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Questions (Pre & Post) */}
          <div className="grid-2">
            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-info)' }}>
                Pre-Assessment Diagnostic Questions ({generatedFDP.pre_assessment_questions?.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {generatedFDP.pre_assessment_questions?.map((q, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.375rem' }}>{idx + 1}. {q.question_text}</p>
                    <p style={{ color: 'var(--text-muted)' }}>A: {q.option_a}</p>
                    <p style={{ color: 'var(--text-muted)' }}>B: {q.option_b}</p>
                    <p style={{ color: '#34d399', fontSize: '0.75rem', marginTop: '0.25rem' }}>Correct: Option ({q.correct_option.toUpperCase()})</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--brand-primary)' }}>
                Post-Assessment Competency Questions ({generatedFDP.post_assessment_questions?.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {generatedFDP.post_assessment_questions?.map((q, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem' }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.375rem' }}>{idx + 1}. {q.question_text}</p>
                    <p style={{ color: 'var(--text-muted)' }}>A: {q.option_a}</p>
                    <p style={{ color: 'var(--text-muted)' }}>B: {q.option_b}</p>
                    <p style={{ color: '#34d399', fontSize: '0.75rem', marginTop: '0.25rem' }}>Correct: Option ({q.correct_option.toUpperCase()})</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
