'use client';

import React, { Suspense } from 'react';
import CertificateVerificationPage from '@/views/CertificateVerificationPage';

export default function VerifyCertificate() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading Certificate Verification...</div>}>
      <CertificateVerificationPage />
    </Suspense>
  );
}
