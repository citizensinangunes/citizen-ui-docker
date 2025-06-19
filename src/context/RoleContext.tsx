"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the types
export type Role = 'admin' | 'citizen' | 'external' | 'viewer';

interface RoleContextType {
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  hasAccess: (requiredRoles: Role[]) => boolean;
}

// Create the context
const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
  initialRole?: Role;
}

// Create provider component
export const RoleProvider = ({ children, initialRole = 'admin' }: RoleProviderProps) => {
  const [currentRole, setCurrentRole] = useState<Role>(initialRole);

  const hasAccess = (requiredRoles: Role[]): boolean => {
    return requiredRoles.includes(currentRole);
  };

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole, hasAccess }}>
      {children}
    </RoleContext.Provider>
  );
};

// Create custom hook to use the role context
export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// Helper function to get permissions for routes
export const getRoutePermissions = () => {
  return {
    '/sites': ['admin', 'citizen', 'external', 'viewer'],
    '/builds': ['admin', 'citizen'],
    '/domains': ['admin'],
    '/team': ['admin', 'citizen', 'external'], // External can view team but not viewer
    '/settings': ['admin'],
  };
};

// Define the role descriptions and capabilities
export const getRoleDescriptions = () => {
  return {
    admin: 'Full access to all features, can manage team members, and configure settings.',
    citizen: 'Can create and manage sites, use the IDE, and view team members.',
    external: 'External team member with access to sites and team information.',
    viewer: 'Limited access to view sites only.'
  };
};