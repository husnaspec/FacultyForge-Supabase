import React, { useState, useEffect } from 'react';
import { api, asArray } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowRight,
  Plus,
  CheckCircle2,
  Calendar,
  Star,
  ExternalLink,
  Layers,
  FlaskConical,
  ShieldCheck,
  Award,
  AlertCircle,
} from 'lucide-react';

export default function TeachingImpactPage() {
  const { activeFacultyId, isAdmin, isApprover } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(activeFacultyId || 1);
  const [impactList, setImpactList] = useState([]);
  const [facultyProgrammes, setFacultyProgrammes] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [isCustomSkill, setIsCustomSkill] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    faculty_id: selectedFacultyId === 'ALL' ? 1 : selectedFacultyId,
    event_id: '',
    skill_name: 'ANSYS',
    application_type: 'LAB',
    description: '',
    evidence_reference: '',
    self_rating: 4,
    status: 'APPLIED',
  });

  useEffect(() => {
    loadFacultyList();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      loadImpacts();
      loadFacultyContext(selectedFacultyId);
      if (selectedFacultyId !== 'ALL') {
        setFormData((prev) => ({ ...prev, faculty_id: selectedFacultyId }));
      }
    }
  }, [selectedFacultyId]);

  const loadFacultyList = async () => {
    try {
      const facs = await api.getFacultyList();
      const list = asArray(facs, 'faculty', 'faculty_members');
      setFacultyList(list);
      if (list.length > 0) {
        if (!selectedFacultyId || (selectedFacultyId !== 'ALL' && !list.some((f) => String(f.id) === String(selectedFacultyId)))) {
          setSelectedFacultyId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load faculty list:', err);
      setError(err.message || 'Failed to load faculty list');
    }
  };

  const loadFacultyContext = async (fId) => {
    if (fId === 'ALL') {
      setFacultyProgrammes([]);
      setAvailableSkills([]);
      return;
    }
    try {
      const [progs, skills] = await Promise.all([
        api.getFacultyProgrammes(fId).catch(() => []),
        api.getVerifiedSkills(fId).catch(() => []),
      ]);
      setFacultyProgrammes(asArray(progs, 'programmes'));
      setAvailableSkills(asArray(skills, 'verified_skills'));
    } catch (err) {
      console.error('Failed to load faculty programmes/skills:', err);
    }
  };

  const loadImpacts = async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (selectedFacultyId === 'ALL') {
        data = await api.getAllTeachingImpact();
      } else {
        data = await api.getFacultyTeachingImpact(selectedFacultyId);
      }
      setImpactList(asArray(data, 'impacts', 'records'));
    } catch (err) {
      console.error('Failed to load teaching impacts:', err);
      setError(err.message || 'Failed to load teaching impacts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalError('');
    const defaultFacId = selectedFacultyId === 'ALL' ? (facultyList[0]?.id || 1) : selectedFacultyId;
    // Prefer ANSYS if present in faculty's skills or use first available
    const ansysSkill = availableSkills.find(
      (s) => (typeof s === 'string' ? s : s.skill_name)?.toLowerCase() === 'ansys'
    );
    const initialSkill = ansysSkill
      ? (typeof ansysSkill === 'string' ? ansysSkill : ansysSkill.skill_name)
      : (availableSkills.length > 0 ? (availableSkills[0].skill_name || availableSkills[0]) : 'ANSYS');

    // Prefer International Mechanical Day or event 12/13 or first programme
    const preferredProg = facultyProgrammes.find(
      (p) => p.title?.toLowerCase().includes('mechanical') || p.id === 13 || p.id === 12
    ) || facultyProgrammes[0];
    const initialProg = preferredProg ? preferredProg.id : '';

    setFormData({
      faculty_id: defaultFacId,
      event_id: initialProg,
      skill_name: typeof initialSkill === 'string' ? initialSkill : (initialSkill?.skill_name || 'ANSYS'),
      application_type: 'LAB',
      description: '',
      evidence_reference: '',
      self_rating: 4,
      status: 'APPLIED',
    });
    setIsCustomSkill(false);
    setShowAddModal(true);
  };

  const handleModalFacultyChange = (newFacId) => {
    setFormData((prev) => ({ ...prev, faculty_id: newFacId }));
    loadFacultyContext(newFacId);
  };

  const handleRecordImpact = async (e) => {
    e.preventDefault();
    setModalError('');

    const desc = formData.description?.trim();
    if (!desc) {
      setModalError('Please describe how the skill was applied in teaching, lab, or research.');
      return;
    }
    if (!formData.skill_name?.trim()) {
      setModalError('Please enter or select a skill name.');
      return;
    }

    setSubmitting(true);
    try {
      const targetFacId = formData.faculty_id || (selectedFacultyId === 'ALL' ? (facultyList[0]?.id || 1) : selectedFacultyId);
      // Role enforcement: Faculty cannot self-verify
      const statusVal = (isAdmin || isApprover)
        ? (formData.status || 'APPLIED')
        : (formData.status === 'PLANNED' ? 'PLANNED' : 'APPLIED');

      await api.recordTeachingImpact(targetFacId, {
        faculty_id: targetFacId,
        event_id: formData.event_id ? parseInt(formData.event_id, 10) : null,
        skill_name: formData.skill_name.trim(),
        application_type: formData.application_type,
        description: desc,
        application_description: desc,
        evidence_reference: formData.evidence_reference?.trim() || null,
        evidence_url: formData.evidence_reference?.trim() || null,
        self_rating: parseFloat(formData.self_rating) || 4.0,
        status: statusVal,
        impact_status: statusVal,
      });

      setShowAddModal(false);
      setSuccessMsg('Teaching impact recorded successfully!');
      setTimeout(() => setSuccessMsg(''), 6000);

      // Reload records without full page reload
      if (selectedFacultyId === 'ALL' || targetFacId === selectedFacultyId) {
        await loadImpacts();
      } else {
        setSelectedFacultyId(targetFacId);
      }
    } catch (err) {
      console.error('Failed to record teaching impact:', err);
      let displayError = err.message || 'Failed to record teaching impact';
      if (err.status === 422 && Array.isArray(err.data?.detail)) {
        displayError = 'Validation Error: ' + err.data.detail.map((d) => `${d.loc?.slice(1).join('.') || ''}: ${d.msg}`).join(', ');
      }
      setModalError(displayError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyImpact = async (impactId) => {
    setVerifyingId(impactId);
    try {
      await api.verifyTeachingImpact(impactId, {
        verified_by: isAdmin ? 'Admin / FDP Coordinator' : 'HOD / IQAC Reviewer',
      });
      await loadImpacts();
    } catch (err) {
      alert(err.message || 'Failed to verify teaching impact');
    } finally {
      setVerifyingId(null);
    }
  };

  // Real Metrics Calculations
  const appliedAndVerifiedRecords = impactList.filter(
    (i) => i.impact_status === 'APPLIED' || i.impact_status === 'VERIFIED' || i.status === 'APPLIED' || i.status === 'VERIFIED'
  );
  const appliedCount = appliedAndVerifiedRecords.length;
  const avgRating =
    impactList.length > 0
      ? (impactList.reduce((acc, i) => acc + (parseFloat(i.self_rating) || 0), 0) / impactList.length).toFixed(1)
      : '0.0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem' }}>
            <span className="badge badge-high" style={{ background: 'rgba(14, 165, 233, 0.12)', color: '#0284c7' }}>
              TRANSLATIONAL PEDAGOGY
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Faculty Development Tracking
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Teaching Impact Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '800px' }}>
            Did the training change classroom and research practice? Track verifiable translation of acquired skills
            into course curricula, laboratory modules, and student capstone mentoring.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-sm"
          id="record-teaching-impact-header-btn"
        >
          <Plus size={15} />
          <span>+ Record Teaching Impact</span>
        </button>
      </div>

      {successMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#047857', padding: '0.75rem 1rem', borderRadius: '6px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Visual Translational Pipeline */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(240, 249, 255, 0.8) 0%, rgba(224, 242, 254, 0.8) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '1.25rem 1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#38bdf8', color: '#ffffff' }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0369a1' }}>Training Completed</span>
              <p style={{ fontSize: '0.75rem', color: '#0284c7' }}>Certified FDP/Workshop</p>
            </div>
          </div>

          <ArrowRight size={18} style={{ color: '#0284c7' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#0284c7', color: '#ffffff' }}>
              <Layers size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0369a1' }}>Skill Acquired</span>
              <p style={{ fontSize: '0.75rem', color: '#0284c7' }}>Evidenced Competency</p>
            </div>
          </div>

          <ArrowRight size={18} style={{ color: '#0284c7' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#0369a1', color: '#ffffff' }}>
              <FlaskConical size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0369a1' }}>Applied in Class/Lab</span>
              <p style={{ fontSize: '0.75rem', color: '#0284c7' }}>Translational Delivery</p>
            </div>
          </div>

          <ArrowRight size={18} style={{ color: '#0284c7' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#10b981', color: '#ffffff' }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#047857' }}>Impact Recorded</span>
              <p style={{ fontSize: '0.75rem', color: '#059669' }}>Verified Accreditation ROI</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Faculty Selector & Stats */}
      <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: '1', minWidth: '260px', maxWidth: '400px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
            SELECT FACULTY MEMBER
          </label>
          <select
            className="input"
            value={selectedFacultyId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedFacultyId(val === 'ALL' ? 'ALL' : parseInt(val, 10));
            }}
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
          >
            <option value="ALL">All Faculty (Institution-wide)</option>
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.full_name} ({f.department_name || f.faculty_code})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary btn-sm"
          id="record-teaching-impact-selector-btn"
          style={{ alignSelf: 'flex-end', marginBottom: '2px' }}
        >
          <Plus size={15} />
          <span>+ Record Teaching Impact</span>
        </button>

        <div style={{ display: 'flex', gap: '1.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>APPLIED RECORDS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
              {appliedCount}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVERAGE SELF RATING</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {avgRating} / 5.0
            </div>
          </div>
        </div>
      </div>

      {/* Applied Learning Cards Grid */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading teaching impact records...</p>
        </div>
      ) : impactList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <FlaskConical size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 0.875rem', display: 'block', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
            {error ? 'Could not load teaching impact records.' : 'No teaching impact records submitted yet.'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '540px', margin: '0 auto 1.5rem', lineHeight: 1.5 }}>
            Record how FDP learning was applied in teaching, research, laboratory or academic practice.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary btn-sm"
            id="record-teaching-impact-empty-btn"
            style={{ margin: '0 auto' }}
          >
            <Plus size={15} />
            <span>+ Record Teaching Impact</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {impactList.map((imp) => {
            const currentStatus = imp.impact_status || imp.status || 'APPLIED';
            const isVerified = currentStatus === 'VERIFIED';
            const impactDescription = imp.application_description || imp.description;
            const evidenceRef = imp.evidence_url || imp.evidence_reference;
            const isLink = evidenceRef && (evidenceRef.startsWith('http://') || evidenceRef.startsWith('https://'));

            return (
              <div
                key={imp.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  border: isVerified ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 800,
                        background: 'rgba(2, 132, 199, 0.1)',
                        color: '#0284c7',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {imp.application_type}
                    </span>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{imp.skill_name}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isVerified ? '#059669' : '#0284c7',
                        background: isVerified ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                      }}
                    >
                      {currentStatus}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.875rem', fontWeight: 700 }}>
                      <Star size={14} fill="#f59e0b" />
                      <span>{imp.self_rating}/5.0</span>
                    </div>

                    {/* Admin / HOD Verification Action */}
                    {(isAdmin || isApprover) && !isVerified && (
                      <button
                        onClick={() => handleVerifyImpact(imp.id)}
                        disabled={verifyingId === imp.id}
                        className="btn btn-outline btn-xs"
                        style={{
                          borderColor: '#10b981',
                          color: '#059669',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <ShieldCheck size={13} />
                        <span>{verifyingId === imp.id ? 'Verifying...' : 'Verify Impact'}</span>
                      </button>
                    )}
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {impactDescription}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '0.625rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span>
                    Associated Training: <strong>{imp.event_title || 'Continuous Professional Development'}</strong>
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {evidenceRef && (
                      isLink ? (
                        <a
                          href={evidenceRef}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                          <span>View Artifact</span>
                          <ExternalLink size={12} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>
                          Evidence: <em>{evidenceRef}</em>
                        </span>
                      )
                    )}

                    {isVerified && imp.verified_by && (
                      <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CheckCircle2 size={13} />
                        <span>Verified by {imp.verified_by}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Impact Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          title="Record Teaching Impact"
          onClose={() => setShowAddModal(false)}
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
          <form onSubmit={handleRecordImpact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Faculty Field */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Faculty Member *
              </label>
              <select
                className="input"
                value={formData.faculty_id}
                onChange={(e) => handleModalFacultyChange(parseInt(e.target.value))}
                disabled={!isAdmin && !isApprover}
              >
                {facultyList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.full_name} ({f.department_name || f.faculty_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Programme / Associated Training */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Programme / Associated Training
              </label>
              <select
                className="input"
                value={formData.event_id}
                onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
              >
                <option value="">General Academic Development / Other Training</option>
                {facultyProgrammes.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} {ev.relationship ? `(${ev.relationship})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Skill Selection */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Skill *</label>
                {availableSkills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSkill(!isCustomSkill);
                      if (!isCustomSkill) {
                        setFormData((prev) => ({ ...prev, skill_name: '' }));
                      } else {
                        const fallbackSkill = availableSkills[0]?.skill_name || availableSkills[0] || '';
                        setFormData((prev) => ({ ...prev, skill_name: fallbackSkill }));
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      padding: 0,
                    }}
                  >
                    {isCustomSkill ? 'Select from verified skills' : '+ Enter custom skill'}
                  </button>
                )}
              </div>

              {!isCustomSkill && availableSkills.length > 0 ? (
                <select
                  className="input"
                  value={formData.skill_name}
                  onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                  required
                >
                  {availableSkills.map((s, idx) => {
                    const sName = s.skill_name || s;
                    return (
                      <option key={idx} value={sName}>
                        {sName} {s.status ? `[${s.status}]` : ''}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Generative AI, Prompt Engineering, Cloud Security..."
                  value={formData.skill_name}
                  onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
                  required
                />
              )}
            </div>

            {/* Application Type */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Application Type *
              </label>
              <select
                className="input"
                value={formData.application_type}
                onChange={(e) => setFormData({ ...formData, application_type: e.target.value })}
              >
                <option value="CLASSROOM">CLASSROOM — Classroom Instruction / Course Delivery</option>
                <option value="LAB">LAB — Laboratory Module & Hands-on Practicals</option>
                <option value="RESEARCH">RESEARCH — Empirical Research & Manuscript Drafting</option>
                <option value="ASSESSMENT">ASSESSMENT — Formative / Summative Adaptive Assessments</option>
                <option value="CONTENT_CREATION">CONTENT_CREATION — Digital Curriculum & Lecture Notes</option>
                <option value="PROJECT_GUIDANCE">PROJECT_GUIDANCE — Student Capstone & Hackathon Mentoring</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Description *
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Describe how the skill was applied in teaching, research, laboratory or academic practice (e.g. Used Generative AI to create quiz questions and explain difficult concepts with classroom examples)..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {/* Evidence URL or Artifact Reference */}
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Evidence URL or Artifact Reference (Optional)
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Lesson plan / LMS activity or https://lms.university.edu/courses/..."
                value={formData.evidence_reference}
                onChange={(e) => setFormData({ ...formData, evidence_reference: e.target.value })}
              />
            </div>

            {/* Self Rating & Status Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Self Rating (1 to 5)
                </label>
                <select
                  className="input"
                  value={formData.self_rating}
                  onChange={(e) => setFormData({ ...formData, self_rating: parseFloat(e.target.value) })}
                >
                  <option value="5">5 / 5 (Transformative Impact)</option>
                  <option value="4">4 / 5 (Substantial Application)</option>
                  <option value="3">3 / 5 (Moderate Integration)</option>
                  <option value="2">2 / 5 (Initial Experimentation)</option>
                  <option value="1">1 / 5 (Preliminary Exploration)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Status
                </label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="APPLIED">APPLIED (Default)</option>
                  <option value="PLANNED">PLANNED (Upcoming)</option>
                  {(isAdmin || isApprover) && (
                    <option value="VERIFIED">VERIFIED (Reviewed)</option>
                  )}
                </select>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-sm"
                style={{ minWidth: '120px' }}
              >
                {submitting ? 'Recording...' : 'Record Impact'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
