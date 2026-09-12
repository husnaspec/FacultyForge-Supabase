import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  Scale,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Filter,
} from 'lucide-react';

export default function TrainingEquityPage() {
  const [equityData, setEquityData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadEquity();
  }, [departmentFilter]);

  const loadDepartments = async () => {
    try {
      const depts = await api.getDepartments();
      setDepartments(depts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEquity = async () => {
    setLoading(true);
    try {
      const data = await api.getTrainingEquity({
        department_id: departmentFilter ? parseInt(departmentFilter) : undefined,
      });
      setEquityData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'HIGH_PARTICIPATION':
        return (
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            High Participation
          </span>
        );
      case 'BALANCED':
        return (
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(16, 185, 129, 0.12)', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            Balanced
          </span>
        );
      case 'NEEDS_OPPORTUNITY':
      default:
        return (
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
            Needs Opportunity
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span className="badge badge-high" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#d97706' }}>
              TRAINING EQUITY AUDIT
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Faculty Opportunity Distribution Agent
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Training Fatigue & Participation Equity</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '800px' }}>
            Institutional governance detector identifying participation concentration, preventing training fatigue
            among over-utilized faculty cadres, and surfacing cohorts currently needing professional development opportunities.
          </p>
        </div>
      </div>

      {/* Filter Card */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxWidth: '300px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            FILTER DEPARTMENT
          </label>
          <select
            className="input"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            <option value="">All University Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Distribution Metric Cards */}
      {equityData && (
        <div className="grid-4">
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              EQUITY DISTRIBUTION SCORE
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2563eb', marginTop: '0.25rem' }}>
              {equityData.participation_equity_score}
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Balanced Opportunity Metric
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              HIGHLY TRAINED CADRE
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0284c7', marginTop: '0.25rem' }}>
              {equityData.highly_trained_count}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              3+ Programmes / High Hours
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              BALANCED CADRE
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', marginTop: '0.25rem' }}>
              {equityData.moderately_trained_count}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              1–2 Programmes This Calendar
            </span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              NEEDS OPPORTUNITY
            </span>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#d97706', marginTop: '0.25rem' }}>
              {equityData.no_recent_training_count}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              0 Recent Certified Programmes
            </span>
          </div>
        </div>
      )}

      {/* Institutional Assessment & Policy Recommendations */}
      {equityData && (
        <div className="grid-2">
          {/* Institutional Observation */}
          <div
            className="card"
            style={{
              background: 'rgba(248, 250, 252, 0.8)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Scale size={18} style={{ color: '#2563eb' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Institutional Equity Diagnosis</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {equityData.potential_issue}
            </p>
          </div>

          {/* Neutral Policy Recommendations */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Governance Guidance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {equityData.recommendations?.map((rec, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem' }}>
                  <CheckCircle2 size={15} style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Faculty Distribution Ledger */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Faculty Opportunity Ledger</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Transparent monitoring of continuous professional development allocation
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'rgba(241, 245, 249, 0.6)' }}>
                <th>Faculty Code</th>
                <th>Name</th>
                <th>Department</th>
                <th>Programmes Completed</th>
                <th>Training Hours</th>
                <th>Last Attended</th>
                <th>Participation Status</th>
              </tr>
            </thead>
            <tbody>
              {equityData?.faculty_list?.map((f) => (
                <tr key={f.faculty_id}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{f.faculty_code}</td>
                  <td style={{ fontWeight: 700 }}>{f.faculty_name}</td>
                  <td>{f.department}</td>
                  <td>{f.programmes_attended}</td>
                  <td>{f.training_hours} hrs</td>
                  <td style={{ color: 'var(--text-muted)' }}>{f.last_attended_date || 'None on record'}</td>
                  <td>{getStatusBadge(f.participation_status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
