'use client';
import React from 'react';
import { NavLink } from '@/lib/router-compat';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  Sparkles,
  FileCheck2,
  UserCheck2,
  ClipboardList,
  GraduationCap,
  MessageSquareCode,
  Award,
  Cpu,
  ShieldAlert,
  FileText,
  BarChart3,
  Settings,
  Compass,
  FileSpreadsheet,
  Target,
  Zap,
  TrendingUp,
  Scale,
  Share2,
  SlidersHorizontal,
  CheckCircle2,
  Layers,
  HeartHandshake,
} from 'lucide-react';

export default function Sidebar() {
  const { currentRole, activeFacultyId } = useAuth();

  // Role-specific navigation presets per UX design specifications
  const getNavSections = () => {
    if (currentRole === 'FACULTY') {
      return [
        {
          title: 'FACULTY WORKSPACE',
          items: [
            { to: '/app', label: 'Faculty Dashboard', icon: LayoutDashboard, end: true },
            { to: `/app/faculty/${activeFacultyId}/passport`, label: 'Growth Passport', icon: Award, highlight: true },
            { to: `/app/faculty/${activeFacultyId}`, label: 'Skill Gaps & Profile', icon: Target },
            { to: '/app/career-path', label: 'Career Growth Path', icon: TrendingUp },
            { to: '/app/peer-mentors', label: 'Peer Mentors', icon: HeartHandshake },
            { to: '/app/skill-evidence', label: 'Skill Evidence', icon: CheckCircle2 },
            { to: '/app/teaching-impact', label: 'Teaching Impact', icon: Zap },
            { to: '/app/events', label: 'Recommended & All FDPs', icon: Calendar },
            { to: '/app/registrations', label: 'My Registrations', icon: UserCheck2 },
            { to: '/app/assessments', label: 'Assessments & Tests', icon: GraduationCap },
            { to: '/app/certificates', label: 'My Certificates', icon: Award },
          ],
        },
        {
          title: 'INTELLIGENCE ACCESS',
          items: [
            { to: '/app/ai-hub', label: 'AI Diagnostic Hub', icon: Cpu },
            { to: '/app/knowledge-sharing', label: 'Knowledge Sharing', icon: Share2 },
            { to: '/app/compliance', label: 'My CPD Compliance', icon: ShieldAlert },
          ],
        },
      ];
    }

    if (currentRole === 'HOD') {
      return [
        {
          title: 'INSTITUTIONAL GOVERNANCE',
          items: [
            { to: '/app/strategy', label: 'Strategy Dashboard', icon: BarChart3, highlight: true },
            { to: '/app/skill-heatmap', label: 'Department Skill Heatmap', icon: Layers },
            { to: '/app/fdp-effectiveness', label: 'FDP Effectiveness', icon: CheckCircle2 },
            { to: '/app/training-equity', label: 'Participation Equity', icon: Scale },
            { to: '/app', label: 'Operational Overview', icon: LayoutDashboard, end: true },
            { to: '/app/faculty', label: 'Department Faculty', icon: Users },
            { to: '/app/departments', label: 'Departments & Gaps', icon: Building2 },
          ],
        },
        {
          title: 'STRATEGIC PLANNING',
          items: [
            { to: '/app/ai-hub', label: 'Skill Intelligence', icon: Cpu, badge: 'Agent 27' },
            { to: '/app/peer-mentors', label: 'Peer Mentor Matching', icon: HeartHandshake },
            { to: '/app/what-if-simulator', label: 'What-if Simulator', icon: SlidersHorizontal },
            { to: '/app/knowledge-sharing', label: 'Knowledge Sharing', icon: Share2 },
            { to: '/app/proposals', label: 'FDP Approvals', icon: FileCheck2 },
            { to: '/app/compliance', label: 'Accreditation & Audit', icon: ShieldAlert },
            { to: '/app/reports', label: 'Institutional Reports', icon: FileText },
          ],
        },
      ];
    }

    // Default: ADMIN / FDP COORDINATOR
    return [
      {
        title: 'OVERVIEW & STRATEGY',
        items: [
          { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
          { to: '/app/strategy', label: 'Strategy Dashboard', icon: BarChart3 },
          { to: '/app/skill-heatmap', label: 'Department Skill Heatmap', icon: Layers },
          { to: '/app/fdp-effectiveness', label: 'FDP Effectiveness', icon: CheckCircle2 },
          { to: '/app/training-equity', label: 'Participation Equity', icon: Scale },
        ],
      },
      {
        title: 'FACULTY DEVELOPMENT & FDP',
        items: [
          { to: '/app/events', label: 'All Programmes', icon: Calendar },
          { to: '/app/ai-generator', label: 'AI FDP Generator', icon: Sparkles, highlight: true },
          { to: '/app/events/create', label: 'Create FDP Manually', icon: FileSpreadsheet },
          { to: '/app/proposals', label: 'Proposals & Approvals', icon: FileCheck2 },
          { to: '/app/registrations', label: 'Registrations', icon: UserCheck2 },
          { to: '/app/attendance', label: 'Attendance Desk', icon: ClipboardList },
          { to: '/app/teaching-impact', label: 'Teaching Impact', icon: Zap },
          { to: '/app/skill-evidence', label: 'Skill Evidence', icon: FileCheck2 },
        ],
      },
      {
        title: 'EXPERTS & MEASUREMENT',
        items: [
          { to: '/app/resource-persons', label: 'Resource Matcher', icon: Compass },
          { to: '/app/assessments', label: 'Assessments & Impact', icon: GraduationCap },
          { to: '/app/feedback-intelligence', label: 'Feedback Intelligence', icon: MessageSquareCode },
          { to: '/app/certificates', label: 'Certificates', icon: Award },
        ],
      },
      {
        title: 'AI INTELLIGENCE & AUDIT',
        items: [
          { to: '/app/faculty', label: 'Faculty Directory', icon: Users },
          { to: `/app/faculty/${activeFacultyId}/passport`, label: 'Digital Passport', icon: Award },
          { to: '/app/ai-hub', label: 'AI Multi-Agent Hub', icon: Cpu, badge: '15 Agents' },
          { to: '/app/peer-mentors', label: 'Peer Mentor Matching', icon: HeartHandshake },
          { to: '/app/career-path', label: 'Career Growth Path', icon: TrendingUp },
          { to: '/app/what-if-simulator', label: 'What-if Training Simulator', icon: SlidersHorizontal },
          { to: '/app/training-equity', label: 'Training Equity', icon: Scale },
          { to: '/app/knowledge-sharing', label: 'Knowledge Sharing', icon: Share2 },
          { to: '/app/compliance', label: 'Compliance Rules', icon: ShieldAlert },
          { to: '/app/reports', label: 'Event Reports', icon: FileText },
          { to: '/app/settings', label: 'Settings', icon: Settings },
        ],
      },
    ];
  };

  const navSections = getNavSections();

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        height: 'calc(100vh - 106px)',
        position: 'sticky',
        top: '106px',
        background: '#ffffff',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '1.25rem 0.75rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                letterSpacing: '0.08em',
                padding: '0 0.75rem',
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              {sec.title}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              {sec.items.map((item, itemIdx) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive
                        ? 'var(--brand-primary)'
                        : item.highlight
                        ? 'var(--brand-navy)'
                        : 'var(--text-secondary)',
                      background: isActive
                        ? 'var(--bg-light-blue)'
                        : item.highlight
                        ? '#f1f5f9'
                        : 'transparent',
                      borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
                      transition: 'var(--transition)',
                    })}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <Icon size={16} style={{ color: item.highlight ? 'var(--brand-primary)' : 'inherit' }} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--bg-light-blue)',
                          color: 'var(--brand-primary)',
                          border: '1px solid var(--bg-soft-blue)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
