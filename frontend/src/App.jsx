import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import StrategyDashboard from './pages/StrategyDashboard';
import FacultyList from './pages/FacultyList';
import FacultyProfile from './pages/FacultyProfile';
import FacultyDigitalPassport from './pages/FacultyDigitalPassport';
import DepartmentsList from './pages/DepartmentsList';
import FDPList from './pages/FDPList';
import FDPCreate from './pages/FDPCreate';
import FDPDetail from './pages/FDPDetail';
import AIFDPGenerator from './pages/AIFDPGenerator';
import ProposalsPage from './pages/ProposalsPage';
import RegistrationsPage from './pages/RegistrationsPage';
import AttendancePage from './pages/AttendancePage';
import AssessmentsPage from './pages/AssessmentsPage';
import FeedbackIntelligencePage from './pages/FeedbackIntelligencePage';
import CertificatesPage from './pages/CertificatesPage';
import CertificateVerificationPage from './pages/CertificateVerificationPage';
import AIIntelligenceHub from './pages/AIIntelligenceHub';
import CompliancePage from './pages/CompliancePage';
import ResourcePersonsList from './pages/ResourcePersonsList';
import EventReportPage from './pages/EventReportPage';
import SettingsPage from './pages/SettingsPage';

// New Feature Pages
import PeerMentorMatchingPage from './pages/PeerMentorMatchingPage';
import SkillEvidencePage from './pages/SkillEvidencePage';
import TeachingImpactPage from './pages/TeachingImpactPage';
import FDPEffectivenessPage from './pages/FDPEffectivenessPage';
import CareerGrowthPage from './pages/CareerGrowthPage';
import DepartmentSkillHeatmapPage from './pages/DepartmentSkillHeatmapPage';
import WhatIfSimulatorPage from './pages/WhatIfSimulatorPage';
import TrainingEquityPage from './pages/TrainingEquityPage';
import KnowledgeSharingPage from './pages/KnowledgeSharingPage';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const [showSplash, setShowSplash] = React.useState(() => {
    return !sessionStorage.getItem('agent27_splash_seen');
  });

  React.useEffect(() => {
    const handleReplay = () => setShowSplash(true);
    window.addEventListener('replay-agent27-splash', handleReplay);
    return () => window.removeEventListener('replay-agent27-splash', handleReplay);
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('agent27_splash_seen', 'true');
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify-certificate/:token" element={<CertificateVerificationPage />} />

        {/* Authenticated / App Layout Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="strategy" element={<StrategyDashboard />} />
          <Route path="faculty" element={<FacultyList />} />
          <Route path="faculty/:id" element={<FacultyProfile />} />
          <Route path="faculty/:id/passport" element={<FacultyDigitalPassport />} />
          <Route path="departments" element={<DepartmentsList />} />
          <Route path="events" element={<FDPList />} />
          <Route path="events/create" element={<FDPCreate />} />
          <Route path="events/:id" element={<FDPDetail />} />
          <Route path="ai-generator" element={<AIFDPGenerator />} />
          <Route path="proposals" element={<ProposalsPage />} />
          <Route path="registrations" element={<RegistrationsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="assessments" element={<AssessmentsPage />} />
          <Route path="feedback-intelligence" element={<FeedbackIntelligencePage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="ai-hub" element={<AIIntelligenceHub />} />
          <Route path="compliance" element={<CompliancePage />} />
          <Route path="resource-persons" element={<ResourcePersonsList />} />
          <Route path="reports" element={<FDPList />} />
          <Route path="reports/:id" element={<EventReportPage />} />
          <Route path="events/:id/report" element={<EventReportPage />} />
          <Route path="settings" element={<SettingsPage />} />

          {/* New Feature Routes */}
          <Route path="peer-mentors" element={<PeerMentorMatchingPage />} />
          <Route path="skill-evidence" element={<SkillEvidencePage />} />
          <Route path="teaching-impact" element={<TeachingImpactPage />} />
          <Route path="fdp-effectiveness" element={<FDPEffectivenessPage />} />
          <Route path="career-path" element={<CareerGrowthPage />} />
          <Route path="skill-heatmap" element={<DepartmentSkillHeatmapPage />} />
          <Route path="what-if-simulator" element={<WhatIfSimulatorPage />} />
          <Route path="training-equity" element={<TrainingEquityPage />} />
          <Route path="knowledge-sharing" element={<KnowledgeSharingPage />} />

          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
