'use client';

import React, { Suspense } from 'react';
import FacultyList from '@/views/FacultyList';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <FacultyList />
    </Suspense>
  );
}
