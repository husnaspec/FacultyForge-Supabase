import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { ShieldCheck, PlusCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function CompliancePage() {
  const [dashboard, setDashboard] = useState(null);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Rule Modal
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    rule_name: '',
    description: '',
    minimum_training_hours: 40.0,
    period_type: 'ANNUAL',
    required_topics: 'Teaching Methodology, Research, Emerging Technologies',
  });
  const [savingRule, setSavingRule] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadCompliance();
  }, []);

  const loadCompliance = async () => {
    setLoading(true);
    try {
      const [dash, rList] = await Promise.all([
        api.getComplianceDashboard(),
        api.getComplianceRules(),
      ]);
      setDashboard(dash);
      setRules(rList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    setSavingRule(true);
    setErrorMsg('');

    try {
      await api.createComplianceRule({
        ...ruleForm,
        minimum_training_hours: parseFloat(ruleForm.minimum_training_hours),
      });
      setShowRuleModal(false);
      loadCompliance();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create rule');
    } finally {
      setSavingRule(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
              <ShieldCheck size={24} style={{ color: 'var(--brand-primary)' }} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Institutional Compliance Management</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Customizable institutional benchmarks, hours tracking, and early risk intervention.
            </p>
          </div>

          <button onClick={() => setShowRuleModal(true)} className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>Configure New Rule</span>
          </button>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      {dashboard && (
        <div className="grid-3">
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>INSTITUTIONAL COMPLIANCE RATE</span>
            <p style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>
              {dashboard.compliance_rate}%
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Faculty achieving minimum continuous development hours
            </p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>STATUS BREAKDOWN</span>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399' }}>
                  {dashboard.status_breakdown?.COMPLIANT || 0}
                </span>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>COMPLIANT</p>
              </div>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24' }}>
                  {dashboard.status_breakdown?.ATTENTION_REQUIRED || 0}
                </span>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>ATTENTION</p>
              </div>
              <div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>
                  {dashboard.status_breakdown?.NON_COMPLIANT || 0}
                </span>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>AT RISK</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACTIVE RULES AUDITED</span>
            <p style={{ fontSize: '2rem', fontWeight: 800 }}>{rules.length}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Configured dynamically by institution
            </p>
          </div>
        </div>
      )}

      {/* Rules Banner */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Active Configured Rules</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {rules.map((r) => (
            <div
              key={r.id}
              style={{
                padding: '0.875rem 1rem',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div>
                <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{r.rule_name}</span>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {r.description}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Mandatory Focus Areas: {r.required_topics}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--brand-primary)' }}>
                  {r.minimum_training_hours} Hours
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                  Per {r.period_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Faculty Compliance Roster */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem' }}>Faculty Compliance Audit Roster</h3>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Code</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Completed / Target</th>
                <th>Remaining</th>
                <th>Compliance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.faculty_records?.map((rec, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {rec.faculty_code}
                  </td>
                  <td style={{ fontWeight: 600 }}>{rec.faculty_name}</td>
                  <td>{rec.department_name}</td>
                  <td>
                    <strong>{rec.completed_hours}</strong> / {rec.required_hours} hrs
                  </td>
                  <td style={{ color: rec.remaining_hours > 0 ? '#fbbf24' : '#34d399' }}>
                    {rec.remaining_hours > 0 ? `${rec.remaining_hours} hrs` : 'Target Met'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{rec.compliance_percentage}%</span>
                      <div className="progress-bar-bg" style={{ width: '60px' }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${rec.compliance_percentage}%`,
                            background: rec.status === 'COMPLIANT' ? 'var(--color-success)' : 'var(--color-warning)',
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={rec.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configure Rule Modal */}
      <Modal isOpen={showRuleModal} onClose={() => setShowRuleModal(false)} title="Configure Institutional Compliance Benchmark">
        <form onSubmit={handleCreateRule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <div className="form-group">
            <label className="form-label">Rule Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Annual Faculty Continuous Upskilling Target"
              value={ruleForm.rule_name}
              onChange={(e) => setRuleForm({ ...ruleForm, rule_name: e.target.value })}
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Minimum Required Hours</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={ruleForm.minimum_training_hours}
                onChange={(e) => setRuleForm({ ...ruleForm, minimum_training_hours: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Period Type</label>
              <select
                className="form-select"
                value={ruleForm.period_type}
                onChange={(e) => setRuleForm({ ...ruleForm, period_type: e.target.value })}
              >
                <option value="ANNUAL">Annual</option>
                <option value="SEMESTER">Semester</option>
                <option value="BIENNIAL">Biennial (2 Years)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mandatory Core Subject Areas (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Teaching Methodology, Research, Emerging Technologies"
              value={ruleForm.required_topics}
              onChange={(e) => setRuleForm({ ...ruleForm, required_topics: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rule Description & Rationale</label>
            <textarea
              className="form-textarea"
              placeholder="Explain policy guidelines and tenure requirements..."
              value={ruleForm.description}
              onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowRuleModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={savingRule} className="btn btn-primary btn-sm">
              {savingRule ? 'Saving...' : 'Save Benchmark'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
