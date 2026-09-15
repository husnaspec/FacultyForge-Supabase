'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import {
  Share2,
  Sparkles,
  Award,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function KnowledgeSharingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduled, setScheduled] = useState(() => {
    try {
      const saved = localStorage.getItem('knowledge_sharing_scheduled');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    loadSharing();
  }, []);

  const loadSharing = async () => {
    setLoading(true);
    try {
      const res = await api.getKnowledgeSharing();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = (idx, facultyName, topic) => {
    const key = `${facultyName}-${topic}`;
    setScheduled((prev) => {
      const next = { ...prev, [idx]: true, [key]: true };
      try {
        localStorage.setItem('knowledge_sharing_scheduled', JSON.stringify(next));
      } catch {}
      return next;
    });
    setTimeout(() => {
      alert(`Colloquium session '${topic}' led by ${facultyName} has been queued for departmental calendar coordination.`);
    }, 150);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span className="badge badge-high" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              INTERNAL CAPACITY BUILDING
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Peer Colloquium Agent
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Internal Knowledge Sharing Recommender</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '800px' }}>
            Transform external training into internal institutional knowledge. When faculty complete high-impact FDPs
            with demonstrated learning gains, recommend peer-led brown-bag colloquiums to cascade capabilities.
          </p>
        </div>
      </div>

      {/* Rationale Banner */}
      {data && (
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(224, 242, 254, 0.8) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem',
          }}
        >
          <Share2 size={24} style={{ color: '#2563eb', flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1e3a8a' }}>
              Institutional Knowledge Multiplication
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#1e40af', marginTop: '0.2rem', lineHeight: 1.5 }}>
              {data.rationale}
            </p>
          </div>
        </div>
      )}

      {/* Sharing Cards Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Analyzing training impact vectors...</p>
      ) : data?.recommendations?.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No knowledge sharing recommendations pending at this time.</p>
        </div>
      ) : (
        <div className="grid-2">
          {data?.recommendations?.map((r, idx) => {
            const isScheduled = scheduled[idx] || scheduled[`${r.recommended_faculty_name}-${r.topic}`];
            return (
              <div
                key={idx}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: r.impact_score >= 90 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                      }}
                    >
                      {r.recommended_faculty_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>
                        {r.recommended_faculty_name}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {r.designation} &bull; {r.department}
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      IMPACT SCORE
                    </span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#059669' }}>
                      {r.impact_score}/100
                    </div>
                  </div>
                </div>

                {/* Session Proposal Card */}
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.875rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#2563eb' }}>
                      PROPOSED TOPIC
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.1)',
                        color: '#059669',
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                      }}
                    >
                      +{r.learning_gain_achieved} pp Learning Gain
                    </span>
                  </div>

                  <span style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
                    {r.topic}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    <span>Target: {r.target_department}</span>
                    <span>Format: {r.suggested_duration}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  <strong>Recommendation Rationale:</strong> {r.reason}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <button
                    onClick={() => handleSchedule(idx, r.recommended_faculty_name, r.topic)}
                    disabled={isScheduled}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Calendar size={14} />
                    <span>{isScheduled ? 'Session Scheduled' : 'Schedule Internal Knowledge Session'}</span>
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
