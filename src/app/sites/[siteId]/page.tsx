"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from "@/app/components/DashboardLayout";
import RestrictedAccessPage from "@/app/components/RestrictedAccessPage";
import SiteDetails from "../components/SiteDetails";

// Define the types locally since the imports are missing
type Role = 'admin' | 'citizen' | 'viewer' | 'external';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export default function SiteDetailsPage() {
  // Get the siteId parameter from the URL
  const params = useParams();
  const siteId = params?.siteId as string;
  
  console.log("SiteDetailsPage - URL siteId parameter:", siteId);
  
  const user = {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin" as Role,
  } as CurrentUser;

  // Only Admin roles can access site details
  const hasAccess = ["admin"].includes(user.role);

  if (!hasAccess) {
    return <RestrictedAccessPage 
      children={null} 
      requiredRoles={["admin"]} 
      pageName="Site Details" 
      currentRole={user.role} 
    />;
  }

  if (!siteId) {
    return <div>Site ID bulunamadı</div>;
  }

  return (
    <DashboardLayout>
      <SiteDetails siteId={siteId} />
    </DashboardLayout>
  );
} 