"use client";

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import RestrictedAccessPage from '../components/RestrictedAccessPage';
import { useRole } from '@/context/RoleContext';
import BuildsDashboard from './BuildsDashboard';

export default function BuildsPage() {
  const { currentRole } = useRole();
  
  return (
    <DashboardLayout>
      <RestrictedAccessPage
        requiredRoles={['admin', 'citizen', 'viewer']}
        pageName="Builds"
        currentRole={currentRole}
      >
        <BuildsDashboard />
      </RestrictedAccessPage>
    </DashboardLayout>
  );
}