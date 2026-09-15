'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import {
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  MessageSquare,
  DollarSign,
  Layers,
  Sparkles,
  BarChart3,
  Calendar,
  ShieldAlert,
} from 'lucide-react';

export default function FDPEffectivenessPage() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [effectiveness, setEffectiveness] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCompletedEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEffectiveness();
    }
  }, [selectedEventId]);

  const loadCompletedEvents = async () => {
    try {
      const data = await api.getEvents();
      // Filter completed or ongoing events
      const valid = data.filter((e) => e.status === 'COMPLETED' || e.status === 'ONGOING' || e.status === 'APPROVED');
      setEvents(valid);
      if (valid.length > 0) {
        // default to event 1 or first completed
        const firstCompleted = valid.find((e) => e.status === 'COMPLETED') || valid[0];
        setSelectedEventId(firstCompleted.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEffectiveness = async () => {
    setLoading(true);
    try {
      const eff = await api.getEventEffectiveness(selectedEventId);
      setEffectiveness(eff);
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
            <span className="badge badge-high" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5' }}>
              ROI & QUALITY ASSURANCE
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Higher-Level Institutional Metric
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>FDP Effectiveness & ROI Score</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '800px' }}>
            A composite effectiveness metric evaluating completed FDPs across learning gain (30%), attendance (15%),
            completion rate (15%), participant feedback (20%), practical application (10%), and cost efficiency (10%).
          </p>
        </div>
      </div>

      {/* Selector */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1', maxWidth: '500px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            SELECT PROGRAMME
          </label>
          <select
            className="input"
            value={selectedEventId || ''}
            onChange={(e) => setSelectedEventId(parseInt(e.target.value))}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.event_code} - {e.title} ({e.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Effectiveness Content */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Calculating multi-factor effectiveness metrics...</p>
      ) : !effectiveness ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Please select a programme to evaluate its effectiveness score.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Hero Banner */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              padding: '2rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  OVERALL FDP EFFECTIVENESS SCORE
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: '#f8fafc' }}>
                  {effectiveness.event_title}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                  Event Code: {effectiveness.event_code} &bull; Completed Participants: {effectiveness.completed_participants}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#38bdf8', lineHeight: 1 }}>
                    {effectiveness.overall_effectiveness_score}
                    <span style={{ fontSize: '1.25rem', color: '#94a3b8' }}>/100</span>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#7dd3fc',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                    }}
                  >
                    IMPACT: {effectiveness.impact_level}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid-3">
            {/* 1. Learning Gain */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LEARNING GAIN (30%)</span>
                <TrendingUp size={16} style={{ color: '#10b981' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>
                {effectiveness.learning_score}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Based on diagnostic pre/post competency gain measurements.
              </p>
            </div>

            {/* 2. Attendance Rate */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>ATTENDANCE (15%)</span>
                <Users size={16} style={{ color: '#2563eb' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb' }}>
                {effectiveness.attendance_score}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                QR and verified session attendance consistency.
              </p>
            </div>

            {/* 3. Completion Rate */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMPLETION (15%)</span>
                <CheckCircle2 size={16} style={{ color: '#059669' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
                {effectiveness.completion_score}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Registered participants completing all mandatory criteria.
              </p>
            </div>

            {/* 4. Feedback Rating */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>FEEDBACK (20%)</span>
                <MessageSquare size={16} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#8b5cf6' }}>
                {effectiveness.feedback_score}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Multi-dimensional participant satisfaction rating.
              </p>
            </div>

            {/* 5. Applied Learning */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>APPLIED LEARNING (10%)</span>
                <Layers size={16} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f59e0b' }}>
                {effectiveness.application_score}
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/100</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Documented classroom or laboratory post-training delivery.
              </p>
            </div>

            {/* 6. Cost Efficiency */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>COST PER PARTICIPANT (10%)</span>
                <DollarSign size={16} style={{ color: '#0284c7' }} />
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7' }}>
                ₹{effectiveness.cost_per_participant?.toFixed(0)}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Actual expenditure (₹{effectiveness.actual_expenditure?.toFixed(0)}) / {effectiveness.completed_participants} participants.
              </p>
            </div>
          </div>

          {/* Institutional Explanations */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Effectiveness Audit Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {effectiveness.breakdown_explanations?.map((exp, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <CheckCircle2 size={15} style={{ color: '#10b981', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{exp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
