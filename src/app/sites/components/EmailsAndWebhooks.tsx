import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

interface NotificationOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const EmailsAndWebhooks: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationOption[]>([
    { 
      id: 'deploy_state', 
      title: 'Add deploy state commit checks when Deploy Preview starts', 
      description: 'Receive notifications when a deployment starts', 
      enabled: true 
    },
    { 
      id: 'deploy_summary', 
      title: 'Add deploy summary commit checks when Deploy Preview starts', 
      description: 'Receive summary notifications when a deployment starts', 
      enabled: true 
    },
    { 
      id: 'preview_links', 
      title: 'Add Deploy Preview links to pull request comments when Deploy Preview starts', 
      description: 'Get notified with preview links on PR comments', 
      enabled: false 
    },
    { 
      id: 'deploy_state_succeeds', 
      title: 'Add deploy state commit checks when Deploy Preview succeeds', 
      description: 'Receive notifications when a deployment succeeds', 
      enabled: true 
    },
    { 
      id: 'deploy_summary_succeeds', 
      title: 'Add deploy summary commit checks when Deploy Preview succeeds', 
      description: 'Receive summary notifications when a deployment succeeds', 
      enabled: false 
    },
    { 
      id: 'preview_links_succeeds', 
      title: 'Add Deploy Preview links to pull request comments when Deploy Preview succeeds', 
      description: 'Get notified with preview links on successful PRs', 
      enabled: true 
    },
    { 
      id: 'deploy_state_fails', 
      title: 'Add deploy state commit checks when Deploy Preview fails', 
      description: 'Receive notifications when a deployment fails', 
      enabled: true 
    },
    { 
      id: 'deploy_summary_fails', 
      title: 'Add deploy summary commit checks when Deploy Preview fails', 
      description: 'Receive summary notifications when a deployment fails', 
      enabled: false 
    },
    { 
      id: 'preview_links_fails', 
      title: 'Add Deploy Preview links to pull request comments when Deploy Preview fails', 
      description: 'Get notified with preview links on failed PRs', 
      enabled: true 
    }
  ]);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Emails and webhooks
      </Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Set up outgoing webhooks to notify other services about deploys, form submissions, and more
        </Typography>
      </Box>

      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          mb: 3
        }}
      >
        <Box 
          sx={{ 
            p: 0,  
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          {/* Deploy Notifications Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              bgcolor: 'rgba(0, 74, 173, 0.05)',
              borderBottom: '1px solid #e0e0e0',
              borderRadius: '2px 2px 0 0'
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>
                Deploy Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure notifications for your deployments
              </Typography>
            </Box>
            <Button 
              variant="contained"
              sx={{
                bgcolor: '#004aad',
                color: 'white',
                '&:hover': { bgcolor: '#003a87' },
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              Add Notification
            </Button>
          </Box>
          
          {/* Deploy Notifications Content */}
          <Box sx={{ p: 3 }}>
            {notifications.map((notification) => (
              <Box 
                key={notification.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: '1px solid #f5f5f5',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%', 
                    border: '1px solid #ccc',
                    justifyContent: 'center',
                    mr: 2
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      width: 14, 
                      height: 2, 
                      bgcolor: '#333',
                      display: 'inline-block'
                    }} 
                  />
                </Box>
                
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {notification.title}
                  </Typography>
                </Box>
                
                <IconButton
                  onClick={(e) => handleMenuOpen(e, notification.id)}
                  size="small"
                  sx={{ color: '#666' }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            ))}
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 1,
                sx: { boxShadow: '0px 1px 4px rgba(0,0,0,0.1)' }
              }}
            >
              <MenuItem onClick={handleMenuClose}>Edit settings</MenuItem>
              <MenuItem onClick={handleMenuClose}>Remove notification</MenuItem>
            </Menu>
            
            <Box sx={{ mt: 3 }}>
              <Button
                variant="text"
                endIcon={<ArrowForwardIcon />}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  color: '#2ebc4f', 
                  textDecoration: 'none',
                  fontWeight: 500,
                  p: 0,
                  '&:hover': { 
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                Learn more about emails and webhooks in the docs
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmailsAndWebhooks; 