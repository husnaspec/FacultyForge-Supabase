'use client';

import React, { Suspense } from 'react';
import FacultyDigitalPassport from '@/views/FacultyDigitalPassport';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <FacultyDigitalPassport />
    </Suspense>
  );
}
