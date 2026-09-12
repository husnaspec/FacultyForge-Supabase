import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Compass, PlusCircle, Search, Star, Building, CheckCircle2 } from 'lucide-react';

export default function ResourcePersonsList() {
  const [resourcePersons, setResourcePersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    designation: 'Professor',
    expertise: '',
    topics: '',
    biography: '',
    years_of_experience: 12.0,
    total_sessions: 15,
    average_rating: 4.8,
    honorarium_expectation: 'Rs. 20,000 / day',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadRPs();
  }, [search]);

  const loadRPs = async () => {
    setLoading(true);
    try {
      const list = await api.getResourcePersons(search);
      setResourcePersons(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRP = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      await api.createResourcePerson({
        ...formData,
        years_of_experience: parseFloat(formData.years_of_experience),
        total_sessions: parseInt(formData.total_sessions),
        average_rating: parseFloat(formData.average_rating),
      });
      setShowModal(false);
      loadRPs();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create resource person');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
            <Compass size={24} style={{ color: 'var(--brand-primary)' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Resource Person Directory</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Expert trainers, industrial specialists, and guest researchers for institutional development programmes.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <PlusCircle size={15} />
          <span>Add Resource Person</span>
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
        <input
          type="text"
          className="form-input"
          style={{ width: '100%', paddingLeft: '2.25rem' }}
          placeholder="Search by name, organization, or expertise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Resource Person Grid */}
      <div className="grid-2">
        {resourcePersons.map((rp) => (
          <div
            key={rp.id}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{rp.name}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {rp.designation} &bull; {rp.organization}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {rp.email} &bull; {rp.phone || 'Phone upon booking'}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', justifyContent: 'flex-end' }}>
                    <Star size={14} fill="#fbbf24" />
                    <span style={{ fontWeight: 800, fontSize: '0.9375rem' }}>{rp.average_rating}</span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {rp.total_sessions} Sessions
                  </span>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {rp.expertise?.split(',').map((e, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.6875rem',
                      background: 'var(--bg-card)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {e.trim()}
                  </span>
                ))}
              </div>

              {rp.biography && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  {rp.biography}
                </p>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Experience: <strong>{rp.years_of_experience} yrs</strong></span>
              <span>Honorarium: <strong>{rp.honorarium_expectation || 'Negotiable'}</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New Resource Person">
        <form onSubmit={handleCreateRP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Organization / University</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Expertise Domains (comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Generative AI, Deep Learning, Cloud Systems"
              required
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
            />
          </div>

          <div className="grid-3">
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
            <div className="form-group">
              <label className="form-label">Total Sessions</label>
              <input
                type="number"
                className="form-input"
                value={formData.total_sessions}
                onChange={(e) => setFormData({ ...formData, total_sessions: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Average Rating</label>
              <input
                type="number"
                step="0.1"
                max="5"
                min="1"
                className="form-input"
                value={formData.average_rating}
                onChange={(e) => setFormData({ ...formData, average_rating: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              {saving ? 'Saving...' : 'Add Trainer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
