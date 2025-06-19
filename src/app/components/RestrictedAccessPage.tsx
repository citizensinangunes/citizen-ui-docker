"use client";

import React, { ReactNode, useEffect, useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

type Role = 'admin' | 'citizen' | 'viewer' | 'external';

interface RestrictedAccessPageProps {
  children: ReactNode;
  requiredRoles: Role[];
  pageName: string;
  currentRole: Role;
}

export default function RestrictedAccessPage({ 
  children, 
  requiredRoles, 
  pageName, 
  currentRole 
}: RestrictedAccessPageProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    // Check if current role has access to this page
    const access = requiredRoles.includes(currentRole);
    setHasAccess(access);
  }, [currentRole, requiredRoles]);

  // If user has access, show the original page content
  if (hasAccess) {
    return <>{children}</>;
  }

  // If user doesn't have access, show restricted access message
  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          maxWidth: 500, 
          textAlign: 'center'
        }}
      >
        <LockIcon sx={{ fontSize: 60, color: '#004aad', mb: 2, opacity: 0.7 }} />
        
        <Typography variant="h4" color="#004aad" fontWeight={500} gutterBottom>
          Access Restricted
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          You don't have permission to access the <strong>{pageName}</strong> page with your current role.
        </Typography>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 3, 
            width: '100%', 
            bgcolor: 'rgba(0, 74, 173, 0.05)', 
            border: '1px solid rgba(0, 74, 173, 0.1)',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle1" fontWeight={500} gutterBottom>
            Required Roles
          </Typography>
          <Typography variant="body2">
            This page is only accessible to users with the following role(s):
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {requiredRoles.map((role) => (
              <Box 
                key={role}
                sx={{ 
                  px: 2, 
                  py: 0.5, 
                  borderRadius: 5, 
                  bgcolor: role === 'admin' ? '#4caf5020' : 
                           role === 'citizen' ? '#ff980020' : '#90909020',
                  color: role === 'admin' ? '#4caf50' : 
                         role === 'citizen' ? '#ff9800' : '#909090',
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Box>
            ))}
          </Box>
        </Paper>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Your current role is <strong>{currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}</strong>. 
          To access this page, you need to switch to a role with the appropriate permissions.
        </Typography>
        
        <Button
          variant="contained"
          sx={{
            bgcolor: '#004aad',
            color: 'white',
            '&:hover': { bgcolor: '#003a87' }
          }}
          onClick={() => router.push('/sites')}
        >
          Go to Sites
        </Button>
      </Box>
    </Box>
  );
}