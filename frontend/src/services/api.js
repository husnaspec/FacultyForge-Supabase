const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = text;
    }

    if (!res.ok) {
      let errorMsg;
      if (typeof data === 'string' && data.length > 0) {
        errorMsg = data;
      } else if (typeof data?.detail === 'string') {
        errorMsg = data.detail;
      } else if (Array.isArray(data?.detail)) {
        errorMsg = data.detail
          .map((d) => (d.msg ? `${d.loc ? d.loc.slice(1).join('.') + ': ' : ''}${d.msg}` : JSON.stringify(d)))
          .join(', ');
      } else if (data?.detail && typeof data.detail === 'object') {
        errorMsg = JSON.stringify(data.detail);
      } else if (data?.message) {
        errorMsg = data.message;
      } else if (data?.error) {
        errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else {
        errorMsg = `API Request Failed (${res.status}${res.statusText ? ': ' + res.statusText : ''})${text ? ' - ' + text : ''}`;
      }
      console.error(`[API Error] ${options.method || 'GET'} ${url} (${res.status}):`, errorMsg, data);
      throw new Error(errorMsg);
    }
    return data;
  } catch (err) {
    const isNetworkError = err.name === 'TypeError' && err.message?.includes('fetch');
    const displayMsg = isNetworkError
      ? `Cannot connect to backend at ${url}. Please ensure backend is running at http://127.0.0.1:8000.`
      : (err.message || 'API request failed');
    console.error(`API Error on ${endpoint}:`, displayMsg, err);
    throw new Error(displayMsg);
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Auth / Roles
  getRoles: () => request('/auth/roles'),

  // Departments
  getDepartments: () => request('/departments'),
  getDepartment: (id) => request(`/departments/${id}`),
  createDepartment: (payload) => request('/departments', { method: 'POST', body: JSON.stringify(payload) }),
  updateDepartment: (id, payload) => request(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Faculty
  getFacultyList: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.department_id) qs.append('department_id', params.department_id);
    if (params.search) qs.append('search', params.search);
    return request(`/faculty?${qs.toString()}`);
  },
  getFaculty: (id) => request(`/faculty/${id}`),
  createFaculty: (payload) => request('/faculty', { method: 'POST', body: JSON.stringify(payload) }),
  updateFaculty: (id, payload) => request(`/faculty/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deactivateFaculty: (id) => request(`/faculty/${id}`, { method: 'DELETE' }),
  getFacultyPassport: (id) => request(`/faculty/${id}/passport`),
  getFacultySkillGaps: (id) => request(`/faculty/${id}/skill-gaps`),
  getFacultyRecommendations: (id) => request(`/faculty/${id}/recommendations`),
  getFacultyCompliance: (id) => request(`/faculty/${id}/compliance`),

  // Resource Persons
  getResourcePersons: (search) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : '';
    return request(`/resource-persons${qs}`);
  },
  getResourcePerson: (id) => request(`/resource-persons/${id}`),
  createResourcePerson: (payload) => request('/resource-persons', { method: 'POST', body: JSON.stringify(payload) }),
  updateResourcePerson: (id, payload) => request(`/resource-persons/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  // Events & FDPs
  getEvents: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.append('status', params.status);
    if (params.department_id) qs.append('department_id', params.department_id);
    if (params.event_type) qs.append('event_type', params.event_type);
    if (params.search) qs.append('search', params.search);
    return request(`/events?${qs.toString()}`);
  },
  getEvent: (id) => request(`/events/${id}`),
  createEvent: (payload) => request('/events', { method: 'POST', body: JSON.stringify(payload) }),
  updateEvent: (id, payload) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  addEventSession: (id, payload) => request(`/events/${id}/sessions`, { method: 'POST', body: JSON.stringify(payload) }),

  // Proposals & Approvals
  submitProposal: (eventId, submittedBy = 'Admin Coordinator') =>
    request(`/events/${eventId}/submit`, { method: 'POST', body: JSON.stringify({ submitted_by: submittedBy }) }),
  getProposals: (status) => request(`/proposals${status ? `?status=${status}` : ''}`),
  approveProposal: (id, payload) => request(`/proposals/${id}/approve`, { method: 'POST', body: JSON.stringify(payload) }),
  rejectProposal: (id, payload) => request(`/proposals/${id}/reject`, { method: 'POST', body: JSON.stringify(payload) }),
  requestChangesProposal: (id, payload) => request(`/proposals/${id}/request-changes`, { method: 'POST', body: JSON.stringify(payload) }),

  // Registrations
  registerForEvent: (eventId, facultyId) =>
    request(`/events/${eventId}/register`, { method: 'POST', body: JSON.stringify({ faculty_id: facultyId }) }),
  getEventRegistrations: (eventId) => request(`/events/${eventId}/registrations`),

  // Attendance
  recordAttendance: (eventId, payload) =>
    request(`/attendance?event_id=${eventId}`, { method: 'POST', body: JSON.stringify(payload) }),
  recordBulkAttendance: (payload) => request('/attendance/bulk', { method: 'POST', body: JSON.stringify(payload) }),
  getEventAttendance: (eventId, sessionId) => {
    const qs = sessionId ? `?session_id=${sessionId}` : '';
    return request(`/events/${eventId}/attendance${qs}`);
  },

  // Assessments & Learning Gain
  createAssessment: (payload) => request('/assessments', { method: 'POST', body: JSON.stringify(payload) }),
  addAssessmentQuestion: (assessmentId, payload) =>
    request(`/assessments/${assessmentId}/questions`, { method: 'POST', body: JSON.stringify(payload) }),
  getEventAssessments: (eventId) => request(`/events/${eventId}/assessments`),
  submitAssessment: (assessmentId, payload) =>
    request(`/assessments/${assessmentId}/submit`, { method: 'POST', body: JSON.stringify(payload) }),
  getEventLearningImpact: (eventId) => request(`/events/${eventId}/learning-impact`),

  // Feedback Intelligence
  submitFeedback: (eventId, payload) =>
    request(`/events/${eventId}/feedback`, { method: 'POST', body: JSON.stringify(payload) }),
  getEventFeedback: (eventId) => request(`/events/${eventId}/feedback`),
  getEventFeedbackIntelligence: (eventId) => request(`/events/${eventId}/feedback-intelligence`),

  // Certificates
  generateCertificates: (eventId, facultyIds) =>
    request(`/events/${eventId}/generate-certificates`, { method: 'POST', body: JSON.stringify(facultyIds ? { faculty_ids: facultyIds } : {}) }),
  getEventCertificates: (eventId) => request(`/certificates/event/${eventId}`),
  verifyCertificate: (token) => request(`/certificates/verify/${token}`),

  // Compliance
  getComplianceRules: () => request('/compliance/rules'),
  createComplianceRule: (payload) => request('/compliance/rules', { method: 'POST', body: JSON.stringify(payload) }),
  getComplianceDashboard: () => request('/compliance/dashboard'),

  // AI Intelligence Agents
  runSkillGapAgent: (facultyId) => request(`/agents/skill-gap/${facultyId}`, { method: 'POST' }),
  runRecommendationAgent: (facultyId) => request(`/agents/recommend-training/${facultyId}`, { method: 'POST' }),
  runResourceMatcherAgent: (eventId) => request(`/agents/match-resource-person/${eventId}`, { method: 'POST' }),
  generateFDP: (prompt, deptId = 1, days = 2) =>
    request('/agents/generate-fdp', {
      method: 'POST',
      body: JSON.stringify({ prompt, department_id: deptId, target_duration_days: days })
    }),
  getPredictiveTrainingPlan: (deptId, year = '2026-2027', sem = 'Odd Semester') => {
    const qs = new URLSearchParams({ academic_year: year, semester: sem });
    if (deptId) qs.append('department_id', deptId);
    return request(`/agents/training-plan?${qs.toString()}`);
  },
  orchestrateFaculty: (facultyId) => request(`/agents/orchestrate-faculty/${facultyId}`, { method: 'POST' }),
  getAgentLogs: () => request('/agents/logs'),

  // Reports
  getEventReport: (eventId) => request(`/events/${eventId}/report`),

  // Dashboard & Strategy
  getDashboardSummary: () => request('/dashboard/summary'),
  getStrategyAnalytics: () => request('/dashboard/strategy'),
  getSkillHeatmap: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.department_id) qs.append('department_id', params.department_id);
    if (params.skill_category) qs.append('skill_category', params.skill_category);
    return request(`/dashboard/skill-heatmap?${qs.toString()}`);
  },

  // Peer Mentors
  getPeerMentors: (facultyId, skillName) => {
    const qs = skillName ? `?skill_name=${encodeURIComponent(skillName)}` : '';
    return request(`/agents/peer-mentors/${facultyId}${qs}`);
  },

  // Skill Evidence
  getSkillEvidence: (facultyId, skillName) => {
    const qs = skillName ? `?skill_name=${encodeURIComponent(skillName)}` : '';
    return request(`/faculty/${facultyId}/skill-evidence${qs}`);
  },
  addSkillEvidence: (facultyId, payload) =>
    request(`/faculty/${facultyId}/skill-evidence`, { method: 'POST', body: JSON.stringify(payload) }),
  getVerifiedSkills: (facultyId) => request(`/faculty/${facultyId}/verified-skills`),

  // Teaching Impact
  recordTeachingImpact: (facultyId, payload) =>
    request(`/faculty/${facultyId}/teaching-impact`, { method: 'POST', body: JSON.stringify(payload) }),
  getFacultyTeachingImpact: (facultyId) => request(`/faculty/${facultyId}/teaching-impact`),
  getEventTeachingImpact: (eventId) => request(`/events/${eventId}/teaching-impact`),

  // FDP Effectiveness
  getEventEffectiveness: (eventId) => request(`/events/${eventId}/effectiveness`),

  // Career Growth Path
  getCareerGrowthPath: (facultyId, goal = 'RESEARCH_MENTOR') =>
    request(`/agents/career-path/${facultyId}`, { method: 'POST', body: JSON.stringify({ goal }) }),

  // What-If Training Simulator
  simulateTraining: (payload) =>
    request('/agents/simulate-training', { method: 'POST', body: JSON.stringify(payload) }),

  // Training Equity
  getTrainingEquity: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.department_id) qs.append('department_id', params.department_id);
    if (params.academic_year) qs.append('academic_year', params.academic_year);
    if (params.semester) qs.append('semester', params.semester);
    return request(`/agents/training-equity?${qs.toString()}`);
  },

  // Knowledge Sharing Recommender
  getKnowledgeSharing: () => request('/agents/knowledge-sharing'),
};
