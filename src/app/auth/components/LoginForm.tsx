"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Checkbox,
  FormControlLabel,
  Alert
} from '@mui/material';
import Link from 'next/link';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

export interface LoginFormProps {
  onSuccess?: () => void;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Clear auth context error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'rememberMe' ? checked : value,
    });
    
    // Clear error when user types
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: '',
      });
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await login(formData.email, formData.password);
        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        // Error will be handled by auth context
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Email
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter your email"
          variant="outlined"
          size="small"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={!!validationErrors.email}
          helperText={validationErrors.email}
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

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Password
        </Typography>
        <TextField
          fullWidth
          placeholder="Enter your password"
          variant="outlined"
          size="small"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={!!validationErrors.password}
          helperText={validationErrors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              sx={{
                color: '#004aad',
                '&.Mui-checked': {
                  color: '#004aad',
                },
              }}
            />
          }
          label={
            <Typography variant="body2">
              Remember me
            </Typography>
          }
        />
        
        <MuiLink
          component={Link}
          href="/auth/reset-password"
          underline="none"
          sx={{ 
            color: '#004aad', 
            fontWeight: 500,
            fontSize: '0.875rem',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Forgot password?
        </MuiLink>
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
        {loading ? 'Signing In...' : 'Sign In'}
      </Button>
    </Box>
  );
} 