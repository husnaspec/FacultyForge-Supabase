'use client';
import React, { useState, useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { api, asArray } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, Search, PlusCircle, Sparkles, Eye, AlertCircle } from 'lucide-react';

export default function FDPList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadEvents();
  }, [statusFilter, search]);

  const loadEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getEvents({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setEvents(asArray(data, 'events'));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load programmes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Faculty Development Programmes</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Catalog of institutional FDPs, technical workshops, and short-term training programmes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/app/ai-generator" className="btn btn-primary btn-sm">
            <Sparkles size={15} />
            <span>AI FDP Generator</span>
          </Link>
          <Link to="/app/events/create" className="btn btn-secondary btn-sm">
            <PlusCircle size={15} />
            <span>Create Manually</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.25rem' }}
            placeholder="Search programmes by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ minWidth: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REGISTRATION_OPEN">Registration Open</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Events Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event Code</th>
                <th>Programme Title</th>
                <th>Type</th>
                <th>Department</th>
                <th>Mode</th>
                <th>Duration</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading programmes from backend...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {error ? 'Could not load programmes.' : 'No programmes found matching query.'}
                  </td>
                </tr>
              ) : (
                events.map((e) => (
                  <tr key={e.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {e.event_code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{e.title || e.programme_title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Coordinator: {e.coordinator_name || 'Academic Committee'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                        {e.event_type}
                      </span>
                    </td>
                    <td>{e.department_name || 'CSE'}</td>
                    <td>{e.delivery_mode}</td>
                    <td>{e.duration_hours} hrs</td>
                    <td>
                      {e.registered_count || 0} / {e.capacity}
                    </td>
                    <td>
                      <StatusBadge status={e.status} />
                    </td>
                    <td>
                      <Link
                        to={`/app/events/${e.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} />
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
