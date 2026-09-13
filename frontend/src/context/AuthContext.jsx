import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Demo Role state
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('facultyforge_role') || 'ADMIN';
  });

  const [activeFacultyId, setActiveFacultyId] = useState(() => {
    return Number(localStorage.getItem('facultyforge_active_faculty_id')) || 1;
  });

  const roles = [
    { id: 'ADMIN', label: 'Admin / FDP Coordinator', badgeColor: 'badge-high' },
    { id: 'HOD', label: 'HOD / IQAC / Approver', badgeColor: 'badge-medium' },
    { id: 'FACULTY', label: 'Faculty / Participant', badgeColor: 'badge-low' },
  ];

  const switchRole = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('facultyforge_role', newRole);
  };

  const updateActiveFaculty = (id) => {
    setActiveFacultyId(id);
    localStorage.setItem('facultyforge_active_faculty_id', id);
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        switchRole,
        roles,
        activeFacultyId,
        setActiveFacultyId,
        isAdmin: currentRole === 'ADMIN',
        isApprover: currentRole === 'HOD',
        isFaculty: currentRole === 'FACULTY',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
