'use client';

import React, { Suspense } from 'react';
import FDPDetail from '@/views/FDPDetail';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <FDPDetail />
    </Suspense>
  );
}
