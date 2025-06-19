import React from 'react';
import { Box } from '@mui/material';

export const metadata = {
  title: 'Authentication - Citizen Dashboard',
  description: 'Sign in or sign up to Citizen Dashboard',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      width: '100%',
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      {children}
    </Box>
  );
} 