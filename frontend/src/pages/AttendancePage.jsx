import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { ClipboardList, QrCode, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react';

export default function AttendancePage() {
  const [searchParams] = useSearchParams();
  const initialEventId = searchParams.get('event_id');

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || '');
  const [attendanceData, setAttendanceData] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('MANUAL'); // 'MANUAL' or 'QR'
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadAttendance(selectedEventId);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const list = await api.getEvents();
      setEvents(list);
      if (!selectedEventId && list.length > 0) {
        setSelectedEventId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAttendance = async (eId) => {
    setLoading(true);
    try {
      const [att, regs] = await Promise.all([
        api.getEventAttendance(eId),
        api.getEventRegistrations(eId),
      ]);
      setAttendanceData(att);
      setRegistrations(regs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (facultyId, status) => {
    setStatusMsg('');
    try {
      await api.recordAttendance(selectedEventId, {
        faculty_id: facultyId,
        attendance_status: status,
        attendance_method: method,
      });
      setStatusMsg(`Recorded attendance (${status}) for participant.`);
      loadAttendance(selectedEventId);
    } catch (err) {
      alert(err.message || 'Failed to record attendance');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <ClipboardList size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Attendance & Verification Management</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Session-wise attendance auditing with manual marking and digital QR verification architecture.
        </p>
      </div>

      {/* Event Selector & Mode Toggle */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Programme:</label>
          <select
            className="form-select"
            style={{ minWidth: '280px' }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.event_code} - {e.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>MODE:</span>
          <button
            onClick={() => setMethod('MANUAL')}
            className={`btn btn-sm ${method === 'MANUAL' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Manual Marker
          </button>
          <button
            onClick={() => setMethod('QR')}
            className={`btn btn-sm ${method === 'QR' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <QrCode size={14} />
            <span>QR Scanner Mode</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="alert alert-success">
          <CheckCircle2 size={16} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Attendance Stats Bar */}
      {attendanceData && (
        <div className="grid-3">
          <div className="card" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REGISTERED COHORT</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{registrations.length}</p>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RECORDED CHECK-INS</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{attendanceData.records?.length || 0}</p>
          </div>
          <div className="card" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OVERALL ATTENDANCE RATE</span>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>
              {attendanceData.overall_attendance_percentage}%
            </p>
          </div>
        </div>
      )}

      {/* Registered Faculty Roster for Attendance */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '1rem' }}>Participant Roster</h3>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Faculty Code</th>
                <th>Participant Name</th>
                <th>Department</th>
                <th>Current Status</th>
                <th>Verification Action</th>
              </tr>
            </thead>
            <tbody>
              {registrations.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No faculty registered for this programme yet. Register faculty to mark attendance.
                  </td>
                </tr>
              ) : (
                registrations.map((r) => {
                  const record = attendanceData?.records?.find((a) => a.faculty_id === r.faculty_id);
                  const isPresent = record?.attendance_status === 'PRESENT';
                  return (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.faculty_code}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.faculty_name}</td>
                      <td>{r.department_name || 'CSE'}</td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            color: isPresent ? '#34d399' : '#f87171',
                            background: isPresent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            padding: '0.2rem 0.5rem',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          {record ? record.attendance_status : 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleMarkAttendance(r.faculty_id, 'PRESENT')}
                            className="btn btn-success btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}
                          >
                            Mark Present
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(r.faculty_id, 'ABSENT')}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}
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
    </div>
  );
}
