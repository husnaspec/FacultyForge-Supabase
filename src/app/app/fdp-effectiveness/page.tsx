'use client';

import React, { Suspense } from 'react';
import FDPEffectivenessPage from '@/views/FDPEffectivenessPage';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <FDPEffectivenessPage />
    </Suspense>
  );
}
