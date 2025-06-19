"use client";

import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import RestrictedAccessPage from '../components/RestrictedAccessPage';
import { useRole } from '@/context/RoleContext';
import TeamSettings from './TeamSettings';

export default function SettingsPage() {
  const { currentRole } = useRole();
  
  return (
    <DashboardLayout>
      <RestrictedAccessPage
        requiredRoles={['admin']}
        pageName="Team Settings"
        currentRole={currentRole}
      >
        <TeamSettings />
      </RestrictedAccessPage>
    </DashboardLayout>
  );
} 