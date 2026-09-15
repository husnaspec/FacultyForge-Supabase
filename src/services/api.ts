// Next.js Route Handlers Client Service for FacultyForge AI

const API_BASE = '/api/v1';

export function asArray<T = any>(res: any, ...fallbackKeys: string[]): T[] {
  if (Array.isArray(res)) return res;
  if (!res || typeof res !== 'object') return [];
  for (const key of fallbackKeys) {
    if (Array.isArray(res[key])) return res[key];
  }
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = text;
    }

    if (!res.ok) {
      const errorMsg =
        typeof data === 'string' && data.length > 0
          ? data
          : data?.detail || data?.message || data?.error || `API Request Failed (${res.status})`;
      console.error(`[API Error] ${options.method || 'GET'} ${url} (${res.status}):`, errorMsg);
      const apiErr: any = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      apiErr.status = res.status;
      apiErr.data = data;
      throw apiErr;
    }

    return data;
  } catch (err: any) {
    if (err.status) throw err;
    console.error(`API Error on ${endpoint}:`, err);
    throw new Error(err.message || 'API request failed');
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Auth / Roles
  getRoles: () => request('/auth/roles'),

  // Departments
  getDepartments: () => request('/departments'),
  getDepartment: (id: number | string) => request(`/departments/${id}`),
  createDepartment: (payload: any) => request('/departments', { method: 'POST', body: JSON.stringify(payload) }),
  updateDepartment: (id: number | string, payload: any) => request(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Faculty
  getFacultyList: (params: { department_id?: string | number; search?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.department_id) qs.append('department_id', String(params.department_id));
    if (params.search) qs.append('search', params.search);
    const qStr = qs.toString();
    return request(`/faculty${qStr ? `?${qStr}` : ''}`);
  },
  getFaculty: (id: number | string) => request(`/faculty/${id}`),
  createFaculty: (payload: any) => request('/faculty', { method: 'POST', body: JSON.stringify(payload) }),
  updateFaculty: (id: number | string, payload: any) => request(`/faculty/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivateFaculty: (id: number | string) => request(`/faculty/${id}`, { method: 'DELETE' }),
  getFacultyPassport: (id: number | string) => request(`/faculty/${id}/passport`),
  getFacultySkillGaps: (id: number | string) => request(`/faculty/${id}/skill-gaps`),
  getFacultyRecommendations: (id: number | string) => request(`/faculty/${id}/recommendations`),
  getFacultyCompliance: (id: number | string) => request(`/faculty/${id}/compliance`),

  // Resource Persons
  getResourcePersons: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/resource-persons${qs}`);
  },
  getResourcePerson: (id: number | string) => request(`/resource-persons/${id}`),
  createResourcePerson: (payload: any) => request('/resource-persons', { method: 'POST', body: JSON.stringify(payload) }),
  updateResourcePerson: (id: number | string, payload: any) => request(`/resource-persons/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Events & FDPs
  getEvents: (params: { status?: string; department_id?: string | number; event_type?: string; search?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.department_id) qs.append('department_id', String(params.department_id));
    if (params.event_type) qs.append('event_type', params.event_type);
    if (params.search) qs.append('search', params.search);
    const qStr = qs.toString();
    return request(`/events${qStr ? `?${qStr}` : ''}`);
  },
  getEvent: (id: number | string) => request(`/events/${id}`),
  createEvent: (payload: any) => request('/events', { method: 'POST', body: JSON.stringify(payload) }),
  updateEvent: (id: number | string, payload: any) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  addEventSession: (id: number | string, payload: any) => request(`/events/${id}/sessions`, { method: 'POST', body: JSON.stringify(payload) }),

  // Proposals & Approvals
  submitProposal: (eventId: number | string, submittedBy = 'Admin Coordinator') =>
    request(`/events/${eventId}/submit`, { method: 'POST', body: JSON.stringify({ submitted_by: submittedBy }) }),
  getProposals: (status?: string) => request(`/proposals${status ? `?status=${status}` : ''}`),
  approveProposal: (id: number | string, payload: any) => request(`/proposals/${id}/approve`, { method: 'POST', body: JSON.stringify(payload) }),
  rejectProposal: (id: number | string, payload: any) => request(`/proposals/${id}/reject`, { method: 'POST', body: JSON.stringify(payload) }),
  requestChangesProposal: (id: number | string, payload: any) => request(`/proposals/${id}/request-changes`, { method: 'POST', body: JSON.stringify(payload) }),

  // Faculty Lookup
  lookupFaculty: (query: string) => request(`/faculty/lookup?query=${encodeURIComponent(query)}`),

  // Registrations
  registerForEvent: (eventId: number | string, payload: any) =>
    request(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify(typeof payload === 'object' && payload !== null ? payload : { faculty_id: payload }),
    }),
  getEventRegistrations: (eventId: number | string) => request(`/events/${eventId}/registrations`),

  // Attendance
  qrCheckIn: (payload: any) => request('/attendance/qr-checkin', { method: 'POST', body: JSON.stringify(payload) }),
  manualAttendance: (payload: any) => request('/attendance/manual', { method: 'POST', body: JSON.stringify(payload) }),
  recordAttendance: (eventId: number | string, payload: any) => request(`/attendance?event_id=${eventId}`, { method: 'POST', body: JSON.stringify(payload) }),
  recordBulkAttendance: (payload: any) => request('/attendance/bulk', { method: 'POST', body: JSON.stringify(payload) }),
  getEventAttendance: (eventId: number | string, sessionId?: number | string) => {
    const qs = sessionId ? `?session_id=${sessionId}` : '';
    return request(`/events/${eventId}/attendance${qs}`);
  },

  // Assessments & Learning Gain
  createAssessment: (payload: any) => request('/assessments', { method: 'POST', body: JSON.stringify(payload) }),
  addAssessmentQuestion: (assessmentId: number | string, payload: any) =>
    request(`/assessments/${assessmentId}/questions`, { method: 'POST', body: JSON.stringify(payload) }),
  getEventAssessments: (eventId: number | string) => request(`/events/${eventId}/assessments`),
  submitAssessment: (assessmentId: number | string, payload: any) =>
    request(`/assessments/${assessmentId}/submit`, { method: 'POST', body: JSON.stringify(payload) }),
  getEventLearningImpact: (eventId: number | string) => request(`/events/${eventId}/learning-impact`),

  // Feedback Intelligence
  submitFeedback: (eventId: number | string, payload: any) =>
    request(`/events/${eventId}/feedback`, { method: 'POST', body: JSON.stringify(payload) }),
  getEventFeedback: (eventId: number | string) => request(`/events/${eventId}/feedback`),
  getEventFeedbackIntelligence: (eventId: number | string) => request(`/events/${eventId}/feedback-intelligence`),

  // Certificates
  getCertificateEligibility: (eventId: number | string) => request(`/events/${eventId}/certificate-eligibility`),
  generateCertificates: (eventId: number | string, facultyIds?: number[]) =>
    request(`/events/${eventId}/generate-certificates`, {
      method: 'POST',
      body: JSON.stringify(facultyIds ? { faculty_ids: facultyIds } : {}),
    }),
  getEventCertificates: (eventId: number | string) => request(`/certificates/event/${eventId}`),
  verifyCertificate: (token: string) => request(`/certificates/verify/${token}`),

  // Compliance
  getComplianceRules: () => request('/compliance/rules'),
  createComplianceRule: (payload: any) => request('/compliance/rules', { method: 'POST', body: JSON.stringify(payload) }),
  getComplianceDashboard: () => request('/compliance/dashboard'),

  // AI Intelligence Agents
  runSkillGapAgent: (facultyId: number | string) => request(`/agents/skill-gap/${facultyId}`, { method: 'POST' }),
  runRecommendationAgent: (facultyId: number | string) => request(`/agents/recommend-training/${facultyId}`, { method: 'POST' }),
  runResourceMatcherAgent: (eventId: number | string) => request(`/agents/match-resource-person/${eventId}`, { method: 'POST' }),
  generateFDP: (prompt: string, deptId = 1, days = 2) =>
    request('/agents/generate-fdp', {
      method: 'POST',
      body: JSON.stringify({ prompt, department_id: deptId, target_duration_days: days }),
    }),
  getPredictiveTrainingPlan: (deptId?: number | string, year = '2026-2027', sem = 'Odd Semester') => {
    const qs = new URLSearchParams({ academic_year: year, semester: sem });
    if (deptId) qs.append('department_id', String(deptId));
    return request(`/agents/training-plan?${qs.toString()}`);
  },
  orchestrateFaculty: (facultyId: number | string) => request(`/agents/orchestrate-faculty/${facultyId}`, { method: 'POST' }),
  getAgentLogs: () => request('/agents/logs'),

  // Reports
  getEventReport: (eventId: number | string) => request(`/events/${eventId}/report`),

  // Dashboard & Strategy
  getDashboardSummary: () => request('/dashboard/summary'),
  getStrategyAnalytics: () => request('/dashboard/strategy'),
  getSkillHeatmap: (params: { department_id?: string | number; skill_category?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.department_id) qs.append('department_id', String(params.department_id));
    if (params.skill_category) qs.append('skill_category', params.skill_category);
    return request(`/dashboard/skill-heatmap?${qs.toString()}`);
  },

  // Peer Mentors
  getPeerMentors: (facultyId: number | string, skillName?: string) => {
    const qs = skillName ? `?skill_name=${encodeURIComponent(skillName)}` : '';
    return request(`/agents/peer-mentors/${facultyId}${qs}`);
  },

  // Skill Evidence
  getSkillEvidence: (facultyId: number | string, skillName?: string) => {
    const qs = skillName ? `?skill_name=${encodeURIComponent(skillName)}` : '';
    return request(`/faculty/${facultyId}/skill-evidence${qs}`);
  },
  addSkillEvidence: (facultyId: any, payload?: any) => {
    const body = payload || (typeof facultyId === 'object' ? facultyId : {});
    const facId = typeof facultyId === 'number' || typeof facultyId === 'string' ? facultyId : body.faculty_id;
    if (facId) {
      return request(`/faculty/${facId}/skill-evidence`, { method: 'POST', body: JSON.stringify(body) });
    }
    return request('/skill-evidence', { method: 'POST', body: JSON.stringify(body) });
  },
  getVerifiedSkills: (facultyId: number | string) => request(`/faculty/${facultyId}/verified-skills`),

  // Teaching Impact
  recordTeachingImpact: (facultyId: any, payload?: any) => {
    const body = payload || (typeof facultyId === 'object' ? facultyId : {});
    const facId = typeof facultyId === 'number' || typeof facultyId === 'string' ? facultyId : body.faculty_id;
    if (facId) {
      return request(`/faculty/${facId}/teaching-impact`, { method: 'POST', body: JSON.stringify(body) });
    }
    return request('/teaching-impact', { method: 'POST', body: JSON.stringify(body) });
  },
  getFacultyTeachingImpact: (facultyId: number | string) => request(`/faculty/${facultyId}/teaching-impact`),
  getAllTeachingImpact: () => request('/teaching-impact'),
  getEventTeachingImpact: (eventId: number | string) => request(`/events/${eventId}/teaching-impact`),
  verifyTeachingImpact: (impactId: number | string, payload = {}) =>
    request(`/teaching-impact/${impactId}/verify`, { method: 'POST', body: JSON.stringify(payload) }),
  getFacultyProgrammes: (facultyId: number | string) => request(`/faculty/${facultyId}/programmes`),

  // FDP Effectiveness
  getEventEffectiveness: (eventId: number | string) => request(`/events/${eventId}/effectiveness`),

  // Career Growth Path
  getCareerGrowthPath: (facultyId: number | string, goal = 'RESEARCH_MENTOR') =>
    request(`/agents/career-path/${facultyId}`, { method: 'POST', body: JSON.stringify({ goal }) }),

  // What-If Training Simulator
  simulateTraining: (payload: any) =>
    request('/agents/simulate-training', { method: 'POST', body: JSON.stringify(payload) }),

  // Training Equity
  getTrainingEquity: (params: { department_id?: string | number; academic_year?: string; semester?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.department_id) qs.append('department_id', String(params.department_id));
    if (params.academic_year) qs.append('academic_year', params.academic_year);
    if (params.semester) qs.append('semester', params.semester);
    return request(`/agents/training-equity?${qs.toString()}`);
  },

  // Knowledge Sharing Recommender
  getKnowledgeSharing: () => request('/agents/knowledge-sharing'),
};
