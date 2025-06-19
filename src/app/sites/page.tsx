"use client";

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import RestrictedAccessPage from '../components/RestrictedAccessPage';
import { useRole } from '@/context/RoleContext';
import SitesDashboard from './SitesDashboard';

export default function SitesPage() {
  const { currentRole } = useRole();
  
  return (
    <DashboardLayout>
      <RestrictedAccessPage
        requiredRoles={['admin', 'citizen', 'viewer']}
        pageName="Sites"
        currentRole={currentRole}
      >
        <SitesDashboard />
      </RestrictedAccessPage>
    </DashboardLayout>
  );
}