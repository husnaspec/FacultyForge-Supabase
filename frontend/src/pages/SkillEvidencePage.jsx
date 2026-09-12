import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  FileCheck2,
  CheckCircle2,
  Plus,
  Award,
  BookOpen,
  GraduationCap,
  Shield,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function SkillEvidencePage() {
  const { activeFacultyId } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(activeFacultyId || 1);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    skill_name: 'Generative AI',
    evidence_type: 'PROJECT',
    evidence_reference: '',
    score: 85,
    verified_by: 'IQAC Academic Advisory Board',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      loadEvidenceData();
    }
  }, [selectedFacultyId]);

  const loadFaculty = async () => {
    try {
      const list = await api.getFacultyList();
      setFacultyList(list || []);
      if (!selectedFacultyId && list.length > 0) {
        setSelectedFacultyId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadEvidenceData = async () => {
    setLoading(true);
    try {
      const [vSkills, evList] = await Promise.all([
        api.getVerifiedSkills(selectedFacultyId),
        api.getSkillEvidence(selectedFacultyId),
      ]);
      setVerifiedSkills(vSkills || []);
      setEvidences(evList || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!formData.evidence_reference) {
      alert('Please enter evidence reference details.');
      return;
    }
    setSubmitting(true);
    try {
      await api.addSkillEvidence(selectedFacultyId, {
        ...formData,
        score: parseFloat(formData.score) || null,
        verified: true,
      });
      setShowAddModal(false);
      setFormData({
        skill_name: 'Generative AI',
        evidence_type: 'PROJECT',
        evidence_reference: '',
        score: 85,
        verified_by: 'IQAC Academic Advisory Board',
      });
      loadEvidenceData();
    } catch (err) {
      alert(err.message || 'Failed to record evidence');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span className="badge badge-high" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669' }}>
              EVIDENCE-BASED ACCREDITATION
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Competency Assurance Framework
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Skill Evidence Validator</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '800px' }}>
            FDP attendance alone is not treated as proof of competency. Skills require multi-modal verified evidence
            such as post-assessments, certificates, practical assignments, and peer reviews.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Submit Skill Evidence</span>
          </button>
        </div>
      </div>

      {/* Faculty Selector Card */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1', maxWidth: '400px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            SELECT FACULTY MEMBER
          </label>
          <select
            className="input"
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(parseInt(e.target.value))}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.full_name} ({f.department_name || f.faculty_code})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>VERIFIED SKILLS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>
              {verifiedSkills.filter((s) => s.verification_status === 'VERIFIED').length}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>PARTIALLY VERIFIED</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>
              {verifiedSkills.filter((s) => s.verification_status === 'PARTIALLY_VERIFIED').length}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL EVIDENCE RECORDS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2563eb' }}>
              {evidences.length}
            </div>
          </div>
        </div>
      </div>

      {/* Verified Skills Grid */}
      <div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.875rem' }}>
          Competency Verification Summary
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading verified skills...</p>
        ) : (
          <div className="grid-3">
            {verifiedSkills.map((s, idx) => {
              const isVerified = s.verification_status === 'VERIFIED';
              const isPartial = s.verification_status === 'PARTIALLY_VERIFIED';
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    border: isVerified ? '1px solid rgba(16, 185, 129, 0.4)' : isPartial ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>{s.skill_name}</span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: isVerified ? 'rgba(16, 185, 129, 0.12)' : isPartial ? 'rgba(245, 158, 11, 0.12)' : 'rgba(148, 163, 184, 0.12)',
                        color: isVerified ? '#059669' : isPartial ? '#d97706' : '#64748b',
                      }}
                    >
                      {s.verification_status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Proficiency Level:</span>
                    <span style={{ fontWeight: 600 }}>{s.proficiency_level}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Evidence Items:</span>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>{s.evidence_count} items</span>
                  </div>

                  {s.evidence_types?.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                      {s.evidence_types.map((et, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.6875rem',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '3px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {et}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Evidence Submissions Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recorded Evidence Ledger</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Auditable records submitted by faculty, evaluators, and workshop certification engines
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'rgba(241, 245, 249, 0.6)' }}>
                <th>Skill</th>
                <th>Evidence Type</th>
                <th>Evidence Reference / Artifact</th>
                <th>Score</th>
                <th>Verification Status</th>
                <th>Verified By</th>
              </tr>
            </thead>
            <tbody>
              {evidences.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No evidence records found for this faculty member.
                  </td>
                </tr>
              ) : (
                evidences.map((ev) => (
                  <tr key={ev.id}>
                    <td style={{ fontWeight: 700 }}>{ev.skill_name}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#2563eb',
                          padding: '0.2rem 0.45rem',
                          borderRadius: '4px',
                        }}
                      >
                        {ev.evidence_type}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', color: 'var(--text-secondary)' }}>{ev.evidence_reference}</td>
                    <td>{ev.score ? `${ev.score}%` : 'N/A'}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#059669', fontWeight: 600 }}>
                        <CheckCircle2 size={13} />
                        VERIFIED
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{ev.verified_by || 'IQAC Committee'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Evidence Modal */}
      {showAddModal && (
        <Modal title="Record New Skill Evidence" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Skill Name *
              </label>
              <input
                type="text"
                className="input"
                value={formData.skill_name}
                onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Evidence Type *
              </label>
              <select
                className="input"
                value={formData.evidence_type}
                onChange={(e) => setFormData({ ...formData, evidence_type: e.target.value })}
              >
                <option value="ASSESSMENT">Post-Assessment Score</option>
                <option value="CERTIFICATE">Certificate of Completion</option>
                <option value="PROJECT">Project / Artifact Submission</option>
                <option value="TRAINER_EVALUATION">Trainer Evaluation Rubric</option>
                <option value="PRACTICAL_ACTIVITY">Practical Laboratory Activity</option>
                <option value="WORKSHOP_COMPLETION">Verified Workshop Completion</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Evidence Reference Details *
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. Completed hands-on capstone project with GitHub repo link or exam attempt ID..."
                value={formData.evidence_reference}
                onChange={(e) => setFormData({ ...formData, evidence_reference: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Score / Percentage (Optional)
                </label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Verified By
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.verified_by}
                  onChange={(e) => setFormData({ ...formData, verified_by: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                {submitting ? 'Recording...' : 'Save Evidence'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
