'use client';

import React, { Suspense } from 'react';
import KnowledgeSharingPage from '@/views/KnowledgeSharingPage';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <KnowledgeSharingPage />
    </Suspense>
  );
}
