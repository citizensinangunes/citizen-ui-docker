"use client";

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import RestrictedAccessPage from '../components/RestrictedAccessPage';
import { useRole } from '@/context/RoleContext';
import TeamDashboard from './TeamDashboard';

export default function TeamPage() {
  const { currentRole } = useRole();
  
  return (
    <DashboardLayout>
      <RestrictedAccessPage
        requiredRoles={['admin', 'citizen', 'viewer']}
        pageName="Team"
        currentRole={currentRole}
      >
        <TeamDashboard />
      </RestrictedAccessPage>
    </DashboardLayout>
  );
}