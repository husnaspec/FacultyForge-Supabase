'use client';
import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  if (!status) return null;

  const s = String(status).toUpperCase();

  let badgeClass = 'badge-draft';
  let label = s;

  if (s === 'DRAFT') {
    badgeClass = 'badge-draft';
    label = 'Draft';
  } else if (s === 'PENDING' || s === 'PENDING_APPROVAL') {
    badgeClass = 'badge-pending';
    label = 'Pending Approval';
  } else if (s === 'APPROVED') {
    badgeClass = 'badge-approved';
    label = 'Approved';
  } else if (s === 'REGISTRATION_OPEN' || s === 'OPEN') {
    badgeClass = 'badge-open';
    label = 'Registration Open';
  } else if (s === 'ONGOING') {
    badgeClass = 'badge-ongoing';
    label = 'Ongoing';
  } else if (s === 'COMPLETED') {
    badgeClass = 'badge-completed';
    label = 'Completed';
  } else if (s === 'REJECTED' || s === 'CANCELLED') {
    badgeClass = 'badge-rejected';
    label = 'Rejected';
  } else if (s === 'CHANGES_REQUESTED') {
    badgeClass = 'badge-pending';
    label = 'Changes Requested';
  } else if (s === 'HIGH' || s === 'CRITICAL') {
    badgeClass = 'badge-high';
    label = 'High Priority';
  } else if (s === 'MEDIUM') {
    badgeClass = 'badge-medium';
    label = 'Medium Priority';
  } else if (s === 'LOW') {
    badgeClass = 'badge-low';
    label = 'Low Priority';
  } else if (s === 'COMPLIANT') {
    badgeClass = 'badge-compliant';
    label = 'Compliant';
  } else if (s === 'ATTENTION_REQUIRED' || s === 'ATTENTION REQUIRED') {
    badgeClass = 'badge-attention';
    label = 'Attention Required';
  } else if (s === 'NON_COMPLIANT' || s === 'NON-COMPLIANT') {
    badgeClass = 'badge-rejected';
    label = 'Non-Compliant';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {label}
    </span>
  );
}
