'use client';
import React, { useState, useEffect } from 'react';
import { Link } from '@/lib/router-compat';
import { api, asArray } from '@/services/api';
import Modal from '@/components/Modal';
import { Users, Search, PlusCircle, GraduationCap, Building2, Eye, ShieldAlert, AlertCircle } from 'lucide-react';

export default function FacultyList() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const initialFormState = {
    faculty_code: '',
    full_name: '',
    email: '',
    department_id: '',
    designation: 'Assistant Professor',
    qualification: 'Ph.D.',
    years_of_experience: 5.0,
    teaching_interests: '',
    research_interests: '',
    existing_skills: '',
    development_interests: '',
  };

  // Form State
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    loadFaculty();
  }, [deptFilter, search]);

  const loadDepartments = async () => {
    try {
      const deptList = await api.getDepartments();
      const list = asArray(deptList, 'departments');
      setDepartments(list);
      return list;
    } catch (err) {
      console.error('Failed to load departments:', err);
      return [];
    }
  };

  const loadFaculty = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const facList = await api.getFacultyList({
        department_id: deptFilter || undefined,
        search: search || undefined,
      });
      setFaculty(asArray(facList, 'faculty', 'faculty_members'));
    } catch (err) {
      console.error('Failed to load faculty:', err);
      setErrorMessage(err.message || 'Failed to load faculty members');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    await Promise.all([loadDepartments(), loadFaculty()]);
  };

  const openAddModal = async () => {
    setFormError('');
    if (departments.length === 0) {
      await loadDepartments();
    }
    setShowAddModal(true);
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    const deptId = Number(formData.department_id);
    if (!deptId || isNaN(deptId)) {
      setFormError('Please select a valid department.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        faculty_code: formData.faculty_code.trim(),
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        department_id: deptId,
        designation: formData.designation,
        qualification: formData.qualification.trim(),
        years_of_experience: Number(formData.years_of_experience) || 0,
        teaching_interests: formData.teaching_interests?.trim() || null,
        research_interests: formData.research_interests?.trim() || null,
        existing_skills: formData.existing_skills?.trim() || null,
        development_interests: formData.development_interests?.trim() || null,
        is_active: true,
      };

      await api.createFaculty(payload);
      setShowAddModal(false);
      setSuccessMessage(`Faculty member "${payload.full_name}" added successfully.`);
      setTimeout(() => setSuccessMessage(''), 5000);
      setFormData(initialFormState);
      await loadFaculty();
    } catch (err) {
      console.error('Faculty creation error:', err);
      setFormError(err.message || 'Failed to create faculty member');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Faculty Directory</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage institutional faculty members, competency profiles, and development passports.
          </p>
        </div>

        <button onClick={openAddModal} className="btn btn-primary btn-sm">
          <PlusCircle size={15} />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.25rem' }}
            placeholder="Search by name, code, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="form-select"
          style={{ minWidth: '180px' }}
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.code} - {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Faculty Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name & Designation</th>
                <th>Department</th>
                <th>Experience</th>
                <th>Existing Skills</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {f.faculty_code}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{f.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.designation}</div>
                  </td>
                  <td>
                    <span className="badge badge-low" style={{ fontSize: '0.6875rem' }}>
                      {f.department_name || 'CSE'}
                    </span>
                  </td>
                  <td>{f.years_of_experience} yrs</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: '280px' }}>
                      {f.existing_skills?.split(',').slice(0, 3).map((s, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.6875rem',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '0.15rem 0.4rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                          }}
                        >
                          {s.trim()}
                        </span>
                      ))}
                      {f.existing_skills?.split(',').length > 3 && (
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          +{f.existing_skills.split(',').length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: f.is_active ? '#34d399' : '#f87171',
                        background: f.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {f.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/app/faculty/${f.id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to={`/app/faculty/${f.id}/passport`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        <GraduationCap size={13} />
                        <span>Passport</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Faculty Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Faculty Member">
        <form onSubmit={handleCreateFaculty} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {formError && <div className="alert alert-danger">{formError}</div>}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Faculty Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FAC-CSE-015"
                required
                value={formData.faculty_code}
                onChange={(e) => setFormData({ ...formData, faculty_code: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dr. Jane Doe"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="jane.doe@university.edu"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                required
                value={formData.department_id || ''}
                onChange={(e) => setFormData({ ...formData, department_id: e.target.value ? Number(e.target.value) : '' })}
              >
                {departments.length === 0 ? (
                  <option value="">Loading departments...</option>
                ) : (
                  <>
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {d.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Designation</label>
              <select
                className="form-select"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              >
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Professor & HOD">Professor & HOD</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ph.D. in CS"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Years Exp</label>
              <input
                type="number"
                step="0.5"
                className="form-input"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Teaching Interests (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Artificial Intelligence, Data Structures"
              value={formData.teaching_interests}
              onChange={(e) => setFormData({ ...formData, teaching_interests: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Existing Skills (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Python, Machine Learning, C++"
              value={formData.existing_skills}
              onChange={(e) => setFormData({ ...formData, existing_skills: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              {saving ? 'Saving...' : 'Save Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
