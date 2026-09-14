import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, asArray } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  MessageSquareCode,
  Star,
  Sparkles,
  ThumbsUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Send,
} from 'lucide-react';

export default function FeedbackIntelligencePage() {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('event_id');
  const { activeFacultyId } = useAuth();

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || '');
  const [feedbackIntel, setFeedbackIntel] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Submit Feedback State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [form, setForm] = useState({
    content_rating: 5,
    trainer_rating: 5,
    relevance_rating: 5,
    practical_rating: 4,
    organization_rating: 5,
    comments: '',
    suggestions: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadIntelligence(selectedEventId);
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
      setActionError(err.message || 'Failed to load programmes');
    }
  };

  const loadIntelligence = async (eId) => {
    if (!eId) return;
    setLoading(true);
    try {
      const [intel, fbList] = await Promise.all([
        api.getEventFeedbackIntelligence(eId),
        api.getEventFeedback(eId),
      ]);
      setFeedbackIntel(intel && typeof intel === 'object' ? intel : null);
      setFeedbacks(asArray(fbList, 'feedback'));
    } catch (err) {
      console.error('Failed to load feedback intelligence:', err);
      setActionError(err.message || 'Failed to load feedback intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setActionMsg('');
    setActionError('');

    try {
      await api.submitFeedback(selectedEventId, {
        faculty_id: activeFacultyId,
        ...form,
      });
      setActionMsg('Feedback registered successfully. Feedback Intelligence Agent re-calculated metrics.');
      setShowSubmitModal(false);
      setForm({
        content_rating: 5,
        trainer_rating: 5,
        relevance_rating: 5,
        practical_rating: 5,
        organization_rating: 5,
        comments: '',
        suggestions: '',
      });
      loadIntelligence(selectedEventId);
    } catch (err) {
      setActionError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <MessageSquareCode size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Feedback Intelligence</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Multidimensional sentiment, theme extraction, and institutional recommendations synthesized from participant reviews.
        </p>
      </div>

      {/* Event Selector & Action Button */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Programme:</label>
            <select
              className="form-select"
              style={{ minWidth: '300px' }}
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

        <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary btn-sm">
          <Send size={14} />
          <span>Submit Participant Feedback</span>
        </button>
      </div>

      {actionMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>{actionMsg}</span>
        </div>
      )}

      {actionError && (
        <div className="alert alert-danger">
          <AlertTriangle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {feedbackIntel && feedbackIntel.total_responses > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Overall Rating Callout */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1.5rem',
              background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(59, 130, 246, 0.05) 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ textAlign: 'center', paddingRight: '1.5rem', borderRight: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>
                  {feedbackIntel.overall_rating}
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OVERALL RATING / 5.0</p>
                <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center', marginTop: '0.25rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                  ))}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{feedbackIntel.event_title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  Analyzed {feedbackIntel.total_responses} detailed responses &bull; Trainer Sentiment: <strong>{feedbackIntel.trainer_sentiment}</strong>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  Practical Lab Sentiment: <strong>{feedbackIntel.practical_sentiment}</strong>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                  {feedbackIntel.sentiment_distribution?.Positive || 0}%
                </span>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>POSITIVE</p>
              </div>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#93c5fd' }}>
                  {feedbackIntel.sentiment_distribution?.Neutral || 0}%
                </span>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>NEUTRAL</p>
              </div>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>
                  {feedbackIntel.sentiment_distribution?.Critical || 0}%
                </span>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>CRITICAL</p>
              </div>
            </div>
          </div>

          {/* Strengths & Issues Breakdown */}
          <div className="grid-2">
            {/* Strengths */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ThumbsUp size={18} style={{ color: '#34d399' }} />
                <h3 style={{ fontSize: '1rem' }}>Identified Strengths & Highlights</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {feedbackIntel.positive_themes?.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>

            {/* Issues */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} style={{ color: '#fbbf24' }} />
                <h3 style={{ fontSize: '1rem' }}>Reported Issues & Bottlenecks</h3>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                {feedbackIntel.negative_themes?.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '3px solid #3b82f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lightbulb size={18} style={{ color: 'var(--brand-primary)' }} />
              <h3 style={{ fontSize: '1rem' }}>AI Agent Recommended Improvements for Future Editions</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {feedbackIntel.recommended_improvements?.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>&bull;</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px dashed var(--border-subtle)' }}>
          <MessageSquareCode size={44} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Feedback Submitted Yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            No participant reviews have been recorded for this programme yet. Ratings, thematic analysis, and pedagogical suggestions will populate here dynamically once feedback is submitted.
          </p>
          <button onClick={() => setShowSubmitModal(true)} className="btn btn-primary btn-sm">
            <Send size={14} />
            <span>Submit Participant Feedback</span>
          </button>
        </div>
      )}

      {/* Submit Feedback Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Programme Feedback"
      >
        <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Please evaluate the programme across the 5 core quality parameters (Ratings 1 to 5):
          </p>

          <div className="grid-2">
            {[
              { key: 'content_rating', label: '1. Content Depth & Relevance' },
              { key: 'trainer_rating', label: '2. Trainer Expertise & Clarity' },
              { key: 'relevance_rating', label: '3. Relevance to Department' },
              { key: 'practical_rating', label: '4. Hands-on Lab Activities' },
              { key: 'organization_rating', label: '5. Overall Organization' },
            ].map((crit) => (
              <div key={crit.key} className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">{crit.label}</label>
                <select
                  className="form-select"
                  value={form[crit.key]}
                  onChange={(e) => setForm({ ...form, [crit.key]: parseInt(e.target.value) })}
                >
                  <option value={5}>5 - Outstanding</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Satisfactory</option>
                  <option value={2}>2 - Needs Improvement</option>
                  <option value={1}>1 - Unsatisfactory</option>
                </select>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Positive Comments</label>
            <input
              type="text"
              className="form-input"
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Constructive Suggestions</label>
            <input
              type="text"
              className="form-input"
              value={form.suggestions}
              onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowSubmitModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
