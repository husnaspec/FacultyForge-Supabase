import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart3,
  TrendingUp,
  Target,
  Award,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Users,
  Compass,
} from 'lucide-react';

export default function StrategyDashboard() {
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmap, setHeatmap] = useState(null);
  const [equity, setEquity] = useState(null);

  useEffect(() => {
    loadStrategy();
  }, []);

  const loadStrategy = async () => {
    setLoading(true);
    try {
      const [data, hmData, eqData] = await Promise.all([
        api.getStrategyAnalytics(),
        api.getSkillHeatmap().catch(() => null),
        api.getTrainingEquity().catch(() => null),
      ]);
      setStrategy(data);
      setHeatmap(hmData);
      setEquity(eqData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
        <p>Loading University Strategy & Predictive Analytics...</p>
      </div>
    );
  }

  const summary = strategy?.summary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <BarChart3 size={18} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>University Training Strategy Dashboard</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Institutional oversight, continuous development analytics, and predictive planning for academic excellence.
        </p>
      </div>

      {/* INSTITUTIONAL INTELLIGENCE STRATEGY CLOSED-LOOP */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.9) 0%, rgba(224, 231, 255, 0.9) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: '#4f46e5' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#3730a3', letterSpacing: '0.05em' }}>
              INSTITUTIONAL CLOSED-LOOP INTELLIGENCE LIFECYCLE
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#4338ca', fontWeight: 600 }}>
            Training Gap to University Strategy
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#312e81',
          }}
        >
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            Faculty Skill Gap
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            Training Recommendation
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            Peer Mentor OR FDP
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            FDP Creation
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            Learning Gain
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            Skill Evidence Validation
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            Teaching Application
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            FDP Effectiveness
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            Department Skill Heatmap
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            Training Equity Analysis
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            What-if Simulation
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', border: '1px solid rgba(99, 102, 241, 0.2)', whiteSpace: 'nowrap' }}>
            Predictive Planner
          </span>
          <span>&rarr;</span>
          <span style={{ background: '#4f46e5', color: '#ffffff', padding: '0.35rem 0.65rem', borderRadius: '4px', whiteSpace: 'nowrap' }}>
            University Strategy
          </span>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid-4">
        <MetricCard
          title="LEARNING GAIN (COGNITIVE IMPACT)"
          value={`+${summary.average_learning_gain_pp || 32} pp`}
          subtitle="Pre to Post assessment delta"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="FACULTY COMPLIANCE RATE"
          value={`${summary.compliance_rate || 78}%`}
          subtitle="Annual 40hr requirement met"
          icon={ShieldCheck}
          color="blue"
        />
        <MetricCard
          title="CERTIFICATES ISSUED"
          value={summary.certificates_count || 6}
          subtitle="Verifiable cryptographically"
          icon={Award}
          color="purple"
        />
        <MetricCard
          title="FACULTY WITH SKILL GAPS"
          value={summary.faculty_with_gaps || 8}
          subtitle="Active growth pathways tracked"
          icon={Target}
          color="amber"
        />
      </div>

      {/* Row 1: Training Demand by Topic & Skill Gaps by Category */}
      <div className="grid-2">
        {/* Training Demand by Topic */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Next Semester Training Demand</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Calculated by Predictive Planner Agent based on cumulative skill deficits
              </p>
            </div>
            <Link to="/app/ai-hub" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              Planner
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {strategy?.training_demand?.map((d, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                  <span style={{ fontWeight: 600 }}>{d.topic}</span>
                  <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                    Score: {d.demand_score}
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${d.demand_score}%`,
                      background: idx === 0 ? 'var(--brand-primary)' : idx === 1 ? 'var(--color-info)' : 'var(--color-warning)',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  <span>Target Departments: {d.target_depts.join(', ')}</span>
                  <span>Priority: {idx < 2 ? 'HIGH' : 'MEDIUM'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gaps by Category */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Skill Gaps by Category</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Distribution of identified gaps across academic domains
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {strategy?.skill_gap_categories?.map((cat, idx) => (
              <div
                key={idx}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#3b82f6' : idx === 1 ? '#06b6d4' : idx === 2 ? '#10b981' : '#f59e0b',
                    }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{cat.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{cat.count} gaps</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '40px', textAlign: 'right' }}>
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Department Development Score & Learning Gain Breakdown */}
      <div className="grid-2">
        {/* Department Development Scores */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Department Development Score</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Evaluated based on training hour completion, learning gain, and accreditation files
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {strategy?.department_development_score?.map((dept, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.875rem 1rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{dept.department}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    ({dept.name})
                  </span>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>
                    {dept.faculty_count} faculty members | {dept.training_hours_completed} training hours completed
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>
                    {dept.development_score}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Gain by FDP */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Empirical Learning Gain by Programme</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Pre Assessment vs Post Assessment Cohort Averages
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {strategy?.learning_gain_by_fdp?.map((lg, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.875rem 1rem',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{lg.event_title}</span>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--color-success)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    Gain: +{lg.learning_gain_pp} pp
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <span>Pre Test: <strong>{lg.pre_average}%</strong></span>
                  <span>Post Test: <strong>{lg.post_average}%</strong></span>
                  <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>High Cognitive Growth</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Recommended Next Semester FDPs */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Recommended Next Semester Programmes</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Directly actionable programmes synthesized from faculty skill gaps and curriculum updates
            </p>
          </div>
          <Link to="/app/ai-generator" className="btn btn-primary btn-sm">
            <Sparkles size={15} />
            <span>Generate With AI</span>
          </Link>
        </div>

        <div className="grid-3">
          {strategy?.next_recommended_fdps?.map((rec, idx) => (
            <div
              key={idx}
              style={{
                padding: '1.25rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <StatusBadge status={rec.priority} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rec.duration}</span>
                </div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{rec.topic}</h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {rec.reason}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Depts: {rec.departments.join(', ')}
                </span>
                <Link
                  to={`/app/ai-generator?prompt=${encodeURIComponent(`Create a 2-day FDP on ${rec.topic}`)}`}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  Create Draft
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: DEPARTMENT SKILL HEATMAP */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={18} style={{ color: '#2563eb' }} />
              <h3 style={{ fontSize: '1.125rem' }}>Department Skill Heatmap</h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Cross-departmental competency density and priority upskilling concentrations
            </p>
          </div>
          <Link to="/app/skill-heatmap" className="btn btn-outline btn-sm">
            <span>Open Dedicated Heatmap</span>
          </Link>
        </div>

        {heatmap && (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', textAlign: 'center', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'rgba(241, 245, 249, 0.7)' }}>
                  <th style={{ textAlign: 'left', minWidth: '180px' }}>Skill Domain</th>
                  {heatmap.departments?.map((d) => (
                    <th key={d.code} style={{ minWidth: '100px' }}>{d.code}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.skills?.slice(0, 5).map((skill) => (
                  <tr key={skill}>
                    <td style={{ textAlign: 'left', fontWeight: 700 }}>{skill}</td>
                    {heatmap.departments?.map((d) => {
                      const cell = heatmap.matrix?.[skill]?.[d.code] || { level: 'LOW', score: 40 };
                      const isH = cell.level === 'HIGH';
                      const isM = cell.level === 'MED';
                      return (
                        <td key={d.code}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '4px',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              background: isH ? 'rgba(16, 185, 129, 0.15)' : isM ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: isH ? '#059669' : isM ? '#d97706' : '#dc2626',
                            }}
                          >
                            {cell.level}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 5 & 6: FDP EFFECTIVENESS & PARTICIPATION EQUITY */}
      <div className="grid-2">
        {/* FDP Effectiveness */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} style={{ color: '#4f46e5' }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>FDP Effectiveness / ROI Score</h3>
            </div>
            <Link to="/app/fdp-effectiveness" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              ROI Dashboard
            </Link>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            High-level composite metric weighted across Learning Gain (30%), Attendance (15%), Completion (15%), Feedback (20%), Practical Application (10%), and Cost Efficiency (10%).
          </p>

          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(99, 102, 241, 0.06)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '2rem', fontWeight: 900, color: '#4f46e5' }}>
                88 / 100
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                AVERAGE COMPLETED FDP EFFECTIVENESS
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-high" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
                Overall: HIGH IMPACT
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Avg Cost: ~₹950/participant
              </p>
            </div>
          </div>
        </div>

        {/* Participation Equity */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={18} style={{ color: '#d97706' }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>Participation Equity Analysis</h3>
            </div>
            <Link to="/app/training-equity" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              Equity Audit
            </Link>
          </div>

          {equity ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(245, 158, 11, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#d97706' }}>
                    {equity.participation_equity_score}/100
                  </span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    EQUITY DISTRIBUTION INDEX
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div><strong>{equity.highly_trained_count}</strong> High Participation</div>
                  <div><strong>{equity.moderately_trained_count}</strong> Balanced Cadre</div>
                  <div><strong>{equity.no_recent_training_count}</strong> Needs Opportunity</div>
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {equity.potential_issue}
              </p>
            </div>
          ) : (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Loading equity indicators...</p>
          )}
        </div>
      </div>
    </div>
  );
}
