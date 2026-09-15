'use client';
import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import {
  Grid,
  Building2,
  Layers,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function DepartmentSkillHeatmapPage() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    loadHeatmap();
  }, [departmentFilter, categoryFilter]);

  const loadHeatmap = async () => {
    setLoading(true);
    try {
      const data = await api.getSkillHeatmap({
        department_id: departmentFilter ? parseInt(departmentFilter) : undefined,
        skill_category: categoryFilter || undefined,
      });
      setHeatmapData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelStyle = (level) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          color: '#059669',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        };
      case 'MED':
        return {
          bg: 'rgba(245, 158, 11, 0.12)',
          color: '#d97706',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        };
      case 'LOW':
      default:
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          color: '#dc2626',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span className="badge badge-high" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb' }}>
              INSTITUTIONAL STRATEGY
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Cross-Departmental Competency Matrix
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Department Skill Heatmap</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '800px' }}>
            Executive visual representation of faculty competency density, strengths, and urgent upskilling gaps
            across engineering departments to drive targeted multi-departmental training allocations.
          </p>
        </div>
      </div>

      {/* Filters & Legend */}
      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              FILTER DEPARTMENT
            </label>
            <select
              className="input"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem' }}
            >
              <option value="">All Departments</option>
              {heatmapData?.departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
              SKILL CATEGORY
            </label>
            <input
              type="text"
              className="input"
              placeholder="Search skill..."
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.8125rem', minWidth: '180px' }}
            />
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LEGEND:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10b981' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>HIGH (≥75%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f59e0b' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>MEDIUM (50–74%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ef4444' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>LOW (&lt;50%)</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Generating departmental competency matrix...</p>
      ) : !heatmapData ? null : (
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(241, 245, 249, 0.8)' }}>
                  <th style={{ textAlign: 'left', padding: '1rem 1.25rem', minWidth: '220px' }}>
                    Competency Domain / Technology
                  </th>
                  {heatmapData.departments?.map((dept) => (
                    <th key={dept.code} style={{ padding: '1rem', minWidth: '130px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.875rem' }}>{dept.code}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        {dept.name.split(' ')[0]}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.skills?.map((skill) => (
                  <tr key={skill} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ textAlign: 'left', padding: '1rem 1.25rem', fontWeight: 700, fontSize: '0.875rem' }}>
                      {skill}
                    </td>

                    {heatmapData.departments?.map((dept) => {
                      const cell = heatmapData.matrix?.[skill]?.[dept.code] || {
                        level: 'LOW',
                        score: 35.0,
                        faculty_with_skill: 0,
                      };
                      const style = getLevelStyle(cell.level);
                      return (
                        <td key={dept.code} style={{ padding: '0.75rem' }}>
                          <div
                            style={{
                              background: style.bg,
                              color: style.color,
                              border: style.border,
                              borderRadius: 'var(--radius-md)',
                              padding: '0.5rem 0.75rem',
                              display: 'inline-flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              minWidth: '90px',
                            }}
                          >
                            <span style={{ fontSize: '0.8125rem', fontWeight: 800 }}>{cell.level}</span>
                            <span style={{ fontSize: '0.6875rem', opacity: 0.85 }}>{cell.score}% index</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Insights */}
      {heatmapData?.summary && (
        <div className="grid-3">
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Building2 size={28} style={{ color: '#2563eb' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DEPARTMENTS ANALYZED</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{heatmapData.summary.total_departments_analyzed}</div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <CheckCircle2 size={28} style={{ color: '#059669' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>HIGH-COMPETENCY AREAS</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>
                {heatmapData.summary.high_competency_cells}
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertTriangle size={28} style={{ color: '#ef4444' }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>PRIORITY GAP CONCENTRATIONS</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ef4444' }}>
                {heatmapData.summary.development_priority_cells}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
