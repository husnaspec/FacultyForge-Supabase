import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Cpu,
  BrainCircuit,
  Sparkles,
  Compass,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  FileText,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function AIIntelligenceHub() {
  const { activeFacultyId } = useAuth();
  const [plannerData, setPlannerData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Orchestrator State
  const [orchestrating, setOrchestrating] = useState(false);
  const [orchestratorResult, setOrchestratorResult] = useState(null);

  useEffect(() => {
    loadHubData();
  }, []);

  const loadHubData = async () => {
    setLoading(true);
    try {
      const [plan, logList] = await Promise.all([
        api.getPredictiveTrainingPlan(),
        api.getAgentLogs(),
      ]);
      setPlannerData(plan);
      setLogs(logList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunOrchestrator = async () => {
    setOrchestrating(true);
    try {
      const targetId = activeFacultyId || 1;
      const res = await api.orchestrateFaculty(targetId);
      setOrchestratorResult(res);
      loadHubData();
    } catch (err) {
      alert(err.message || 'Orchestration failed');
    } finally {
      setOrchestrating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
              <Cpu size={26} style={{ color: 'var(--brand-primary)' }} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Intelligence & Multi-Agent Hub</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              10 specialized intelligent agents operating across faculty assessment, curriculum synthesis, and institutional strategy.
            </p>
          </div>

          <button
            onClick={handleRunOrchestrator}
            disabled={orchestrating}
            className="btn btn-primary btn-sm"
          >
            <Sparkles size={14} />
            <span>{orchestrating ? 'Orchestrating Agents...' : 'Run Full Faculty Orchestrator Pipeline'}</span>
          </button>
        </div>
      </div>

      {orchestratorResult && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>
            Orchestrator pipeline completed: Generated {orchestratorResult.skill_gaps?.length || 0} skill gaps and {orchestratorResult.recommendations?.length || 0} personalized training proposals.
          </span>
        </div>
      )}

      {/* 9 Core Agents Architecture Grid */}
      <div className="grid-3">
        {[
          { name: 'Skill Gap Agent', role: 'Competency Audit', status: 'ACTIVE', link: '/app/faculty/1', desc: 'Identifies missing knowledge domains using teaching history and NBA benchmarks.' },
          { name: 'Recommendation Agent', role: 'Career Pathways', status: 'ACTIVE', link: '/app/faculty/1', desc: 'Aligns skill gaps with high-priority upcoming institutional workshops.' },
          { name: 'Peer Mentor Matcher', role: 'Internal Mentorship', status: 'ACTIVE', link: '/app/peer-mentors', desc: 'Matches faculty skill gaps with high-proficiency internal faculty mentors.' },
          { name: 'Resource Matcher Agent', role: 'Trainer Discovery', status: 'ACTIVE', link: '/app/resource-persons', desc: 'Multi-criteria ranking of guest trainers by feedback rating and syllabus fit.' },
          { name: 'FDP Generator Agent', role: 'Curriculum Synthesis', status: 'ACTIVE', link: '/app/ai-generator', desc: 'Generates day-wise schedules, objectives, and test questions from text prompts.' },
          { name: 'Learning Impact Agent', role: 'Cognitive Measurement', status: 'ACTIVE', link: '/app/assessments', desc: 'Computes pre-to-post normalized learning gains in absolute percentage points.' },
          { name: 'Feedback Intelligence', role: 'Sentiment Mining', status: 'ACTIVE', link: '/app/feedback-intelligence', desc: 'Synthesizes qualitative ratings into actionable institutional improvements.' },
          { name: 'Compliance Agent', role: 'Accreditation Audit', status: 'ACTIVE', link: '/app/compliance', desc: 'Tracks annual 40-hour CPD requirements across all teaching faculty.' },
          { name: 'Career Growth Agent', role: 'Professional Roadmap', status: 'ACTIVE', link: '/app/career-path', desc: 'Synthesizes milestone roadmaps tailored to faculty career goals (e.g. Research Mentor).' },
          { name: 'What-if Training Simulator', role: 'Policy Simulation', status: 'ACTIVE', link: '/app/what-if-simulator', desc: 'Simulates institutional coverage, ROI, and skill-gap closure prior to approval.' },
          { name: 'Training Equity Agent', role: 'Equity & Fatigue Audit', status: 'ACTIVE', link: '/app/training-equity', desc: 'Monitors distribution balance and participation equity using neutral institutional analytics.' },
          { name: 'Knowledge Sharing Agent', role: 'Internal Dissemination', status: 'ACTIVE', link: '/app/knowledge-sharing', desc: 'Recommends high-gain FDP participants to lead departmental peer workshops.' },
          { name: 'Predictive Training Planner', role: 'Strategic Forecasting', status: 'ACTIVE', link: '/app/strategy', desc: 'Aggregates department-wide demand scores to forecast future FDP needs.' },
          { name: 'Report Dossier Agent', role: 'Accreditation Export', status: 'ACTIVE', link: '/app/reports', desc: 'Assembles 17-section formal institutional dossier for NBA/NAAC committees.' },
        ].map((agent, i) => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-approved" style={{ fontSize: '0.625rem' }}>{agent.status}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{agent.role}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{agent.name}</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.35rem' }}>{agent.desc}</p>
            </div>
            {agent.link && (
              <Link to={agent.link} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem', alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                <span>Launch Agent</span>
                <ArrowRight size={12} />
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Predictive Training Planner Forecast (Section 16 & 17) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Predictive Training Planner Forecast</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Next semester training demand forecast synthesized from university-wide skill gaps
            </p>
          </div>
          <span className="badge badge-low">Academic Year 2026-2027</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {plannerData?.demands?.map((d) => (
            <div
              key={d.rank}
              style={{
                padding: '1.25rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: 'var(--brand-primary)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {d.rank}
                  </span>
                  <h4 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{d.topic}</h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <StatusBadge status={d.priority} />
                  <span style={{ fontWeight: 800, color: 'var(--brand-accent)' }}>
                    Demand Score: {d.demand_score}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                {d.reason}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div>
                  <span>Target Departments: <strong>{d.target_departments.join(', ')}</strong></span> &bull;{' '}
                  <span>Suggested Duration: <strong>{d.suggested_duration}</strong></span> &bull;{' '}
                  <span>Suggested Capacity: <strong>{d.suggested_capacity} seats</strong></span>
                </div>

                <Link
                  to={`/app/ai-generator?prompt=${encodeURIComponent(`Create a ${d.suggested_duration} on ${d.topic}`)}`}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  <Sparkles size={12} />
                  <span>Create FDP Draft From Recommendation</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Execution Audit Logs */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem' }}>Agent Analysis Audit Log</h3>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Context / Target</th>
                <th>Input Summary</th>
                <th>Confidence</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 700 }}>{log.agent_name}</td>
                  <td>
                    {log.faculty_id ? `Faculty #${log.faculty_id}` : (log.event_id ? `Event #${log.event_id}` : 'University-wide')}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                    {log.input_summary}
                  </td>
                  <td>
                    <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.75rem' }}>
                      {Math.round((log.confidence_score || 0.9) * 100)}%
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
