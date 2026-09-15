'use client';

import React, { Suspense } from 'react';
import DepartmentSkillHeatmapPage from '@/views/DepartmentSkillHeatmapPage';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <DepartmentSkillHeatmapPage />
    </Suspense>
  );
}
