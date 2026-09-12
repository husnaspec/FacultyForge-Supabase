import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
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
} from 'lucide-react';

export default function TeachingImpactPage() {
  const { activeFacultyId } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(activeFacultyId || 1);
  const [impactList, setImpactList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    skill_name: 'Generative AI',
    event_id: '',
    application_type: 'CLASSROOM',
    application_description: '',
    evidence_url: '',
    self_rating: 5,
    impact_status: 'APPLIED',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFacultyAndEvents();
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      loadImpacts();
    }
  }, [selectedFacultyId]);

  const loadFacultyAndEvents = async () => {
    try {
      const [facs, evts] = await Promise.all([
        api.getFacultyList(),
        api.getEvents({ status: 'COMPLETED' }),
      ]);
      setFacultyList(facs || []);
      setEventsList(evts || []);
      if (!selectedFacultyId && facs.length > 0) {
        setSelectedFacultyId(facs[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadImpacts = async () => {
    setLoading(true);
    try {
      const data = await api.getFacultyTeachingImpact(selectedFacultyId);
      setImpactList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordImpact = async (e) => {
    e.preventDefault();
    if (!formData.application_description) {
      alert('Please describe how you applied this skill.');
      return;
    }
    setSubmitting(true);
    try {
      await api.recordTeachingImpact(selectedFacultyId, {
        ...formData,
        event_id: formData.event_id ? parseInt(formData.event_id) : null,
        self_rating: parseFloat(formData.self_rating) || 4.0,
      });
      setShowAddModal(false);
      setFormData({
        skill_name: 'Generative AI',
        event_id: '',
        application_type: 'CLASSROOM',
        application_description: '',
        evidence_url: '',
        self_rating: 5,
        impact_status: 'APPLIED',
      });
      loadImpacts();
    } catch (err) {
      alert(err.message || 'Failed to record teaching impact');
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

        <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
          <Plus size={15} />
          <span>Record Teaching Application</span>
        </button>
      </div>

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

      {/* Faculty Selector & Stats */}
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
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>APPLIED RECORDS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
              {impactList.length}
            </div>
          </div>
          <div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>AVERAGE SELF RATING</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
              {impactList.length > 0
                ? (impactList.reduce((acc, i) => acc + i.self_rating, 0) / impactList.length).toFixed(1)
                : '5.0'} / 5.0
            </div>
          </div>
        </div>
      </div>

      {/* Applied Learning Cards Grid */}
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading teaching impact records...</p>
      ) : impactList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No applied learning records registered yet for this faculty member.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {impactList.map((imp) => (
            <div
              key={imp.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.875rem',
                border: imp.impact_status === 'VERIFIED' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-subtle)',
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
                      color: imp.impact_status === 'VERIFIED' ? '#059669' : '#0284c7',
                      background: imp.impact_status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(2, 132, 199, 0.12)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                    }}
                  >
                    {imp.impact_status}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.875rem', fontWeight: 700 }}>
                    <Star size={14} fill="#f59e0b" />
                    <span>{imp.self_rating}/5.0</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {imp.application_description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.625rem' }}>
                <span>Associated Training: {imp.event_title || 'Continuous Professional Development'}</span>
                {imp.evidence_url && (
                  <a href={imp.evidence_url} target="_blank" rel="noreferrer" style={{ color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>View LMS/Lab Artifact</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Impact Modal */}
      {showAddModal && (
        <Modal title="Record Practical Teaching Application" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleRecordImpact} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                Application Type *
              </label>
              <select
                className="input"
                value={formData.application_type}
                onChange={(e) => setFormData({ ...formData, application_type: e.target.value })}
              >
                <option value="CLASSROOM">Classroom Instruction / Course Delivery</option>
                <option value="LAB">Laboratory Module & Hands-on Practicals</option>
                <option value="RESEARCH">Empirical Research & Manuscript Drafting</option>
                <option value="ASSESSMENT">Formative / Summative Adaptive Assessments</option>
                <option value="CONTENT_CREATION">Digital Curriculum & Lecture Notes</option>
                <option value="PROJECT_GUIDANCE">Student Capstone & Hackathon Mentoring</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Application Description *
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="Describe how the skill changed classroom/research practice (e.g. Used GenAI to create adaptive quizzes for Data Structures course)..."
                value={formData.application_description}
                onChange={(e) => setFormData({ ...formData, application_description: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Self Rating (1 to 5)
                </label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  max="5"
                  step="0.5"
                  value={formData.self_rating}
                  onChange={(e) => setFormData({ ...formData, self_rating: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                  Related Completed FDP (Optional)
                </label>
                <select
                  className="input"
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                >
                  <option value="">General Academic Development</option>
                  {eventsList.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>
                Evidence URL / Artifact Link (Optional)
              </label>
              <input
                type="url"
                className="input"
                placeholder="https://lms.university.edu/courses/..."
                value={formData.evidence_url}
                onChange={(e) => setFormData({ ...formData, evidence_url: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline btn-sm">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                {submitting ? 'Recording...' : 'Record Impact'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
