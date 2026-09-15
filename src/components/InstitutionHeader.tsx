'use client';
import React from 'react';

export default function InstitutionHeader() {
  return (
    <div className="institution-header">
      {/* LEFT TOPMOST CORNER: Official Vignan's University Logo */}
      <div className="inst-left">
        <img
          src="/vignan-university-logo.png"
          alt="VIGNAN'S Foundation for Science, Technology & Research (Deemed to be University)"
          className="vignan-logo-img"
          style={{
            height: '48px',
            width: 'auto',
            maxWidth: '340px',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {/* RIGHT: Row of 7 Official Accreditation Circular Badges (Exact to Reference) */}
      <div className="inst-right">
        {/* 1. NAAC A+ */}
        <div title="NAAC Grade A+ Accredited" className="circle-badge-wrapper">
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M7 25 C5 15 11 6 22 5" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <text x="18" y="14" fontFamily="'Inter', sans-serif" fontSize="5.5" fontWeight="900" fill="#172033" textAnchor="middle">NAAC</text>
            <text x="18" y="24" fontFamily="'Arial Black', sans-serif" fontSize="10" fontWeight="900" fill="#dc2626" textAnchor="middle">A+</text>
          </svg>
        </div>

        {/* 2. NIRF */}
        <div title="NIRF Ranked" className="circle-badge-wrapper">
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="#ffffff" stroke="#4338ca" strokeWidth="1.8" />
            <text x="18" y="16" fontFamily="'Inter', sans-serif" fontSize="7.5" fontWeight="900" fill="#4338ca" textAnchor="middle">nirf</text>
            <text x="18" y="24" fontFamily="'Inter', sans-serif" fontSize="4" fontWeight="800" fill="#64748b" textAnchor="middle">RANKED</text>
          </svg>
        </div>

        {/* 3. NBA */}
        <div title="NBA Accredited" className="circle-badge-wrapper">
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="#ffffff" stroke="#f59e0b" strokeWidth="1.8" />
            <text x="18" y="17" fontFamily="'Inter', sans-serif" fontSize="7.5" fontWeight="900" fill="#d97706" textAnchor="middle">NBA</text>
            <text x="18" y="24" fontFamily="'Inter', sans-serif" fontSize="3.8" fontWeight="800" fill="#b45309" textAnchor="middle">ACCREDITED</text>
          </svg>
        </div>

        {/* 4. AICTE */}
        <div title="AICTE Approved" className="circle-badge-wrapper">
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="#ffffff" stroke="#d97706" strokeWidth="1.6" />
            <circle cx="18" cy="18" r="11" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.8" />
            <circle cx="18" cy="18" r="3.5" fill="#b45309" />
            <text x="18" y="27" fontFamily="'Inter', sans-serif" fontSize="3.8" fontWeight="800" fill="#78350f" textAnchor="middle">AICTE</text>
          </svg>
        </div>

        {/* 5. UGC */}
        <div title="UGC Deemed" className="circle-badge-wrapper">
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="#ffffff" stroke="#0284c7" strokeWidth="1.8" />
            <text x="18" y="16" fontFamily="'Inter', sans-serif" fontSize="7" fontWeight="900" fill="#0284c7" textAnchor="middle">UGC</text>
            <text x="18" y="24" fontFamily="'Inter', sans-serif" fontSize="4.8" fontWeight="800" fill="#0369a1" textAnchor="middle">DEEMED</text>
          </svg>
        </div>

        {/* 6. ISO */}
        <div title="ISO 9001:2015 Certified" className="circle-badge-wrapper">
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="#ffffff" stroke="#7c3aed" strokeWidth="1.8" />
            <text x="18" y="16" fontFamily="'Inter', sans-serif" fontSize="6.5" fontWeight="900" fill="#7c3aed" textAnchor="middle">ISO</text>
            <text x="18" y="24" fontFamily="'Inter', sans-serif" fontSize="4" fontWeight="800" fill="#6d28d9" textAnchor="middle">9001:2015</text>
          </svg>
        </div>

        {/* 7. ABET */}
        <div title="ABET Accredited" className="circle-badge-wrapper">
          <svg width="34" height="34" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2.5" />
            <text x="18" y="21.5" fontFamily="'Arial Black', sans-serif" fontSize="7.5" fontWeight="900" fill="#c2410c" textAnchor="middle" letterSpacing="0.04em">ABET</text>
          </svg>
        </div>
      </div>
    </div>
  );
}
