import React, { useState, useEffect } from 'react';
import { api, asArray } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { FileCheck2, CheckCircle2, XCircle, RotateCcw, AlertCircle } from 'lucide-react';

export default function ProposalsPage() {
  const { isApprover } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [activeProposal, setActiveProposal] = useState(null);
  const [reviewAction, setReviewAction] = useState('APPROVE'); // 'APPROVE', 'REJECT', 'REQUEST_CHANGES'
  const [remarks, setRemarks] = useState('');
  const [approverName, setApproverName] = useState('Dr. Priya Iyer (HOD)');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const list = await api.getProposals();
      setProposals(asArray(list, 'proposals'));
    } catch (err) {
      console.error('Failed to load proposals:', err);
      setErrorMsg(err.message || 'Failed to load proposals from backend');
    } finally {
      setLoading(false);
    }
  };

  const openReview = (proposal, action) => {
    setActiveProposal(proposal);
    setReviewAction(action);
    setRemarks(
      action === 'APPROVE'
        ? 'Approved unanimously. Aligns with departmental training and NBA accreditation roadmap.'
        : ''
    );
    setErrorMsg('');
    setShowModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if ((reviewAction === 'REJECT' || reviewAction === 'REQUEST_CHANGES') && !remarks.trim()) {
      setErrorMsg('Remarks are required when rejecting or requesting changes.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        approver_name: approverName,
        approver_role: 'HOD',
        remarks,
      };

      if (reviewAction === 'APPROVE') {
        await api.approveProposal(activeProposal.id, payload);
      } else if (reviewAction === 'REJECT') {
        await api.rejectProposal(activeProposal.id, payload);
      } else {
        await api.requestChangesProposal(activeProposal.id, payload);
      }

      setShowModal(false);
      loadProposals();
    } catch (err) {
      setErrorMsg(err.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
          <FileCheck2 size={24} style={{ color: 'var(--brand-primary)' }} />
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>FDP Proposals & Approvals</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          HOD & IQAC approval workflow for institutional faculty development programmes.
        </p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Programme Title</th>
                <th>Submitted By</th>
                <th>Department</th>
                <th>Submitted At</th>
                <th>Status</th>
                <th>Approver Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading proposals from backend...
                  </td>
                </tr>
              ) : proposals.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    {errorMsg ? 'Could not load proposals.' : 'No proposals submitted yet.'}
                  </td>
                </tr>
              ) : (
                proposals.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.event_title || p.title || 'FDP Proposal'}</td>
                    <td>{p.submitted_by || 'Coordinator'}</td>
                    <td>{p.department_name || p.department || 'CSE'}</td>
                    <td>{p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <StatusBadge status={p.approval_status || p.status} />
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '250px' }}>
                      {p.remarks || (p.approval_status === 'APPROVED' ? 'Approved' : 'Pending Review')}
                    </td>
                    <td>
                      {p.approval_status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button
                            onClick={() => openReview(p, 'APPROVE')}
                            className="btn btn-success btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openReview(p, 'REQUEST_CHANGES')}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}
                          >
                            Changes
                          </button>
                          <button
                            onClick={() => openReview(p, 'REJECT')}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.6875rem' }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Review Proposal: ${activeProposal?.event_title}`}
      >
        <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Action:</span>
            <span
              style={{
                marginLeft: '0.5rem',
                fontWeight: 700,
                color: reviewAction === 'APPROVE' ? '#34d399' : reviewAction === 'REJECT' ? '#f87171' : '#fbbf24',
              }}
            >
              {reviewAction}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Approver Name & Role</label>
            <input
              type="text"
              className="form-input"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Review Remarks {reviewAction !== 'APPROVE' && <span style={{ color: '#f87171' }}>* (Required)</span>}
            </label>
            <textarea
              className="form-textarea"
              placeholder={reviewAction === 'APPROVE' ? 'Enter approval comments...' : 'Provide specific feedback and reason...'}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required={reviewAction !== 'APPROVE'}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`btn ${reviewAction === 'APPROVE' ? 'btn-success' : reviewAction === 'REJECT' ? 'btn-danger' : 'btn-primary'} btn-sm`}
            >
              {submitting ? 'Submitting...' : `Confirm ${reviewAction}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
