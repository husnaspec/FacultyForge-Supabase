import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Sparkles,
  Building2,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FilePlus2,
  Info,
} from 'lucide-react';

export default function WhatIfSimulatorPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(true);

  // Form State
  const [topic, setTopic] = useState('Generative AI for Engineering Faculty');
  const [selectedDeptIds, setSelectedDeptIds] = useState([1, 2]); // CSE, IT
  const [durationHours, setDurationHours] = useState(18);
  const [capacity, setCapacity] = useState(60);
  const [estimatedBudget, setEstimatedBudget] = useState(50000);

  // Simulation State
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [creatingDraft, setCreatingDraft] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const depts = await api.getDepartments();
      setDepartments(depts || []);
      if (depts.length >= 2) {
        setSelectedDeptIds([depts[0].id, depts[1].id]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDepts(false);
    }
  };

  const handleToggleDept = (deptId) => {
    if (selectedDeptIds.includes(deptId)) {
      if (selectedDeptIds.length > 1) {
        setSelectedDeptIds(selectedDeptIds.filter((id) => id !== deptId));
      }
    } else {
      setSelectedDeptIds([...selectedDeptIds, deptId]);
    }
  };

  const handleSimulate = async (e) => {
    if (e) e.preventDefault();
    if (!topic) {
      alert('Please provide a training topic');
      return;
    }
    setSimulating(true);
    try {
      const res = await api.simulateTraining({
        topic,
        department_ids: selectedDeptIds,
        duration_hours: parseFloat(durationHours),
        capacity: parseInt(capacity),
        estimated_budget: parseFloat(estimatedBudget),
      });
      setSimulationResult(res);
    } catch (err) {
      alert(err.message || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handleCreateDraft = async () => {
    if (!simulationResult || !simulationResult.draft_creation_payload) return;
    setCreatingDraft(true);
    try {
      const created = await api.createEvent(simulationResult.draft_creation_payload);
      alert(`FDP Draft '${created.title}' successfully created (Code: ${created.event_code}). Navigating to event management.`);
      navigate(`/app/events/${created.id}`);
    } catch (err) {
      alert(err.message || 'Failed to create draft event');
    } finally {
      setCreatingDraft(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span className="badge badge-high" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#9333ea' }}>
              PREDICTIVE IQAC SIMULATOR
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Deterministic Forecast Model
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>What-If Training Simulator</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '800px' }}>
            Simulate the institutional impact, competency coverage, cost efficiency, and accreditation compliance
            gains of a proposed programme BEFORE committing financial and logistic resources.
          </p>
        </div>
      </div>

      {/* Simulator Form & Projected Results Grid */}
      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Left: Input Form */}
        <form onSubmit={handleSimulate} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            Simulation Parameters
          </h2>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.375rem' }}>
              PROPOSED TOPIC / DOMAIN *
            </label>
            <input
              type="text"
              className="input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Generative AI, Zero Trust Cybersecurity, NBA Course Files..."
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.375rem' }}>
              TARGET DEPARTMENTS (MULTI-SELECT)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {departments.map((d) => {
                const isSelected = selectedDeptIds.includes(d.id);
                return (
                  <button
                    type="button"
                    key={d.id}
                    onClick={() => handleToggleDept(d.id)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #2563eb' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'rgba(37, 99, 235, 0.1)' : '#ffffff',
                      color: isSelected ? '#2563eb' : 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {d.code} ({d.name.split(' ')[0]})
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.375rem' }}>
                DURATION (HOURS)
              </label>
              <input
                type="number"
                className="input"
                min="4"
                max="40"
                value={durationHours}
                onChange={(e) => setDurationHours(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                ~{(durationHours / 6).toFixed(1)} Days delivery
              </span>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.375rem' }}>
                COHORT CAPACITY
              </label>
              <input
                type="number"
                className="input"
                min="10"
                max="200"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                Participants maximum
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.375rem' }}>
              ESTIMATED BUDGET (₹ INR)
            </label>
            <input
              type="number"
              className="input"
              min="5000"
              max="500000"
              step="5000"
              value={estimatedBudget}
              onChange={(e) => setEstimatedBudget(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={simulating}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}
          >
            <Sparkles size={16} />
            <span>{simulating ? 'Simulating Impact...' : 'SIMULATE TRAINING IMPACT'}</span>
          </button>
        </form>

        {/* Right: Projected Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!simulationResult ? (
            <div
              className="card"
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                border: '2px dashed var(--border-subtle)',
                background: 'transparent',
              }}
            >
              <Sparkles size={36} style={{ color: 'var(--brand-accent)', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Run What-If Simulation
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto' }}>
                Configure duration, budget, and target departments to project competency deficit resolution
                and cost efficiency.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Disclaimer Banner */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.625rem 0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#b45309',
                }}
              >
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>{simulationResult.disclaimer}</span>
              </div>

              {/* Top Result Card */}
              <div
                className="card"
                style={{
                  background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                  color: '#ffffff',
                  padding: '1.5rem',
                }}
              >
                <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#c084fc', letterSpacing: '0.08em' }}>
                  PROJECTED PROGRAMME OUTCOMES
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
                  {simulationResult.programme_title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginTop: '0.5rem', lineHeight: 1.5 }}>
                  {simulationResult.explanation}
                </p>
              </div>

              {/* Projected Metrics Grid */}
              <div className="grid-2">
                <div className="card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    PROJECTED SKILL GAPS ADDRESSED
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#059669', marginTop: '0.25rem' }}>
                    {simulationResult.projected_skill_gaps_addressed}%
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    ~{simulationResult.projected_skill_gaps_addressed_count} of {simulationResult.relevant_skill_gaps} identified deficits
                  </span>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    ESTIMATED COST / PARTICIPANT
                  </span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#2563eb', marginTop: '0.25rem' }}>
                    ₹{simulationResult.estimated_cost_per_participant?.toFixed(0)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    For {simulationResult.potential_participants} expected attendees
                  </span>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    PROJECTED / ESTIMATED IMPACT LEVEL
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#9333ea', marginTop: '0.25rem' }}>
                    {simulationResult.expected_learning_impact}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Estimated Priority Score: {simulationResult.priority_score}/100
                  </span>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    PROJECTED CPD COMPLIANCE BOOST
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7', marginTop: '0.25rem' }}>
                    +{simulationResult.expected_compliance_improvement}%
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    +{simulationResult.projected_compliance_hours_added} training person-hours
                  </span>
                </div>
              </div>

              {/* Action Button: Create FDP Draft */}
              <div className="card" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Ready to formalize this programme?</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Converts this simulation into an official institutional DRAFT without publishing.
                  </p>
                </div>

                <button
                  onClick={handleCreateDraft}
                  disabled={creatingDraft}
                  className="btn btn-primary btn-sm"
                >
                  <FilePlus2 size={15} />
                  <span>{creatingDraft ? 'Creating Draft...' : 'CREATE FDP DRAFT FROM SIMULATION'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
