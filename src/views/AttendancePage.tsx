'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from '@/lib/router-compat';
import { Html5Qrcode } from 'html5-qrcode';
import { api, asArray } from '@/services/api';
import {
  ClipboardList, QrCode, CheckCircle2, AlertCircle,
  Camera, CameraOff, Upload, ArrowRight, Clock, ShieldCheck,
  RefreshCw, UserCheck, Check, X
} from 'lucide-react';

export default function AttendancePage() {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('event_id');

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || '');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('MANUAL'); // 'MANUAL' or 'QR'
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // QR Scanner States
  const [isScanning, setIsScanning] = useState(false);
  const [qrVerifiedResult, setQrVerifiedResult] = useState(null);
  const [manualTokenInput, setManualTokenInput] = useState('');
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEventSessions(selectedEventId);
      loadAttendance(selectedEventId, selectedSessionId);
    }
  }, [selectedEventId, selectedSessionId]);

  // Clean up scanner on unmount or tab switch
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  useEffect(() => {
    if (method !== 'QR') {
      stopScanner();
    }
  }, [method]);

  const loadEvents = async () => {
    try {
      const list = await api.getEvents();
      const eventList = asArray(list, 'events');
      setEvents(eventList);
      if (eventList.length > 0) {
        if (!selectedEventId || !eventList.some((e) => String(e.id) === String(selectedEventId))) {
          setSelectedEventId(String(eventList[0].id));
        }
      }
    } catch (err) {
      console.error('Failed to load events:', err);
      setErrorMsg(err.message || 'Failed to load programmes');
    }
  };

  const loadEventSessions = async (eId) => {
    try {
      const ev = await api.getEvent(eId);
      if (ev && ev.sessions && ev.sessions.length > 0) {
        setSessions(ev.sessions);
        setSelectedSessionId(ev.sessions[0].id);
      } else {
        // Default standard session options for events without custom sessions
        setSessions([
          { id: 101, title: 'Day 1 Morning (09:30 AM - 12:30 PM)' },
          { id: 102, title: 'Day 1 Afternoon (01:30 PM - 04:30 PM)' },
          { id: 103, title: 'Day 2 Morning (09:30 AM - 12:30 PM)' },
          { id: 104, title: 'Day 2 Afternoon (01:30 PM - 04:30 PM)' },
        ]);
        setSelectedSessionId(101);
      }
    } catch {
      setSessions([
        { id: 101, title: 'Day 1 Morning' },
        { id: 102, title: 'Day 1 Afternoon' },
      ]);
      setSelectedSessionId(101);
    }
  };

  const loadAttendance = async (eId, sessId) => {
    if (!eId) return;
    setLoading(true);
    try {
      const [att, regs] = await Promise.all([
        api.getEventAttendance(eId, sessId || undefined),
        api.getEventRegistrations(eId),
      ]);
      setAttendanceData(att && typeof att === 'object' ? att : null);
      setRegistrations(asArray(regs, 'registrations'));
    } catch (err) {
      console.error('Failed to load attendance:', err);
      setErrorMsg(err.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  // Manual Attendance Action
  const handleMarkAttendance = async (reg, status) => {
    setStatusMsg('');
    setErrorMsg('');
    try {
      const payload = {
        event_id: parseInt(selectedEventId, 10),
        registration_id: reg.id,
        faculty_id: reg.faculty_id,
        session_id: selectedSessionId ? parseInt(selectedSessionId, 10) : undefined,
        attendance_status: status,
      };
      await api.manualAttendance(payload);
      setStatusMsg(`Recorded ${status} for ${reg.participant_name || reg.faculty_name}.`);
      loadAttendance(selectedEventId, selectedSessionId);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to record manual attendance');
    }
  };

  // Start Camera Scanner
  const startScanner = async () => {
    setErrorMsg('');
    setStatusMsg('');
    setQrVerifiedResult(null);

    try {
      if (html5QrCodeRef.current) {
        await stopScanner();
      }

      const html5QrCode = new Html5Qrcode('qr-reader-viewport');
      html5QrCodeRef.current = html5QrCode;

      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        async (decodedText) => {
          // Successful QR decode
          await handleProcessQrToken(decodedText);
        },
        () => {
          // Ignore transient frame scanning misses
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.warn('Camera initiation note:', err);
      setIsScanning(false);
      setErrorMsg('Could not access camera. Please allow camera permissions or use the QR token input below.');
    }
  };

  // Stop Camera Scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop note:', err);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  // QR Token Processing & Server Verification
  const handleProcessQrToken = async (rawToken) => {
    if (!rawToken || !rawToken.trim()) return;
    setErrorMsg('');
    setStatusMsg('');

    try {
      const payload = {
        event_id: parseInt(selectedEventId, 10),
        qr_token: rawToken.trim(),
        session_id: selectedSessionId ? parseInt(selectedSessionId, 10) : undefined,
      };

      const result = await api.qrCheckIn(payload);
      setQrVerifiedResult(result);
      setStatusMsg('Attendance Verified ✓');
      loadAttendance(selectedEventId, selectedSessionId);

      // Temporarily pause camera to show result
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await stopScanner();
      }
    } catch (err) {
      setErrorMsg(err.message || 'QR Verification failed.');
    }
  };

  // Handle QR Image File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('qr-reader-viewport');
      const decodedText = await html5QrCode.scanFile(file, true);
      await handleProcessQrToken(decodedText);
    } catch (err) {
      setErrorMsg('Could not detect a valid QR code in the uploaded image. Please try another image or use token input.');
    }
  };

  const selectedEvent = events.find((e) => e.id === parseInt(selectedEventId, 10));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <ClipboardList size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Attendance & Verification Management</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Session-wise attendance tracking supporting live participant QR scanning and coordinator manual marker verification.
        </p>
      </div>

      {/* Programme, Session & Mode Controls */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Programme Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Programme:</label>
            <select
              className="form-select"
              style={{ minWidth: '280px' }}
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setQrVerifiedResult(null);
                setErrorMsg('');
                setStatusMsg('');
              }}
            >
              {events.length === 0 && <option value="">No programmes available</option>}
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.event_code} - {e.title || e.programme_title}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switch Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>MODE:</span>
            <button
              onClick={() => {
                setMethod('MANUAL');
                setQrVerifiedResult(null);
              }}
              className={`btn btn-sm ${method === 'MANUAL' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Manual Marker
            </button>
            <button
              onClick={() => {
                setMethod('QR');
                setQrVerifiedResult(null);
              }}
              className={`btn btn-sm ${method === 'QR' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <QrCode size={14} />
              <span>QR Scanner Mode</span>
            </button>
          </div>
        </div>

        {/* Session Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Attendance Session:
          </label>
          <select
            className="form-select"
            style={{ minWidth: '260px', fontSize: '0.8125rem' }}
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              setQrVerifiedResult(null);
            }}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            (Check-ins will be logged against this session)
          </span>
        </div>
      </div>

      {/* Alerts */}
      {statusMsg && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Attendance Stats Bar */}
      <div className="grid-3">
        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
            REGISTERED COHORT
          </span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem' }}>{registrations.length}</p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Capacity: {selectedEvent?.capacity || 50} seats
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
            RECORDED CHECK-INS
          </span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--brand-accent)' }}>
            {attendanceData?.recorded_checkins || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Active Session verified
          </span>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em' }}>
            OVERALL ATTENDANCE RATE
          </span>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#34d399' }}>
            {attendanceData?.overall_attendance_percentage || 0}%
          </p>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Cohort participation metric
          </span>
        </div>
      </div>

      {/* VIEW A: QR SCANNER MODE */}
      {method === 'QR' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Digital QR Scanner Desk</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Point camera at participant's registration QR code to verify attendance in real-time.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!isScanning ? (
                <button onClick={startScanner} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Camera size={15} />
                  <span>Start Camera</span>
                </button>
              ) : (
                <button onClick={stopScanner} className="btn btn-danger btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CameraOff size={15} />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>
          </div>

          {/* VERIFIED CARD NOTIFICATION */}
          {qrVerifiedResult && (
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}>
                <CheckCircle2 size={24} />
                <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>Attendance Verified ✓</h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>PARTICIPANT</span>
                  <p style={{ fontWeight: 800, fontSize: '1rem' }}>{qrVerifiedResult.participant_name}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dept: {qrVerifiedResult.department}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>PROGRAMME</span>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{qrVerifiedResult.event_title}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>TIME</span>
                  <p style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{qrVerifiedResult.check_in_time}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>STATUS</span>
                  <p style={{ fontWeight: 800, color: '#34d399' }}>{qrVerifiedResult.attendance_status}</p>
                </div>
              </div>

              <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setQrVerifiedResult(null);
                    startScanner();
                  }}
                  className="btn btn-success btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <RefreshCw size={14} />
                  <span>Scan Next Participant</span>
                </button>
              </div>
            </div>
          )}

          {/* Camera Viewport Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--border-subtle)',
              padding: '1.5rem',
              minHeight: '280px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div id="qr-reader-viewport" style={{ width: '100%', maxWidth: '380px' }} />

            {!isScanning && !qrVerifiedResult && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Camera size={40} style={{ opacity: 0.5 }} />
                <p style={{ fontSize: '0.875rem' }}>Camera preview is currently idle.</p>
                <button onClick={startScanner} className="btn btn-outline btn-sm">
                  Click to Activate Live Scanner
                </button>
              </div>
            )}
          </div>

          {/* Fallback Inputs: Upload QR Image or Direct Token input */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
            }}
          >
            {/* Image Upload Option */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <Upload size={16} style={{ color: 'var(--brand-accent)' }} />
                <span>Upload QR Image File:</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ fontSize: '0.75rem', width: '100%' }}
              />
            </div>

            {/* Direct Token Paste Option */}
            <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <QrCode size={16} style={{ color: 'var(--brand-accent)' }} />
                <span>Direct QR Token Check-in:</span>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontSize: '0.8125rem' }}
                  placeholder="e.g. REG-VU2026-0042:token..."
                  value={manualTokenInput}
                  onChange={(e) => setManualTokenInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleProcessQrToken(manualTokenInput);
                    setManualTokenInput('');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: MANUAL MARKER ROSTER */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Participant Roster & Verification Desk</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Registered participants eligible for attendance marking in selected programme.
            </span>
          </div>
          <button
            onClick={() => loadAttendance(selectedEventId, selectedSessionId)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={13} />
            <span>Refresh Roster</span>
          </button>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Registration ID</th>
                <th>Faculty Code</th>
                <th>Participant Name</th>
                <th>Department</th>
                <th>Current Status</th>
                <th>Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading participant cohort...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    No faculty registered for this programme yet. Use the Registration Portal to enroll participants.
                  </td>
                </tr>
              ) : (
                registrations.map((r) => {
                  const record = attendanceData?.records?.find(
                    (a) => a.registration_id === r.id || (r.faculty_id && a.faculty_id === r.faculty_id)
                  );
                  const status = record ? record.attendance_status : (r.attendance_status || 'PENDING');
                  const isPresent = status === 'PRESENT';
                  const isAbsent = status === 'ABSENT';

                  return (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-accent)' }}>
                        {r.registration_code || `REG-VU2026-${String(r.id).padStart(4, '0')}`}
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.faculty_code || 'External'}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.participant_name || r.faculty_name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {r.email}
                        </span>
                      </td>
                      <td>{r.department || r.department_name || 'CSE'}</td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: isPresent ? '#34d399' : isAbsent ? '#f87171' : 'var(--text-muted)',
                            background: isPresent ? 'rgba(16, 185, 129, 0.12)' : isAbsent ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                            padding: '0.25rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-block',
                          }}
                        >
                          {status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleMarkAttendance(r, 'PRESENT')}
                            className="btn btn-success btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.6875rem' }}
                          >
                            Mark Present
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(r, 'ABSENT')}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.25rem 0.6rem', fontSize: '0.6875rem' }}
                          >
                            Mark Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ATTENDANCE AUDIT & VERIFICATION HISTORY */}
      {attendanceData && attendanceData.records && attendanceData.records.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Session Verification History & Audit Log</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Cryptographically timestamped check-in records for current programme.
            </span>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Participant</th>
                  <th>Session</th>
                  <th>Attendance Method</th>
                  <th>Check-in Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.records.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{rec.participant_name}</div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {rec.faculty_code} &bull; {rec.department}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{rec.session_title}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-sm)',
                          background: rec.attendance_method === 'QR' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                          color: rec.attendance_method === 'QR' ? '#38bdf8' : '#c084fc',
                        }}
                      >
                        {rec.attendance_method}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {rec.check_in_time}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: rec.attendance_status === 'PRESENT' ? '#34d399' : '#f87171',
                        }}
                      >
                        {rec.attendance_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
