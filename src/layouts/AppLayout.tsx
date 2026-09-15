'use client';
import React from 'react';
import { Outlet } from '@/lib/router-compat';
import InstitutionHeader from '@/components/InstitutionHeader';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function AppLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Sticky Combined Header: Institution Banner (56px) + Navbar Toolbar (50px) = 106px */}
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
          <Outlet />
        </main>
      </div>
    </div>
  );
}
