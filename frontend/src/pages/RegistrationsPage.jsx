import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  UserCheck2, CheckCircle2, AlertCircle, QrCode,
  Download, X, Sparkles, Building, Briefcase, Mail, Phone,
  User, Check, Clock
} from 'lucide-react';

export default function RegistrationsPage() {
  const [openEvents, setOpenEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEvent, setModalEvent] = useState(null);
  const [regSuccess, setRegSuccess] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [lookupMsg, setLookupMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const initialFormState = {
    full_name: '',
    faculty_code: '',
    email: '',
    phone: '',
    department: 'CSE',
    designation: 'Assistant Professor',
    institution_name: "Vignan's University",
    years_of_experience: 3,
    teaching_interests: '',
    research_interests: '',
    consent: false,
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadOpenEvents();
  }, []);

  const loadOpenEvents = async () => {
    setLoading(true);
    try {
      const all = await api.getEvents();
      const available = all.filter((e) =>
        ['REGISTRATION_OPEN', 'APPROVED', 'ONGOING'].includes(e.status)
      );
      setOpenEvents(available);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegisterModal = (event) => {
    setError('');
    setLookupMsg('');
    setRegSuccess(null);
    setQrDataUrl('');
    setFormData({
      ...initialFormState,
      department: event.department_name || 'CSE',
    });
    setModalEvent(event);
  };

  const handleCloseModal = () => {
    setModalEvent(null);
    setRegSuccess(null);
    setQrDataUrl('');
    setError('');
    setLookupMsg('');
    loadOpenEvents();
  };

  // Optional Faculty Lookup
  const handleFacultyLookup = async () => {
    const query = (formData.faculty_code || formData.email || '').trim();
    if (!query) return;

    try {
      const result = await api.lookupFaculty(query);
      if (result && result.found) {
        setFormData((prev) => ({
          ...prev,
          full_name: result.full_name || prev.full_name,
          faculty_code: result.faculty_code || prev.faculty_code,
          email: result.email || prev.email,
          phone: result.phone || prev.phone,
          department: result.department || prev.department,
          designation: result.designation || prev.designation,
          institution_name: result.institution_name || prev.institution_name,
          years_of_experience: result.years_of_experience || prev.years_of_experience,
          teaching_interests: result.teaching_interests || prev.teaching_interests,
          research_interests: result.research_interests || prev.research_interests,
        }));
        setLookupMsg(`Profile Recognized: ${result.full_name} (${result.department || 'CSE'})`);
      } else {
        setLookupMsg('No existing faculty profile found. Proceeding as new/external faculty.');
      }
    } catch {
      // Non-intrusive fallback
    }
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    if (!modalEvent) return;

    if (!formData.consent) {
      setError('Please accept the consent terms to proceed with registration.');
      return;
    }

    if (!formData.full_name.trim() || !formData.email.trim()) {
      setError('Full Name and Email are mandatory.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        faculty_code: formData.faculty_code.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        institution_name: formData.institution_name.trim(),
        years_of_experience: parseFloat(formData.years_of_experience) || 0,
        teaching_interests: formData.teaching_interests.trim(),
        research_interests: formData.research_interests.trim(),
        consent: true,
      };

      const res = await api.registerForEvent(modalEvent.id, payload);

      // Generate Crisp QR Code
      const qrTarget = res.qr_token || res.registration_code;
      const url = await QRCode.toDataURL(qrTarget, {
        width: 256,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrDataUrl(url);
      setRegSuccess(res);
      loadOpenEvents();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !regSuccess) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `Attendance_QR_${regSuccess.registration_code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <UserCheck2 size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Programme Registration Portal</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Browse accredited Faculty Development Programmes currently open for registration. Secure participant enrolment with automated QR verification passes.
        </p>
      </div>

      {/* Programme Cards Grid */}
      <div className="grid-2">
        {loading ? (
          <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading available programmes...</div>
        ) : openEvents.length === 0 ? (
          <div className="card" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No programmes are currently open for registration.</p>
          </div>
        ) : (
          openEvents.map((ev) => {
            const isFull = (ev.registered_count || 0) >= ev.capacity;
            const isClosed = ev.status === 'COMPLETED' || ev.status === 'CANCELLED';

            return (
              <div
                key={ev.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <StatusBadge status={ev.status} />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: isFull ? 'var(--status-danger)' : 'var(--text-muted)',
                      }}
                    >
                      Seats: {ev.registered_count || 0} / {ev.capacity}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.375rem' }}>{ev.title}</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    Dept: {ev.department_name} &bull; Mode: {ev.delivery_mode} &bull; Duration: {ev.duration_hours} hrs
                  </p>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {ev.description || 'Intensive pedagogical and research development workshop for engineering faculty.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link to={`/app/events/${ev.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                    View Syllabus
                  </Link>

                  {isFull ? (
                    <button className="btn btn-secondary btn-sm" disabled style={{ fontSize: '0.75rem', cursor: 'not-allowed', opacity: 0.6 }}>
                      Registration Full
                    </button>
                  ) : isClosed ? (
                    <button className="btn btn-secondary btn-sm" disabled style={{ fontSize: '0.75rem', cursor: 'not-allowed', opacity: 0.6 }}>
                      Registration Closed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenRegisterModal(ev)}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <span>Register Now</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Registration Modal / Success Screen */}
      {modalEvent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--brand-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Faculty Enrolment
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {regSuccess ? 'Registration Confirmed' : modalEvent.title}
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Programme Code: {modalEvent.event_code} &bull; Dept: {modalEvent.department_name}
                </span>
              </div>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span style={{ fontSize: '0.875rem' }}>{error}</span>
              </div>
            )}

            {/* CASE 1: SUCCESS SCREEN */}
            {regSuccess ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.375rem', fontWeight: 800 }}>Registration Successful</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Your attendance pass has been generated and cryptographically registered.
                  </p>
                </div>

                {/* Details Summary Box */}
                <div
                  style={{
                    width: '100%',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    padding: '1.25rem',
                    textAlign: 'left',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      PARTICIPANT
                    </span>
                    <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{regSuccess.participant_name}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {regSuccess.faculty_code || 'External Faculty'} &bull; {regSuccess.department}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      REGISTRATION ID
                    </span>
                    <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--brand-accent)', fontFamily: 'var(--font-mono)' }}>
                      {regSuccess.registration_code}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                      Status: {regSuccess.registration_status}
                    </span>
                  </div>

                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      PROGRAMME
                    </span>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{modalEvent.title}</p>
                  </div>
                </div>

                {/* QR Code Pass */}
                {qrDataUrl && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: '#ffffff',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <img src={qrDataUrl} alt="Attendance QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
                    <span style={{ color: '#0f172a', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                      {regSuccess.registration_code}
                    </span>
                  </div>
                )}

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  "Present this QR code during attendance verification."
                </p>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={handleDownloadQR} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Download size={15} />
                    <span>Download / Save QR</span>
                  </button>
                  <Link to={`/app/events/${modalEvent.id}`} className="btn btn-secondary btn-sm">
                    View Programme
                  </Link>
                  <button onClick={handleCloseModal} className="btn btn-outline btn-sm">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* CASE 2: REGISTRATION FORM */
              <form onSubmit={handleSubmitRegistration} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                {lookupMsg && (
                  <div className="alert alert-info" style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} />
                    <span>{lookupMsg}</span>
                  </div>
                )}

                {/* Name & Faculty Code */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Full Name <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Dr. Veda"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Faculty Code / Employee ID
                    </label>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. FA-V2"
                        value={formData.faculty_code}
                        onChange={(e) => setFormData({ ...formData, faculty_code: e.target.value })}
                        onBlur={handleFacultyLookup}
                      />
                      <button
                        type="button"
                        onClick={handleFacultyLookup}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0 0.6rem' }}
                        title="Auto-fill profile if existing"
                      >
                        Lookup
                      </button>
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Email Address <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="veda@gmail.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onBlur={handleFacultyLookup}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Department & Designation */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Department <span style={{ color: '#f87171' }}>*</span>
                    </label>
                    <select
                      className="form-select"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="CSE">Computer Science & Engineering (CSE)</option>
                      <option value="IT">Information Technology (IT)</option>
                      <option value="ECE">Electronics & Communication (ECE)</option>
                      <option value="MECH">Mechanical Engineering (MECH)</option>
                      <option value="CIVIL">Civil Engineering (CIVIL)</option>
                      <option value="OTHER">Other / Multidisciplinary</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Designation
                    </label>
                    <select
                      className="form-select"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    >
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Professor">Professor</option>
                      <option value="Research Scholar">Research Scholar</option>
                      <option value="Adjunct Faculty">Adjunct Faculty</option>
                    </select>
                  </div>
                </div>

                {/* Institution & Experience */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Institution / College Name
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.institution_name}
                      onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      className="form-input"
                      value={formData.years_of_experience}
                      onChange={(e) => setFormData({ ...formData, years_of_experience: e.target.value })}
                    />
                  </div>
                </div>

                {/* Teaching & Research Interests */}
                <div className="grid-2">
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Teaching Interests
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. AI, Algorithms, Data Science"
                      value={formData.teaching_interests}
                      onChange={(e) => setFormData({ ...formData, teaching_interests: e.target.value })}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Research Interests
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Deep Learning, Generative Models"
                      value={formData.research_interests}
                      onChange={(e) => setFormData({ ...formData, research_interests: e.target.value })}
                    />
                  </div>
                </div>

                {/* Consent Checkbox */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.625rem',
                    background: 'var(--bg-primary)',
                    padding: '0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <input
                    type="checkbox"
                    id="regConsent"
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    style={{ marginTop: '0.2rem', cursor: 'pointer' }}
                  />
                  <label htmlFor="regConsent" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', cursor: 'pointer', lineHeight: 1.4 }}>
                    I confirm that the details provided are accurate and consent to attend all scheduled sessions in accordance with university FDP guidelines.
                  </label>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={handleCloseModal} className="btn btn-secondary btn-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.consent}
                    className="btn btn-primary btn-sm"
                    style={{ minWidth: '160px' }}
                  >
                    {submitting ? 'Registering...' : 'Submit Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
