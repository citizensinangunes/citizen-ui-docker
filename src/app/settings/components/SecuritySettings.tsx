"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  Divider
} from '@mui/material';

const SecuritySettings: React.FC = () => {
  const [inviteOnlyMode, setInviteOnlyMode] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Security Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure security and access control settings for your team
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={inviteOnlyMode}
                onChange={(e) => setInviteOnlyMode(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Invite-Only Registration
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Only users with valid invitation tokens can register
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={emailVerification}
                onChange={(e) => setEmailVerification(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Email Verification Required
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  New users must verify their email before accessing the platform
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Two-Factor Authentication
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Require 2FA for all team members (Coming Soon)
                </Typography>
              </Box>
            }
            disabled
          />
        </Box>

        {inviteOnlyMode && (
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Invite-Only Mode Active:</strong> Your platform is secure. 
              Only users with valid invitation links can register and join your team.
            </Typography>
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default SecuritySettings; 