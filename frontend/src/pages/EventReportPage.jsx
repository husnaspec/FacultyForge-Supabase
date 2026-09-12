import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { FileText, Printer, ArrowLeft, Award, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function EventReportPage() {
  const { id } = useParams();
  const eventId = parseInt(id);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [eventId]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await api.getEventReport(eventId);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !report) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--text-muted)' }}>
        <p>Compiling 17-Section Accreditation FDP Report Dossier...</p>
      </div>
    );
  }

  const {
    programme_overview,
    objectives,
    target_audience,
    schedule,
    resource_persons,
    participant_information,
    attendance_summary,
    pre_assessment,
    post_assessment,
    learning_gain,
    feedback_intelligence,
    programme_outcomes,
    certificates,
    budget,
    supporting_information,
    recommendations,
  } = report;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <Link to={`/app/events/${eventId}`} className="btn btn-outline btn-sm">
          <ArrowLeft size={14} />
          <span>Back to Programme</span>
        </Link>

        <button onClick={() => window.print()} className="btn btn-primary btn-sm">
          <Printer size={15} />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Formal Printable Report Paper */}
      <div
        className="card"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          padding: '3rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Dossier Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 800, letterSpacing: '0.1em', color: '#2563eb' }}>
            FACULTYFORGE AI &bull; INSTITUTIONAL QUALITY ASSURANCE CELL (IQAC)
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 900, marginTop: '0.5rem', color: '#0f172a' }}>
            FACULTY DEVELOPMENT PROGRAMME COMPLETION REPORT
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Tier-1 NBA / NAAC Outcome-Based Accreditation Assessment Dossier
          </p>
        </div>

        {/* Section 1: Overview */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.75rem', color: '#1e293b' }}>
            1. PROGRAMME OVERVIEW
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.875rem' }}>
            <p><strong>Programme Title:</strong> {programme_overview.title}</p>
            <p><strong>Event Code:</strong> {programme_overview.event_code}</p>
            <p><strong>Organizing Department:</strong> {programme_overview.department}</p>
            <p><strong>Faculty Coordinator:</strong> {programme_overview.coordinator}</p>
            <p><strong>Delivery Mode:</strong> {programme_overview.delivery_mode}</p>
            <p><strong>Total Duration:</strong> {programme_overview.duration_hours} Training Hours</p>
            <p><strong>Start Date:</strong> {programme_overview.start_date}</p>
            <p><strong>End Date:</strong> {programme_overview.end_date}</p>
          </div>
        </div>

        {/* Section 2 & 3: Objectives & Target Audience */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              2. PROGRAMME OBJECTIVES
            </h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#334155', lineHeight: 1.6 }}>
              {objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              3. TARGET AUDIENCE
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#334155' }}>{target_audience}</p>
          </div>
        </div>

        {/* Section 4 & 5: Schedule & Resource Persons */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.75rem', color: '#1e293b' }}>
            4. SCHEDULE & 5. RESOURCE PERSONS
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>Session</th>
                <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>Time</th>
                <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>Resource Person</th>
                <th style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>Deliverable / Objective</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((s, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1', fontWeight: 600 }}>{s.title}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>{s.time}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>{s.resource_person}</td>
                  <td style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>{s.objective}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 6 & 7: Participants & Attendance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              6. PARTICIPANT DEMOGRAPHICS
            </h3>
            <p style={{ fontSize: '0.875rem' }}>Total Enrolled: <strong>{participant_information.total_registered}</strong></p>
            <p style={{ fontSize: '0.875rem' }}>Internal Institutional Faculty: <strong>{participant_information.internal_participants}</strong></p>
            <p style={{ fontSize: '0.875rem' }}>External Nominated Faculty: <strong>{participant_information.external_participants}</strong></p>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              7. ATTENDANCE AUDIT
            </h3>
            <p style={{ fontSize: '0.875rem' }}>Overall Verified Attendance Rate: <strong>{attendance_summary.overall_attendance_rate}</strong></p>
            <p style={{ fontSize: '0.875rem' }}>Verified QR Check-ins: <strong>{attendance_summary.verified_qr_checkins}</strong></p>
            <p style={{ fontSize: '0.875rem' }}>Accreditation 75% Threshold Met: <strong>{attendance_summary.compliance_threshold_met ? 'YES (Satisfied)' : 'NO'}</strong></p>
          </div>
        </div>

        {/* Section 8, 9, 10: Pre/Post Assessment & Learning Gain */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.75rem', color: '#1e293b' }}>
            8. PRE-ASSESSMENT &bull; 9. POST-ASSESSMENT &bull; 10. MEASURABLE LEARNING GAIN
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>PRE-TEST SCORE</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb' }}>{pre_assessment.average_score}</p>
            </div>
            <div style={{ padding: '0.75rem', background: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>POST-TEST SCORE</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0284c7' }}>{post_assessment.average_score}</p>
            </div>
            <div style={{ padding: '0.75rem', background: '#ecfdf5', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>LEARNING GAIN (DELTA)</span>
              <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>{learning_gain.learning_gain_pp}</p>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: '#475569', fontStyle: 'italic' }}>
            {learning_gain.explanation}
          </p>
        </div>

        {/* Section 11: Feedback Intelligence */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.75rem', color: '#1e293b' }}>
            11. AI FEEDBACK INTELLIGENCE (AVERAGE: {feedback_intelligence.overall_rating} / 5.0)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.8125rem' }}>
            <div>
              <p><strong>Primary Strengths:</strong></p>
              <ul style={{ paddingLeft: '1.25rem', color: '#334155' }}>
                {feedback_intelligence.positive_themes?.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
            <div>
              <p><strong>Reported Bottlenecks:</strong></p>
              <ul style={{ paddingLeft: '1.25rem', color: '#334155' }}>
                {feedback_intelligence.negative_themes?.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Section 12 & 13: Outcomes & Certificates */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              12. PROGRAMME OUTCOMES
            </h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#334155' }}>
              {programme_outcomes.map((po, idx) => (
                <li key={idx}>{po}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
              13. DIGITAL CERTIFICATE ISSUANCE
            </h3>
            <p style={{ fontSize: '0.875rem' }}>Total Certificates Issued: <strong>{certificates.certificates_generated}</strong></p>
            <p style={{ fontSize: '0.875rem' }}>Cohort Eligibility Rate: <strong>{certificates.eligibility_rate}</strong></p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>All certificates cryptographically verifiable via FacultyForge AI verification tokens.</p>
          </div>
        </div>

        {/* Section 14 & 15: Budget & Financial Disclosure */}
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid #cbd5e1', paddingBottom: '0.25rem', marginBottom: '0.5rem', color: '#1e293b' }}>
            14. BUDGET & 15. ACTUAL EXPENDITURE STATEMENT
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
            <p>Estimated Budget: <strong>Rs. {budget.estimated_budget?.toLocaleString()}</strong></p>
            <p>Actual Expenditure: <strong>Rs. {budget.actual_expenditure?.toLocaleString()}</strong></p>
            <p>Favorable Variance: <strong>Rs. {budget.variance?.toLocaleString()}</strong></p>
          </div>
        </div>

        {/* Section 16 & 17: Supporting Information & Recommendations */}
        <div style={{ borderTop: '2px solid #0f172a', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>
            16. SUPPORTING INFORMATION & 17. STRATEGIC RECOMMENDATIONS
          </h3>
          <p style={{ fontSize: '0.8125rem', color: '#334155', marginBottom: '0.75rem' }}>
            {supporting_information}
          </p>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#334155', lineHeight: 1.6 }}>
            {recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', height: '40px' }} />
            <p style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem' }}>FDP Coordinator Signature</p>
          </div>
          <div style={{ textAlign: 'center', width: '200px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', height: '40px' }} />
            <p style={{ fontSize: '0.75rem', fontWeight: 700, marginTop: '0.25rem' }}>HOD / IQAC Chair Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}
