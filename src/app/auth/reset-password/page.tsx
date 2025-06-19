"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link as MuiLink,
  Alert,
  AlertTitle
} from '@mui/material';
import Link from 'next/link';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate email
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        bgcolor: '#F8F8FF'
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 480,
          p: 4,
          borderRadius: 2,
          border: '1px solid #e0e0e0',
        }}
      >
        <MuiLink
          component={Link}
          href="/auth"
          underline="none"
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            color: '#004aad',
            fontSize: '0.875rem',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
          Back to login
        </MuiLink>

        {submitted ? (
          <Box sx={{ textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Email Sent</AlertTitle>
              We've sent a password reset link to <strong>{email}</strong>
            </Alert>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Please check your email and follow the instructions to reset your password. If you don't see the email, please check your spam folder.
            </Typography>
            
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
              sx={{
                bgcolor: '#004aad',
                color: 'white',
                py: 1.5,
                '&:hover': {
                  bgcolor: '#003a87',
                },
              }}
            >
              Send another email
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={600} color="#004aad" gutterBottom>
                Reset Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
            </Box>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your email"
                  variant="outlined"
                  size="small"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#004aad',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#004aad',
                      },
                    },
                  }}
                />
              </Box>
              
              <Button
                fullWidth
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  bgcolor: '#004aad',
                  color: 'white',
                  py: 1.5,
                  mb: 3,
                  '&:hover': {
                    bgcolor: '#003a87',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'rgba(0, 74, 173, 0.5)',
                    color: 'white',
                  }
                }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
} 