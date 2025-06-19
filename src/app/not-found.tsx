"use client";

import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '70vh' }}>
      <Typography variant="h4" color="#004aad" fontWeight={500} gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      
      <Link href="/sites" style={{ textDecoration: 'none' }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#004aad',
            color: '#ffffff',
            '&:hover': {
              bgcolor: '#003b8a',
            },
            textTransform: 'none',
          }}
        >
          Go to Dashboard
        </Button>
      </Link>
    </Box>
  );
} 