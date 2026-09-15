'use client';

import React, { Suspense } from 'react';
import FeedbackIntelligencePage from '@/views/FeedbackIntelligencePage';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <FeedbackIntelligencePage />
    </Suspense>
  );
}
