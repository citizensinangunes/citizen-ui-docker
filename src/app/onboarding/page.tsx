"use client";

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Fade,
  Slide,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RegistrationForm from '../auth/components/RegistrationForm';

interface ProjectDetails {
  projectName: string;
  teamSize: string;
}

const teamSizes = [
  { value: '1', label: 'Just me' },
  { value: '2-5', label: '2-5 people' },
  { value: '6-10', label: '6-10 people' },
  { value: '11-25', label: '11-25 people' },
  { value: '26-50', label: '26-50 people' },
  { value: '50+', label: '50+ people' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    projectName: '',
    teamSize: ''
  });
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const router = useRouter();
  const { user } = useAuth();

  const steps = ['Project Details', 'Create Account'];

  const handleProjectDetailChange = (field: keyof ProjectDetails, value: string) => {
    setProjectDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Save project name to localStorage for personalization
    if (field === 'projectName') {
      localStorage.setItem('onboarding_project_name', value);
    }
  };

  const handleTeamSizeChange = (event: SelectChangeEvent) => {
    setProjectDetails(prev => ({
      ...prev,
      teamSize: event.target.value
    }));
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      // Validate project details
      if (!projectDetails.projectName || !projectDetails.teamSize) {
        return;
      }
      setSlideDirection('left');
      setCurrentStep(1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 1) {
      setSlideDirection('right');
      setCurrentStep(0);
    }
  };

  const handleRegistrationSuccess = async () => {
    try {
      // Wait a bit for the auth context to update
      setTimeout(async () => {
        try {
          // Auto-generate subdomain from project name
          const subdomain = projectDetails.projectName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

          // Create the initial site with project details
          const response = await fetch('/api/setup/create-initial-site', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              siteName: projectDetails.projectName,
              description: '', // Empty description
              subdomain: subdomain,
              teamSize: projectDetails.teamSize,
              framework: 'nextjs', // Default framework
              language: 'JavaScript'
            }),
          });

          if (response.ok) {
            // Redirect to sites dashboard
            router.push('/sites');
          } else {
            console.error('Failed to create initial site');
          }
        } catch (error) {
          console.error('Error creating initial site:', error);
        }
      }, 1000); // Wait 1 second for auth to complete
    } catch (error) {
      console.error('Error in registration success:', error);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          width: '100%',
          maxWidth: 600,
          p: 4,
          borderRadius: 3,
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" fontWeight={700} color="#004aad" gutterBottom>
            Welcome to Citizen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Let's set up your first project and get you started
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                sx={{ 
                  cursor: index < currentStep ? 'pointer' : 'default',
                  '& .MuiStepLabel-label': {
                    color: index < currentStep ? '#004aad' : 'inherit',
                    '&:hover': {
                      color: index < currentStep ? '#003a87' : 'inherit'
                    }
                  }
                }}
                onClick={() => {
                  if (index < currentStep) {
                    setSlideDirection('right');
                    setCurrentStep(index);
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Content Container with Animation */}
        <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: { xs: 450, sm: 500 } }}>
          {/* Step 1: Project Details */}
          <Slide 
            direction={slideDirection === 'left' ? 'left' : 'right'} 
            in={currentStep === 0} 
            mountOnEnter 
            unmountOnExit
            timeout={300}
          >
            <Box sx={{ position: 'absolute', width: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                What's your project name?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Tell us about your project so we can personalize your experience
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Project Name"
                  placeholder="My Awesome Project"
                  value={projectDetails.projectName}
                  onChange={(e) => handleProjectDetailChange('projectName', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#e0e0e0' },
                      '&:hover fieldset': { borderColor: '#004aad' },
                      '&.Mui-focused fieldset': { borderColor: '#004aad' },
                    },
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>How big is your team?</InputLabel>
                  <Select
                    value={projectDetails.teamSize}
                    label="How big is your team?"
                    onChange={handleTeamSizeChange}
                  >
                    {teamSizes.map((size) => (
                      <MenuItem key={size.value} value={size.value}>
                        {size.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button
                    variant="text"
                    onClick={() => router.push('/')}
                    sx={{
                      color: '#666',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    Back to Home
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNextStep}
                    disabled={!projectDetails.projectName || !projectDetails.teamSize}
                    sx={{
                      bgcolor: '#004aad',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      '&:hover': { bgcolor: '#003a87' },
                      '&.Mui-disabled': { bgcolor: 'rgba(0, 74, 173, 0.3)' }
                    }}
                  >
                    Create Account
                  </Button>
                </Box>
              </Box>
            </Box>
          </Slide>

          {/* Step 2: User Registration */}
          <Slide 
            direction={slideDirection === 'left' ? 'left' : 'right'} 
            in={currentStep === 1} 
            mountOnEnter 
            unmountOnExit
            timeout={300}
          >
            <Box sx={{ position: 'absolute', width: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Create Your Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Almost done! Create your account to manage "{projectDetails.projectName}"
              </Typography>

              <RegistrationForm onSuccess={handleRegistrationSuccess} />
            </Box>
          </Slide>
        </Box>
      </Paper>
    </Box>
  );
} 