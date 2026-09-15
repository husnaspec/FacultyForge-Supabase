'use client';

import React, { Suspense } from 'react';
import FacultyProfile from '@/views/FacultyProfile';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <FacultyProfile />
    </Suspense>
  );
}
