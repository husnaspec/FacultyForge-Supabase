'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-compat';
import { api, asArray } from '@/services/api';
import { FileSpreadsheet, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FDPCreate() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    event_code: `FFAI-EVT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: '',
    description: '',
    event_type: 'FDP',
    objectives: '',
    target_audience: 'Faculty Members & Researchers',
    eligibility: 'Teaching faculty in engineering/technology',
    start_date: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 16 * 86400000).toISOString().slice(0, 10),
    duration_hours: 16.0,
    capacity: 50,
    delivery_mode: 'HYBRID',
    venue: 'Main Campus Seminar Hall & Virtual Academic Portal',
    department_id: '',
    coordinator_faculty_id: '',
    expected_outcomes: '',
    learning_outcomes: '',
    estimated_budget: 35000.0,
  });

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    setError('');
    try {
      const [deptRes, facRes] = await Promise.allSettled([api.getDepartments(), api.getFacultyList()]);

      let depts = [];
      if (deptRes.status === 'fulfilled') {
        depts = asArray(deptRes.value, 'departments');
        setDepartments(depts);
        if (depts.length > 0) {
          setFormData((prev) => ({
            ...prev,
            department_id: prev.department_id || depts[0].id
          }));
        }
      } else {
        console.error('Failed to load departments:', deptRes.reason);
        setError(`Failed to load departments: ${deptRes.reason?.message || 'Network error'}`);
      }

      if (facRes.status === 'fulfilled') {
        const facs = asArray(facRes.value, 'faculty', 'faculty_members');
        setFacultyList(facs);
        if (facs.length > 0) {
          setFormData((prev) => ({
            ...prev,
            coordinator_faculty_id: prev.coordinator_faculty_id || facs[0].id
          }));
        }
      } else {
        console.error('Failed to load faculty list:', facRes.reason);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load prerequisites');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        department_id: parseInt(formData.department_id),
        coordinator_faculty_id: formData.coordinator_faculty_id ? parseInt(formData.coordinator_faculty_id) : null,
        duration_hours: parseFloat(formData.duration_hours),
        capacity: parseInt(formData.capacity),
        estimated_budget: parseFloat(formData.estimated_budget),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };
      const created = await api.createEvent(payload);
      navigate(`/app/events/${created.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '950px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Faculty Development Programme</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Programmes will be created initially as <strong>DRAFT</strong> for coordinator review before submitting for approval.
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Event Code</label>
              <input
                type="text"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)' }}
                value={formData.event_code}
                onChange={(e) => setFormData({ ...formData, event_code: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Event Type</label>
              <select
                className="form-select"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              >
                <option value="FDP">FDP</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="SEMINAR">Seminar</option>
                <option value="TRAINING">Training</option>
                <option value="STTP">STTP (Short Term Training)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Organizing Department</label>
              <select
                className="form-select"
                value={formData.department_id}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                required
              >
                {departments.length === 0 && <option value="">Loading departments...</option>}
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Programme Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Generative AI for Engineering Education"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Programme Description</label>
            <textarea
              className="form-textarea"
              placeholder="Executive summary of programme objectives, technical scope, and pedagogy..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Programme Objectives</label>
              <textarea
                className="form-textarea"
                placeholder="1. Objective one&#10;2. Objective two..."
                value={formData.objectives}
                onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">NBA-OBE Learning Outcomes</label>
              <textarea
                className="form-textarea"
                placeholder="1. Outcome one&#10;2. Outcome two..."
                value={formData.learning_outcomes}
                onChange={(e) => setFormData({ ...formData, learning_outcomes: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-4">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Hours)</label>
              <input
                type="number"
                step="1"
                className="form-input"
                value={formData.duration_hours}
                onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Capacity (Seats)</label>
              <input
                type="number"
                className="form-input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Delivery Mode</label>
              <select
                className="form-select"
                value={formData.delivery_mode}
                onChange={(e) => setFormData({ ...formData, delivery_mode: e.target.value })}
              >
                <option value="HYBRID">Hybrid (Campus + Online)</option>
                <option value="OFFLINE">Offline (In-Person)</option>
                <option value="ONLINE">Online (Virtual)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Faculty Coordinator</label>
              <select
                className="form-select"
                value={formData.coordinator_faculty_id}
                onChange={(e) => setFormData({ ...formData, coordinator_faculty_id: e.target.value })}
              >
                <option value="">Select Coordinator (Optional)</option>
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>{f.full_name} ({f.department_name || f.faculty_code})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estimated Budget (Rs.)</label>
              <input
                type="number"
                step="500"
                className="form-input"
                value={formData.estimated_budget}
                onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => navigate('/app/events')} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>{saving ? 'Creating Draft...' : 'Save as DRAFT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
