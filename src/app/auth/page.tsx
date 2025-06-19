"use client";

import React, { useState, useEffect, Suspense } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Link as MuiLink,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { GitHub as GitHubIcon } from '@mui/icons-material';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function AuthPageContent() {
  const [isLogin, setIsLogin] = useState(true);
  const [showSignOutSuccess, setShowSignOutSuccess] = useState(false);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { loading } = useAuth();

  useEffect(() => {
    // Check if user has been signed out
    const fromSignOut = searchParams.get('signedOut') === 'true';
    if (fromSignOut) {
      setShowSignOutSuccess(true);
    }

    // Check for site invitation parameters
    const inviteParam = searchParams.get('invite');
    const siteParam = searchParams.get('site');
    
    if (inviteParam && siteParam) {
      setInviteToken(inviteParam);
      setSiteId(siteParam);
      setIsLogin(false); // Switch to registration for invitations
    }

    // Get project name from URL params or localStorage
    const projectFromUrl = searchParams.get('project');
    const projectFromStorage = localStorage.getItem('onboarding_project_name');
    
    if (projectFromUrl) {
      setProjectName(projectFromUrl);
    } else if (projectFromStorage) {
      setProjectName(projectFromStorage);
    }
  }, [searchParams]);

  const handleCloseSignOutAlert = () => {
    setShowSignOutSuccess(false);
  };

  const getPersonalizedTitle = () => {
    if (projectName) {
      return isLogin ? `Welcome back to ${projectName}` : `Let's build ${projectName}`;
    }
    return 'Citizen Dashboard';
  };

  const getPersonalizedDescription = () => {
    if (projectName) {
      return `Ready to deploy and manage ${projectName}? Sign in to access your project dashboard and start building.`;
    }
    return 'The premier platform for your digital presence. Deploy websites, manage domains, and collaborate with your team effortlessly.';
  };

  const getPersonalizedAuthTitle = () => {
    if (projectName) {
      return isLogin ? `Sign in to ${projectName}` : `Join ${projectName}`;
    }
    return isLogin ? 'Sign In' : 'Get Started';
  };

  const getPersonalizedAuthDescription = () => {
    if (projectName) {
      return isLogin 
        ? `Welcome back! Sign in to continue working on ${projectName}.`
        : `Create your account to start building ${projectName}.`;
    }
    return isLogin 
      ? 'Welcome back! Please enter your details.' 
      : 'Create a new account to get started.';
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        width: '100%',
        height: '100%'
      }}
    >
      <Snackbar 
        open={showSignOutSuccess} 
        autoHideDuration={6000} 
        onClose={handleCloseSignOutAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 3 }}
      >
        <Alert 
          onClose={handleCloseSignOutAlert} 
          severity="success" 
          elevation={6} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          You have been successfully signed out
        </Alert>
      </Snackbar>

      <Box 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          width: '50%',
          p: 6,
          '@media (max-width: 900px)': {
            display: 'none'
          }
        }}
      >
        <Box sx={{ mb: 'auto' }}>
          <Typography 
            variant="h2" 
            color="#004aad" 
            fontWeight={700} 
            sx={{ mb: 2 }}
          >
            {getPersonalizedTitle()}
          </Typography>
          <Typography variant="body1" color="#555555" sx={{ maxWidth: 480 }}>
            {getPersonalizedDescription()}
          </Typography>
        </Box>

        <Box 
          sx={{ 
            p: 3, 
            borderRadius: 2,
            border: '1px solid rgba(0, 74, 173, 0.1)',
            bgcolor: 'white',
            mb: 4,
            position: 'relative',
            maxWidth: 480
          }}
        >
          <Box sx={{ position: 'absolute', top: -20, left: 16 }}>
            <Box 
              sx={{ 
                display: 'inline-flex',
                bgcolor: '#004aad',
                color: 'white',
                px: 2,
                py: 1,
                borderRadius: 1,
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              {projectName ? 'Project Tip' : 'Latest Update'}
            </Box>
          </Box>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            {projectName 
              ? `Ready to deploy ${projectName}?` 
              : 'Enhanced collaboration features available'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {projectName 
              ? `Once you sign in, you'll have access to deployment tools, domain management, and team collaboration features for ${projectName}.`
              : 'Now you can invite team members, assign roles, and manage permissions to collaborate on your projects more effectively.'}
          </Typography>
          
          <MuiLink 
            href="#" 
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
            Learn more
          </MuiLink>
        </Box>
      </Box>

      <Box 
        sx={{ 
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          '@media (max-width: 900px)': {
            width: '100%'
          }
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            width: '100%',
            maxWidth: 440,
            p: 4,
            borderRadius: 2,
            border: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={600} color="#004aad" gutterBottom>
              {getPersonalizedAuthTitle()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getPersonalizedAuthDescription()}
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            disabled={loading}
            sx={{ 
              mb: 3,
              py: 1.5,
              textTransform: 'none',
              borderColor: '#e0e0e0',
              color: '#333333',
              '&:hover': {
                borderColor: '#004aad',
                bgcolor: 'rgba(0, 74, 173, 0.04)'
              }
            }}
          >
            Continue with GitHub
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
              or
            </Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>

          {isLogin ? <LoginForm /> : <RegistrationForm inviteToken={inviteToken} siteId={siteId} />}

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              {' '}
              <MuiLink
                component="button"
                type="button"
                onClick={() => setIsLogin(!isLogin)}
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
                {isLogin ? 'Sign up' : 'Sign in'}
              </MuiLink>
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            By continuing, you agree to Citizen's{' '}
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
        </Box>
      </Box>
    </Box>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100vh'
        }}
      >
        <CircularProgress sx={{ color: '#004aad' }} />
      </Box>
    }>
      <AuthPageContent />
    </Suspense>
  );
} 