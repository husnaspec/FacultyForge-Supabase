'use client';
import React, { useState, useEffect } from 'react';
import { api, asArray } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/Modal';
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
  const { activeFacultyId, isAdmin, isApprover } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(activeFacultyId || 1);
  const [verifiedSkills, setVerifiedSkills] = useState([]);
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isCustomSkill, setIsCustomSkill] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    faculty_id: selectedFacultyId || 1,
    skill_name: 'ANSYS',
    evidence_type: 'PRACTICAL_ACTIVITY',
    evidence_reference: '',
    score: 85,
    verification_status: 'UNVERIFIED',
    verified_by: '',
  });

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      loadEvidenceData(selectedFacultyId);
    }
  }, [selectedFacultyId]);

  const loadFaculty = async () => {
    try {
      const list = await api.getFacultyList();
      const facs = asArray(list, 'faculty', 'faculty_members');
      setFacultyList(facs);
      if (facs.length > 0) {
        if (!selectedFacultyId || !facs.some((f) => String(f.id) === String(selectedFacultyId))) {
          setSelectedFacultyId(facs[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load faculty:', err);
      setError(err.message || 'Failed to load faculty list');
    }
  };

  const loadEvidenceData = async (fId = selectedFacultyId) => {
    if (!fId) return;
    setLoading(true);
    setError('');
    try {
      const [vSkills, evList] = await Promise.all([
        api.getVerifiedSkills(fId),
        api.getSkillEvidence(fId),
      ]);
      setVerifiedSkills(asArray(vSkills, 'verified_skills'));
      setEvidences(asArray(evList, 'evidence', 'skill_evidence'));
    } catch (err) {
      console.error('Failed to load evidence data:', err);
      setError(err.message || 'Failed to load skill evidence data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvidenceModal = () => {
    setModalError('');
    const targetFacId = selectedFacultyId || (facultyList[0]?.id || 1);
    const initialSkill = verifiedSkills.length > 0 ? verifiedSkills[0].skill_name : 'ANSYS';
    setFormData({
      faculty_id: targetFacId,
      skill_name: initialSkill,
      evidence_type: 'PRACTICAL_ACTIVITY',
      evidence_reference: '',
      score: 85,
      verification_status: (isAdmin || isApprover) ? 'VERIFIED' : 'UNVERIFIED',
      verified_by: (isAdmin || isApprover) ? 'IQAC Academic Advisory Board' : '',
    });
    setIsCustomSkill(false);
    setShowEvidenceModal(true);
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.evidence_reference?.trim()) {
      setModalError('Please enter evidence reference details.');
      return;
    }
    if (!formData.skill_name?.trim()) {
      setModalError('Please enter or select a skill name.');
      return;
    }

    setSubmitting(true);
    try {
      const targetFacId = formData.faculty_id || selectedFacultyId;
      // Role enforcement: Faculty/Participant cannot self-verify, must default to UNVERIFIED
      const statusVal = (isAdmin || isApprover) ? (formData.verification_status || 'VERIFIED') : 'UNVERIFIED';
      const isVer = statusVal === 'VERIFIED' || statusVal === 'PARTIALLY_VERIFIED';
      const verBy = isVer ? (formData.verified_by?.trim() || (isAdmin ? 'Admin / FDP Coordinator' : 'IQAC Academic Committee')) : null;

      const payload = {
        faculty_id: targetFacId,
        skill_name: formData.skill_name.trim(),
        evidence_type: formData.evidence_type,
        evidence_reference: formData.evidence_reference.trim(),
        score: formData.score !== '' && formData.score !== null && !isNaN(Number(formData.score)) ? parseFloat(formData.score) : null,
        verification_status: statusVal,
        verified: isVer,
        verified_by: verBy,
      };

      await api.addSkillEvidence(targetFacId, payload);

      setShowEvidenceModal(false);
      setSuccessMsg(`Skill evidence for "${payload.skill_name}" submitted successfully!`);
      setTimeout(() => setSuccessMsg(''), 6000);

      // Refetch evidence without full page reload
      if (targetFacId === selectedFacultyId) {
        await loadEvidenceData(targetFacId);
      } else {
        setSelectedFacultyId(targetFacId);
      }
    } catch (err) {
      console.error('Failed to record evidence:', err);
      let displayError = err.message || 'Failed to record evidence';
      if (err.status === 422 && Array.isArray(err.data?.detail)) {
        displayError = 'Validation Error: ' + err.data.detail.map((d) => `${d.loc?.slice(1).join('.') || ''}: ${d.msg}`).join(', ');
      }
      setModalError(displayError);
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
          <button
            onClick={handleOpenEvidenceModal}
            className="btn btn-primary btn-sm"
            id="submit-skill-evidence-btn"
          >
            <Plus size={15} />
            <span>+ Submit Skill Evidence</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#047857', padding: '0.75rem 1rem', borderRadius: '6px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

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
                evidences.map((ev) => {
                  const vStatus = ev.verification_status || (ev.verified ? 'VERIFIED' : 'UNVERIFIED');
                  const isVerified = vStatus === 'VERIFIED';
                  const isPartial = vStatus === 'PARTIALLY_VERIFIED';

                  return (
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
                      <td>{ev.score !== null && ev.score !== undefined ? `${ev.score}%` : 'N/A'}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: isVerified ? '#059669' : isPartial ? '#d97706' : '#64748b',
                            background: isVerified ? 'rgba(16, 185, 129, 0.12)' : isPartial ? 'rgba(245, 158, 11, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          {isVerified ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                          {vStatus}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {ev.verified ? (ev.verified_by || 'IQAC Committee') : 'Pending Review'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Evidence Modal */}
      {showEvidenceModal && (
        <Modal
          isOpen={showEvidenceModal}
          title="Submit Skill Evidence"
          onClose={() => setShowEvidenceModal(false)}
        >
          {modalError && (
            <div
              className="alert alert-danger"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                padding: '0.625rem 0.875rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#b91c1c',
                borderRadius: '6px',
                fontSize: '0.8125rem',
              }}
            >
              <AlertCircle size={16} />
              <span>{modalError}</span>
            </div>
          )}

          <form onSubmit={handleAddEvidence} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Faculty Member */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Faculty Member *
              </label>
              <select
                className="input"
                value={formData.faculty_id}
                onChange={(e) => {
                  const fId = parseInt(e.target.value, 10);
                  setFormData({ ...formData, faculty_id: fId });
                  loadEvidenceData(fId);
                }}
                disabled={!isAdmin && !isApprover}
              >
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.full_name} ({f.department_name || f.faculty_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Name */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Skill Name *</label>
                {verifiedSkills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSkill(!isCustomSkill);
                      if (!isCustomSkill) {
                        setFormData((p) => ({ ...p, skill_name: '' }));
                      } else {
                        setFormData((p) => ({ ...p, skill_name: verifiedSkills[0]?.skill_name || 'ANSYS' }));
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    {isCustomSkill ? 'Select from faculty skills' : '+ Enter custom skill'}
                  </button>
                )}
              </div>

              {!isCustomSkill && verifiedSkills.length > 0 ? (
                <select
                  className="input"
                  value={formData.skill_name}
                  onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                  required
                >
                  {verifiedSkills.map((s, idx) => (
                    <option key={idx} value={s.skill_name}>
                      {s.skill_name} [{s.proficiency_level}]
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. ANSYS, SolidWorks, Generative AI..."
                  value={formData.skill_name}
                  onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                  required
                />
              )}
            </div>

            {/* Evidence Type */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Evidence Type *
              </label>
              <select
                className="input"
                value={formData.evidence_type}
                onChange={(e) => setFormData({ ...formData, evidence_type: e.target.value })}
              >
                <option value="ASSESSMENT">ASSESSMENT — Post-Assessment Score</option>
                <option value="CERTIFICATE">CERTIFICATE — Certificate of Completion</option>
                <option value="PROJECT">PROJECT — Capstone Project / Artifact Submission</option>
                <option value="PRACTICAL_ACTIVITY">PRACTICAL_ACTIVITY — Practical Laboratory Activity</option>
                <option value="TRAINER_EVALUATION">TRAINER_EVALUATION — Trainer Evaluation Rubric</option>
                <option value="WORKSHOP_COMPLETION">WORKSHOP_COMPLETION — Verified Workshop Completion</option>
              </select>
            </div>

            {/* Evidence Reference Details */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Evidence Reference / Artifact *
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. ANSYS structural analysis laboratory exercise or report / repository link..."
                value={formData.evidence_reference}
                onChange={(e) => setFormData({ ...formData, evidence_reference: e.target.value })}
                required
              />
            </div>

            {/* Score & Verification Status Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Score (0–100)
                </label>
                <input
                  type="number"
                  className="input"
                  min="0"
                  max="100"
                  placeholder="e.g. 85"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Verification Status *
                </label>
                <select
                  className="input"
                  value={formData.verification_status}
                  onChange={(e) => setFormData({ ...formData, verification_status: e.target.value })}
                  disabled={!isAdmin && !isApprover}
                >
                  <option value="UNVERIFIED">UNVERIFIED (Default)</option>
                  {(isAdmin || isApprover) && (
                    <>
                      <option value="PARTIALLY_VERIFIED">PARTIALLY_VERIFIED</option>
                      <option value="VERIFIED">VERIFIED</option>
                    </>
                  )}
                </select>
                {!isAdmin && !isApprover && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                    Faculty submissions require IQAC verification.
                  </span>
                )}
              </div>
            </div>

            {(isAdmin || isApprover) && formData.verification_status !== 'UNVERIFIED' && (
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Verified By
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. IQAC Academic Committee / HOD"
                  value={formData.verified_by}
                  onChange={(e) => setFormData({ ...formData, verified_by: e.target.value })}
                />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowEvidenceModal(false)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-sm"
                style={{ minWidth: '130px' }}
              >
                {submitting ? 'Submitting...' : '+ Submit Evidence'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
