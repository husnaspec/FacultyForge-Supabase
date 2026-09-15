'use client';

import React, { Suspense } from 'react';
import StrategyDashboard from '@/views/StrategyDashboard';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <StrategyDashboard />
    </Suspense>
  );
}
