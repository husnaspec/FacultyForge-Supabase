const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appDir = path.join(rootDir, 'src', 'app', 'app');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const pageMappings = [
  { route: '', view: 'Dashboard' },
  { route: 'strategy', view: 'StrategyDashboard' },
  { route: 'faculty', view: 'FacultyList' },
  { route: 'faculty/[id]', view: 'FacultyProfile' },
  { route: 'faculty/[id]/passport', view: 'FacultyDigitalPassport' },
  { route: 'departments', view: 'DepartmentsList' },
  { route: 'events', view: 'FDPList' },
  { route: 'events/create', view: 'FDPCreate' },
  { route: 'events/[id]', view: 'FDPDetail' },
  { route: 'events/[id]/report', view: 'EventReportPage' },
  { route: 'ai-generator', view: 'AIFDPGenerator' },
  { route: 'proposals', view: 'ProposalsPage' },
  { route: 'registrations', view: 'RegistrationsPage' },
  { route: 'attendance', view: 'AttendancePage' },
  { route: 'assessments', view: 'AssessmentsPage' },
  { route: 'feedback-intelligence', view: 'FeedbackIntelligencePage' },
  { route: 'certificates', view: 'CertificatesPage' },
  { route: 'ai-hub', view: 'AIIntelligenceHub' },
  { route: 'compliance', view: 'CompliancePage' },
  { route: 'resource-persons', view: 'ResourcePersonsList' },
  { route: 'reports', view: 'FDPList' },
  { route: 'reports/[id]', view: 'EventReportPage' },
  { route: 'settings', view: 'SettingsPage' },
  { route: 'peer-mentors', view: 'PeerMentorMatchingPage' },
  { route: 'skill-evidence', view: 'SkillEvidencePage' },
  { route: 'teaching-impact', view: 'TeachingImpactPage' },
  { route: 'fdp-effectiveness', view: 'FDPEffectivenessPage' },
  { route: 'career-path', view: 'CareerGrowthPage' },
  { route: 'skill-heatmap', view: 'DepartmentSkillHeatmapPage' },
  { route: 'what-if-simulator', view: 'WhatIfSimulatorPage' },
  { route: 'training-equity', view: 'TrainingEquityPage' },
  { route: 'knowledge-sharing', view: 'KnowledgeSharingPage' },
];

for (const mapping of pageMappings) {
  const targetDir = path.join(appDir, mapping.route);
  ensureDir(targetDir);
  const targetFile = path.join(targetDir, 'page.tsx');
  const code = `'use client';

import React, { Suspense } from 'react';
import ${mapping.view} from '@/views/${mapping.view}';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>}>
      <${mapping.view} />
    </Suspense>
  );
}
`;
  fs.writeFileSync(targetFile, code, 'utf8');
  console.log(`Generated route with Suspense: /app/${mapping.route}`);
}

console.log('All 32 routes updated with Suspense boundary.');
