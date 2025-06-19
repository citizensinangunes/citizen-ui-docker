"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Alert
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';

export interface RegistrationFormProps {
  onSuccess?: () => void;
  inviteToken?: string | null;
  siteId?: string | null;
}

export default function RegistrationForm({ onSuccess, inviteToken, siteId }: RegistrationFormProps) {
  const { signup, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    agreeToTerms: false,
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
      [name]: name === 'agreeToTerms' ? checked : value,
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await signup(
          formData.firstName, 
          formData.lastName, 
          formData.email, 
          formData.password,
          inviteToken,
          siteId
        );
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
      {inviteToken && siteId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You've been invited to collaborate on a site! Complete your registration to get viewer access.
          </Typography>
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            First Name
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter your first name"
            variant="outlined"
            size="small"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={!!validationErrors.firstName}
            helperText={validationErrors.firstName}
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
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Last Name
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter your last name"
            variant="outlined"
            size="small"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={!!validationErrors.lastName}
            helperText={validationErrors.lastName}
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
      </Box>

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

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Password
        </Typography>
        <TextField
          fullWidth
          placeholder="Create a password"
          variant="outlined"
          size="small"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={!!validationErrors.password}
          helperText={validationErrors.password || 'Must be at least 8 characters'}
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

      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Checkbox
              name="agreeToTerms"
              checked={formData.agreeToTerms}
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
              I agree to Citizen's{' '}
              <MuiLink 
                href="#" 
                underline="none" 
                sx={{ 
                  color: '#004aad', 
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Terms of Service
              </MuiLink>
              {' '}and{' '}
              <MuiLink 
                href="#" 
                underline="none" 
                sx={{ 
                  color: '#004aad', 
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Privacy Policy
              </MuiLink>
            </Typography>
          }
        />
        {validationErrors.agreeToTerms && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: -1, ml: 2 }}>
            {validationErrors.agreeToTerms}
          </Typography>
        )}
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
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </Box>
  );
} 