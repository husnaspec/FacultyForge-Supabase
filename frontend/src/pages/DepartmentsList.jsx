import React, { useState, useEffect } from 'react';
import { api, asArray } from '../services/api';
import Modal from '../components/Modal';
import { Building2, PlusCircle, Users, Calendar, AlertCircle } from 'lucide-react';

export default function DepartmentsList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getDepartments();
      setDepartments(asArray(data, 'departments'));
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await api.createDepartment({ name, code, description, is_active: true });
      setShowModal(false);
      setName('');
      setCode('');
      setDescription('');
      loadDepartments();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create department');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            <Building2 size={24} style={{ color: 'var(--brand-primary)' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Academic Departments</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Participating faculties and departmental continuous development tracking.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <PlusCircle size={15} />
          <span>Add Department</span>
        </button>
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          Loading departments...
        </div>
      ) : departments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
          {errorMsg ? 'Could not load departments.' : 'No departments registered yet.'}
        </div>
      ) : (
        <div className="grid-2">
          {departments.map((d) => (
          <div key={d.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <span className="badge badge-low" style={{ marginBottom: '0.375rem' }}>
                  {d.code}
                </span>
                <h3 style={{ fontSize: '1.125rem' }}>{d.name}</h3>
              </div>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                Active
              </span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {d.description || 'Core engineering academic and research division.'}
            </p>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Users size={14} />
                <span>{d.faculty_count || 0} Faculty Members</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Calendar size={14} />
                <span>{d.event_count || 0} Programmes</span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Academic Department">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <div className="form-group">
            <label className="form-label">Department Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Electrical & Electronics Engineering"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. EEE"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="Overview of departmental programs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              {saving ? 'Saving...' : 'Add Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
