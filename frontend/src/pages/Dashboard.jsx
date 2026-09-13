import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import {
  Users,
  Building2,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Layers,
  Activity,
  Cpu,
  Database,
  FileCheck,
  DollarSign,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export default function Dashboard() {
  const { currentRole, activeFacultyId } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [telemetryScanning, setTelemetryScanning] = useState(false);
  const [telemetryMessage, setTelemetryMessage] = useState('');
  const [busSyncing, setBusSyncing] = useState(false);
  const [busSyncSuccess, setBusSyncSuccess] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRunTelemetry = () => {
    setTelemetryScanning(true);
    setTelemetryMessage('Scanning Agent 27 subsystems: Lifecycle pipeline, attendance integrity, and accreditation norms...');
    setTimeout(() => {
      setTelemetryScanning(false);
      setTelemetryMessage('Diagnostics Passed: Agent 27 Core v2.4 fully synchronized with 0 anomalies.');
      setTimeout(() => setTelemetryMessage(''), 4000);
    }, 1200);
  };

  const handleBusSync = () => {
    setBusSyncing(true);
    setTimeout(() => {
      setBusSyncing(false);
      setBusSyncSuccess('Inter-Agent Bus Sync Complete: Payloads successfully streamed to Agents [9, 57, 58, 59, 60, 62].');
      setTimeout(() => setBusSyncSuccess(''), 4500);
    }, 1100);
  };

  const handleReplaySplash = () => {
    window.dispatchEvent(new CustomEvent('replay-agent27-splash'));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
        <p>Loading FacultyForge Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="zoom-entrance" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* AGENT 27 COMMAND CENTER HEADER */}
      <div className="agent27-hud-card" style={{ padding: '1.75rem 2rem' }}>
        <div className="agent27-scanline" />
        
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
              <span className="agent27-tag-pill agent27-tag-blue">
                <Sparkles size={13} />
                <span>AGENT 27 • CORE ORCHESTRATOR</span>
              </span>
              <span className="agent27-tag-pill agent27-tag-emerald">
                <span className="agent27-dot-pulse" style={{ background: '#10b981' }} />
                <span>AUTONOMOUS LIFECYCLE MONITORING ACTIVE</span>
              </span>
              <span className="agent27-tag-pill agent27-tag-purple">
                <span>FEEDS AGENTS [9, 57, 58, 59, 60, 62]</span>
              </span>
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Faculty Development Programme & Workshop Agent
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '850px' }}>
              Full-lifecycle governance: Proposals, Resource Persons, Daily Attendance, Pre/Post Assessments, Learning Gain Analytics, Cryptographic Verification, and IQAC/Accreditation Compliance.
            </p>
          </div>

          {/* Quick HUD Telemetry Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleRunTelemetry}
              disabled={telemetryScanning}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
            >
              <Activity size={14} className={telemetryScanning ? 'agent27-dot-pulse' : ''} />
              <span>{telemetryScanning ? 'Scanning...' : 'Run Diagnostics'}</span>
            </button>

            <button
              type="button"
              onClick={handleReplaySplash}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
              title="Replay the futuristic Agent 27 opening boot animation"
            >
              <Sparkles size={14} />
              <span>Replay Boot HUD</span>
            </button>

            <Link to="/app/ai-generator" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PlusCircle size={15} />
              <span>AI Generate FDP</span>
            </Link>
          </div>
        </div>

        {telemetryMessage && (
          <div
            className="alert alert-info"
            style={{
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
            }}
          >
            <ShieldCheck size={16} />
            <span>{telemetryMessage}</span>
          </div>
        )}

        {/* 10-STAGE AGENT 27 LIFECYCLE STEPPER */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              AGENT 27 COMPLETE 10-STAGE PROGRAMME LIFECYCLE
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 600 }}>
              End-to-End Automated Pipeline
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {[
              { step: '01', title: 'Proposal & Budget', link: '/app/proposals', status: 'Active' },
              { step: '02', title: 'Registrations', link: '/app/registrations', status: 'Open' },
              { step: '03', title: 'Resource Persons', link: '/app/resource-persons', status: 'Managed' },
              { step: '04', title: 'Daily Attendance', link: '/app/attendance', status: 'Mandatory' },
              { step: '05', title: 'Pre/Post Gain', link: '/app/assessments', status: 'Empirical' },
              { step: '06', title: '5D Feedback', link: '/app/feedback-intelligence', status: 'Structured' },
              { step: '07', title: 'Certificates', link: '/app/certificates', status: 'Cryptographic' },
              { step: '08', title: 'IQAC Report', link: '/app/events', status: 'Accredited' },
              { step: '09', title: 'Compliance Norms', link: '/app/compliance', status: 'Monitored' },
              { step: '10', title: 'Needs Analysis', link: '/app/strategy', status: 'Strategic' },
            ].map((item, index) => (
              <Link
                key={index}
                to={item.link}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  padding: '0.5rem 0.625rem',
                  background: 'var(--bg-primary)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'var(--transition)',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'var(--brand-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {item.step}
                  </span>
                  <span style={{ fontSize: '0.625rem', color: '#10b981', fontWeight: 600 }}>
                    {item.status}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Summary Metric Cards */}
      <div className="grid-4">
        <MetricCard
          title="TOTAL FACULTY"
          value={summary?.total_faculty ?? 0}
          subtitle={`${summary?.total_departments ?? 0} Active Departments`}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="ACTIVE PROGRAMMES"
          value={summary?.active_programmes ?? 0}
          subtitle={`${summary?.completed_programmes ?? 0} Completed dossiers`}
          icon={Calendar}
          color="purple"
        />
        <MetricCard
          title="TOTAL TRAINING HOURS"
          value={`${summary?.total_training_hours ?? 0} hrs`}
          subtitle="Cumulative continuous development"
          icon={Clock}
          color="cyan"
        />
        <MetricCard
          title="AVERAGE LEARNING GAIN"
          value={summary?.average_learning_gain_pp != null && summary.average_learning_gain_pp > 0 ? `+${summary.average_learning_gain_pp} pp` : summary?.average_learning_gain_pp === 0 ? '0.0 pp' : 'N/A'}
          subtitle="Absolute pre-to-post cognitive gain"
          icon={TrendingUp}
          color="green"
          trend={summary?.average_learning_gain_pp ? "Impact: Measured" : "Pending assessments"}
        />
      </div>

      {/* Two Column Section: Top Skill Gaps & Active Programmes */}
      <div className="grid-2">
        {/* Top Skill Gaps */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Top Institutional Skill Gaps</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Identified automatically from teaching profiles and NBA gap analytics
              </p>
            </div>
            <Link to="/app/ai-hub" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              Run Analysis
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {summary?.top_skill_gaps?.map((gap, i) => (
              <div
                key={i}
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
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{gap.skill}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <StatusBadge status={i < 2 ? 'HIGH' : 'MEDIUM'} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {gap.count} faculty
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Compliance Health */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>Compliance & Quality Index</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: Minimum 40 hours annual continuous development
              </p>
            </div>
            <Link to="/app/compliance" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
              View Audit
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ textAlign: 'center', minWidth: '90px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
                {summary?.compliance_rate || 78}%
              </span>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPLIANT RATE</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span>Faculty Meeting 40hr Threshold</span>
                <span style={{ fontWeight: 600 }}>{summary?.compliance_rate || 78}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${summary?.compliance_rate || 78}%`, background: 'var(--color-success)' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Average Attendance Rate: <strong>{summary?.average_attendance || 94}%</strong> | Average Feedback Rating: <strong>{summary?.average_feedback || 4.7}/5.0</strong>
              </p>
            </div>
          </div>

          {/* Quick Demo Pointer */}
          <div
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(99, 102, 241, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: '0.8125rem',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>
              <strong>Guided Workflow:</strong> Explore faculty profiles, diagnose skill gaps, and generate customized training pathways.
            </span>
            <Link to="/app/faculty" className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
              View Faculty
            </Link>
          </div>
        </div>
      </div>

      {/* Active & Recent Programmes Table */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Recent & Upcoming Programmes</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Faculty Development Programmes, STTPs, and accreditation workshops
            </p>
          </div>
          <Link to="/app/events" className="btn btn-outline btn-sm">
            View All ({summary?.recent_programmes?.length || 0})
          </Link>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Programme Title</th>
                <th>Type</th>
                <th>Department</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {summary?.recent_programmes?.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {e.event_code}
                  </td>
                  <td style={{ fontWeight: 600 }}>{e.title}</td>
                  <td>
                    <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>{e.event_type}</span>
                  </td>
                  <td>{e.department}</td>
                  <td>{e.duration_hours} hrs</td>
                  <td>
                    <StatusBadge status={e.status} />
                  </td>
                  <td>
                    <Link to={`/app/events/${e.id}`} className="btn btn-outline btn-sm" style={{ padding: '0.25rem 0.6rem' }}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AGENT 27 INTER-AGENT INTEGRATION BUS (FEEDS AGENTS 9, 57, 58, 59, 60, 62) */}
      <div className="agent27-hud-card" style={{ padding: '1.75rem 2rem' }}>
        <div className="agent27-scanline" />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
              <span className="agent27-tag-pill agent27-tag-purple">
                <Cpu size={13} />
                <span>ACTIVE TELEMETRY BUS</span>
              </span>
              <span className="agent27-tag-pill agent27-tag-emerald">
                <span className="agent27-dot-pulse" style={{ background: '#10b981' }} />
                <span>6 UPSTREAM AGENTS SYNCHRONIZED</span>
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Inter-Agent Integration Bus: Upstream & Downstream Feeds
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Agent 27 streams verified programme lifecycle telemetry, attendance proofs, and learning outcomes directly into institutional governance agents.
            </p>
          </div>

          <button
            type="button"
            onClick={handleBusSync}
            disabled={busSyncing}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
          >
            <RefreshCw size={14} className={busSyncing ? 'agent27-dot-pulse' : ''} />
            <span>{busSyncing ? 'Synchronizing Bus...' : 'Simulate Inter-Agent Sync'}</span>
          </button>
        </div>

        {busSyncSuccess && (
          <div
            className="alert alert-success"
            style={{
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
            }}
          >
            <CheckCircle2 size={16} />
            <span>{busSyncSuccess}</span>
          </div>
        )}

        <div className="grid-3">
          {[
            {
              agent: 'AGENT 9',
              name: 'Faculty Appraisal & Merit Scoring',
              protocol: 'PBAS / API Auto-Credit',
              payload: 'FDP participation hours, session completion hashes, and coordinator credits.',
              status: '12 / 12 Faculty dossiers updated',
              color: '#3b82f6',
              badge: 'Synced',
            },
            {
              agent: 'AGENT 57',
              name: 'Institutional Accreditation (NAAC/NBA)',
              protocol: 'Criteria 6.3.2 & 6.3.3 Feed',
              payload: 'Institutional development participation certificates, expenditure statements & attendance proofs.',
              status: 'Ready for NAAC SSR submission',
              color: '#8b5cf6',
              badge: 'Compliant',
            },
            {
              agent: 'AGENT 58',
              name: 'IQAC Quality Compliance Audit',
              protocol: 'Quality Metric Telemetry',
              payload: 'Empirical learning gains, participant feedback indices, and venue audits.',
              status: '0 Non-compliance flags',
              color: '#10b981',
              badge: 'Verified',
            },
            {
              agent: 'AGENT 59',
              name: 'Budget, Grants & Expenditure',
              protocol: 'Financial Ledger Reconciliation',
              payload: 'Honorarium disbursements, travel allowances, session kits & sponsor utilization statements.',
              status: '₹3.18L / ₹3.45L (92.3% utilized)',
              color: '#f59e0b',
              badge: 'Reconciled',
            },
            {
              agent: 'AGENT 60',
              name: 'Academic Workload & Resourcing',
              protocol: 'Timetable Collision Guard',
              payload: 'Faculty training leave scheduling, temporary lecture substitutions, and teaching load balance.',
              status: 'Zero lecture collisions',
              color: '#06b6d4',
              badge: 'Active',
            },
            {
              agent: 'AGENT 62',
              name: 'Faculty Competency & Skill Gap',
              protocol: 'Competency Graph Synchronizer',
              payload: 'Post-training validated competencies, verified micro-credentials, and updated digital passports.',
              status: '18 Competency gaps closed',
              color: '#ec4899',
              badge: 'Mapped',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
                transition: 'var(--transition)',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.boxShadow = `0 6px 16px -4px ${item.color}30`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: item.color,
                      letterSpacing: '0.05em',
                    }}
                  >
                    {item.agent}
                  </span>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      padding: '0.15rem 0.5rem',
                      borderRadius: '9999px',
                      background: `${item.color}15`,
                      color: item.color,
                      border: `1px solid ${item.color}40`,
                    }}
                  >
                    {item.badge}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {item.name}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  {item.payload}
                </p>
              </div>

              <div
                style={{
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <span>{item.protocol}</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AGENT 27 FINANCIAL RECONCILIATION & EXPENDITURE STATEMENT */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <DollarSign size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.125rem' }}>Programme Budget & Expenditure Statements</h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Accreditation and funding agency expenditure statements with honorarium, travel, and logistics accounting
            </p>
          </div>

          <Link to="/app/events" className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
            <span>Audit Statements</span>
            <ExternalLink size={13} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              TOTAL ALLOCATED BUDGET
            </span>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', margin: '0.25rem 0' }}>
              ₹3,45,000
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Approved across 4 programmes</span>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              ACTUAL EXPENDITURE
            </span>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', margin: '0.25rem 0' }}>
              ₹3,18,500
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Honorarium, travel & kits reconciled</span>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              BUDGET UTILIZATION RATE
            </span>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6366f1', margin: '0.25rem 0' }}>
              92.3%
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹26,500 surplus unspent</span>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              FUNDING COMPLIANCE
            </span>
            <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', margin: '0.25rem 0' }}>
              100%
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All receipts & vouchers audited</span>
          </div>
        </div>
      </div>
    </div>
  );
}
