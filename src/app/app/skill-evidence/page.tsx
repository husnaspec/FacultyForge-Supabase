'use client';

import React, { Suspense } from 'react';
import SkillEvidencePage from '@/views/SkillEvidencePage';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <SkillEvidencePage />
    </Suspense>
  );
}
