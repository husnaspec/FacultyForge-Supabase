'use client';

import React, { useState, useEffect, Suspense } from 'react';
import InstitutionHeader from '@/components/InstitutionHeader';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import SplashScreen from '@/components/SplashScreen';

function WorkspaceContent({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading FacultyForge Workspace...
      </div>
    }>
      {children}
    </Suspense>
  );
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = sessionStorage.getItem('agent27_splash_seen');
      if (!seen) {
        setShowSplash(true);
      }
    }

    const handleReplay = () => setShowSplash(true);
    window.addEventListener('replay-agent27-splash', handleReplay);
    return () => window.removeEventListener('replay-agent27-splash', handleReplay);
  }, []);

  const handleSplashComplete = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('agent27_splash_seen', 'true');
    }
    setShowSplash(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {/* Sticky Combined Header: Institution Banner + Navbar Toolbar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}>
        <InstitutionHeader />
        <Navbar />
      </div>

      {/* Main Workspace Layout with Sidebar and Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            padding: '1.75rem 2rem',
            maxWidth: '1440px',
            margin: '0 auto',
            width: 'calc(100% - 260px)',
            minHeight: 'calc(100vh - 106px)',
          }}
        >
          <WorkspaceContent>
            {children}
          </WorkspaceContent>
        </main>
      </div>
    </div>
  );
}
