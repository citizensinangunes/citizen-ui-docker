"use client";

import React, { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import { SiteDetails as SiteDetailsType } from '@/types/site.types';
import { configCategories } from './SiteConfigurationSidebar';

// Import UI components
import {
  Card,
  Button,
  StaticGridField,
  ShareSiteModal,
  SettingsIcon,
  ShareIcon,
  LaunchIcon,
  CopyIcon,
  Link as UILink,
  Box,
  Typography
} from '@/components/ui';

// Import configuration components
import SiteTeamAccess from './SiteTeamAccess';
import ExternalCollaborators from './ExternalCollaborators';
import DangerZone from './DangerZone';
import ContinuousDeployment from './ContinuousDeployment';
import ConfigVars from './ConfigVars';
import EmailsAndWebhooks from './EmailsAndWebhooks';
import EmailsConfiguration from './EmailsConfiguration';
import SSLCertificates from './SSLCertificates';

// Mock team data
const getTeamData = () => {
  return [
    { 
      id: 'core-001', 
      name: 'Core Team', 
      memberCount: 14, 
      description: 'Main team with primary access to all resources',
      createdAt: '2023-01-01',
      updatedAt: '2023-06-15',
      department: 'Engineering',
      access: 'admin'
    },
    { 
      id: 'design-002', 
      name: 'Design Team', 
      memberCount: 8, 
      description: 'Responsible for UI/UX design and visual assets',
      createdAt: '2023-03-15',
      updatedAt: '2023-05-10',
      department: 'Design',
      access: 'citizen'
    },
    { 
      id: 'marketing-003', 
      name: 'Marketing Team', 
      memberCount: 9, 
      description: 'Handles all marketing initiatives and campaigns',
      createdAt: '2023-04-10',
      updatedAt: '2023-06-05',
      department: 'Marketing',
      access: 'viewer'
    },
    { 
      id: 'product-005', 
      name: 'Product Team', 
      memberCount: 7, 
      description: 'Manages product roadmap and feature development',
      createdAt: '2023-02-15',
      updatedAt: '2023-05-20',
      department: 'Product',
      access: 'citizen'
    },
  ];
};

interface SiteConfigurationContentProps {
  siteId: string;
  siteData: SiteDetailsType | null;
  configCategory: string;
  configSubcategory: string;
  onDeleteSite: () => Promise<void>;
  onNotification: (notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
    title: string;
    details: Record<string, number> | null;
  }) => void;
}

export default function SiteConfigurationContent({
  siteId,
  siteData,
  configCategory,
  configSubcategory,
  onDeleteSite,
  onNotification
}: SiteConfigurationContentProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Team member related states
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Ahmet Sinan', email: 'ahmet@company.com', role: 'Owner', team: 'Core Team', status: 'Active' },
    { id: 2, name: 'John Doe', email: 'john@company.com', role: 'Admin', team: 'Core Team', status: 'Active' },
    { id: 3, name: 'Sarah Chen', email: 'sarah@company.com', role: 'Citizen', team: 'Core Team', status: 'Active' }
  ]);
  
  const [pendingInvites, setPendingInvites] = useState([
    { id: 101, name: 'Alex Johnson', email: 'alex@company.com', role: 'Citizen', team: 'Engineering', status: 'Pending' }
  ]);
  
  const [isAdmin, setIsAdmin] = useState(true);
  const [siteEnabled, setSiteEnabled] = useState(true);

  // Share Site Modal states
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Debug effect to track shareModalOpen changes
  React.useEffect(() => {
    console.log('shareModalOpen state changed to:', shareModalOpen);
  }, [shareModalOpen]);

  // Get teams from TeamDetails
  const teams = getTeamData();

  // Function to handle toggle site enabled
  const handleToggleSiteEnabled = () => {
    setSiteEnabled(!siteEnabled);
  };

  // Share Site handlers
  const handleShareSite = () => {
    console.log('handleShareSite called, current shareModalOpen:', shareModalOpen);
    setShareModalOpen(true);
    console.log('setShareModalOpen(true) called');
  };

  const handleCloseShareModal = () => {
    console.log('handleCloseShareModal called');
    setShareModalOpen(false);
  };

  // Handler functions for external collaborators
  const handleAddInvite = (invite: { email: string; role: string; team: string }) => {
    const newInvite = {
      id: Math.floor(Math.random() * 1000) + 100,
      name: invite.email.split('@')[0],
      email: invite.email,
      role: invite.role,
      team: invite.team,
      status: 'Pending'
    };
    
    setPendingInvites([...pendingInvites, newInvite]);
  };
  
  const handleApproveInvite = (id: number) => {
    const invite = pendingInvites.find(item => item.id === id);
    if (invite) {
      const approvedMember = {...invite, status: 'Active'};
      setTeamMembers([...teamMembers, approvedMember]);
      setPendingInvites(pendingInvites.filter(item => item.id !== id));
    }
  };
  
  const handleDeclineInvite = (id: number) => {
    setPendingInvites(pendingInvites.filter(item => item.id !== id));
  };

  // Copy to clipboard handler
  const handleCopyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  // Find current content
  const getCurrentContent = () => {
    const category = configCategories.find(cat => cat.name === configCategory);
    if (!category) return 'Category content not found';
    
    if (category.subcategories.length === 0) {
      // Return ConfigVars component for Config Vars category
      if (category.name === 'Config Vars') {
        console.log("Rendering ConfigVars with siteId:", siteId);
        return <ConfigVars siteId={siteId} />;
      }
      
      return `Content for ${configCategory}`;
    }
    
    const subcategory = category.subcategories.find(subcat => subcat.name === configSubcategory);
    
    // Return custom content for General > Site details
    if (category.name === 'General' && subcategory?.name === 'Site details') {
      return (
        <div>
          <h2 style={{ 
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            fontWeight: 500,
            marginBottom: isMobile ? '8px' : '16px',
            color: '#333'
          }}>
            Site information
          </h2>
          
          <p style={{ 
            fontSize: isMobile ? '0.875rem' : '1rem',
            color: '#666',
            marginBottom: isMobile ? '16px' : '24px',
            marginTop: isMobile ? '8px' : '16px'
          }}>
            Basic information about your site
          </p>

          <Card
            title="Site Details"
            subtitle="Basic site information and management"
            padding="large"
            responsive
          >
            {/* Site Name */}
            <StaticGridField
              label="Site name:"
              value={siteData?.name || 'Loading...'}
              responsive
            />
            
            {/* Owner */}
            <StaticGridField
              label="Owner:"
              value={siteData?.owner ? `${siteData.owner.firstName || ''} ${siteData.owner.lastName || ''}`.trim() || siteData.owner.email || 'Loading...' : 'Loading...'}
              responsive
            />
            
            {/* Site ID */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
              gap: isMobile ? 1 : 2,
              alignItems: isMobile ? 'flex-start' : 'center',
              mb: isMobile ? 2 : 3
            }}>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  fontWeight: 500
                }}
              >
                Site ID:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <Typography 
                  variant="body1"
                  sx={{ 
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    fontWeight: 500,
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}
                >
                  {siteData?.siteId || 'Loading...'}
                </Typography>
                <button
                  onClick={() => handleCopyToClipboard(siteData?.siteId || '')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#666'
                  }}
                >
                  <CopyIcon style={{ fontSize: '1rem' }} />
                </button>
              </Box>
            </Box>
            
            {/* Created */}
            <StaticGridField
              label="Created:"
              value={siteData?.createdAt 
                ? new Date(siteData.createdAt).toLocaleString('tr-TR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Loading...'}
              responsive
            />
            
            {/* Last update */}
            <StaticGridField
              label="Last update:"
              value={siteData?.updatedAt 
                ? new Date(siteData.updatedAt).toLocaleString('tr-TR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Loading...'}
              responsive
            />

            {/* Framework */}
            <StaticGridField
              label="Framework:"
              value={siteData?.framework?.name || 'Not specified'}
              responsive
            />
            
            {/* Repository */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 2fr',
              gap: isMobile ? 1 : 2,
              alignItems: isMobile ? 'flex-start' : 'center',
              mb: isMobile ? 2 : 3
            }}>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  fontWeight: 500
                }}
              >
                Repository:
              </Typography>
              <Typography 
                variant="body1"
                sx={{ 
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  fontWeight: 500
                }}
              >
                {siteData?.repoUrl ? (
                  <UILink 
                    href={siteData.repoUrl}
                    external
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {siteData.repoName || siteData.repoUrl.split('/').pop() || siteData.repoUrl}
                    <LaunchIcon style={{ fontSize: '1rem' }} />
                  </UILink>
                ) : 'Not connected'}
              </Typography>
            </Box>

            {/* Team */}
            <StaticGridField
              label="Team:"
              value={typeof siteData?.team === 'string' ? siteData.team : siteData?.team?.name || 'No team assigned'}
              responsive
            />
            
            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: isMobile ? 1 : 2,
              mt: isMobile ? 3 : 4,
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <Button 
                variant="primary"
                startIcon={<SettingsIcon />}
                fullWidth={isMobile}
                responsive
              >
                Change site name
              </Button>
              
              <Button 
                variant="primary"
                startIcon={<ShareIcon />}
                onClick={() => {
                  console.log('ShareSite button clicked!');
                  handleShareSite();
                }}
                fullWidth={isMobile}
                responsive
                style={{
                  backgroundColor: '#4caf50'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#388e3c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4caf50';
                }}
              >
                Share Site
              </Button>
              
              <Button 
                variant="primary"
                startIcon={<SettingsIcon />}
                fullWidth={isMobile}
                responsive
              >
                Transfer site
              </Button>
            </Box>
          </Card>

          {/* Share Site Modal */}
          <ShareSiteModal
            open={shareModalOpen}
            siteName={siteData?.name || 'Site'}
            siteId={siteId}
            onClose={handleCloseShareModal}
            onNotification={onNotification}
            responsive
          />
        </div>
      );
    }

    // Return custom content for General > Status badges
    if (category.name === 'General' && subcategory?.name === 'Status badges') {
      return (
        <div>
          <h2 style={{ 
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            fontWeight: 500,
            marginBottom: isMobile ? '8px' : '16px',
            color: '#333'
          }}>
            Status badges
          </h2>
          
          <p style={{ 
            fontSize: isMobile ? '0.875rem' : '1rem',
            color: '#666',
            marginBottom: isMobile ? '16px' : '24px',
            marginTop: isMobile ? '8px' : '16px'
          }}>
            Citizen badges for your site
          </p>
          
          <Card
            title="Deploy Status Badge"
            subtitle="Status badge for deployment state"
            padding="large"
            responsive
          >
            <p style={{ 
              fontSize: isMobile ? '0.875rem' : '1rem',
              marginBottom: isMobile ? '12px' : '16px',
              lineHeight: 1.5
            }}>
              This image automatically updates to reflect the current state of your latest production deploy.
            </p>
            
            <p style={{ 
              fontSize: isMobile ? '0.875rem' : '1rem',
              marginBottom: isMobile ? '12px' : '16px',
              lineHeight: 1.5
            }}>
              To create a status badge for a deployed branch, add the <code style={{ 
                fontFamily: 'monospace', 
                backgroundColor: '#f5f5f5', 
                padding: '2px 6px', 
                borderRadius: '4px' 
              }}>?branch=</code> query parameter to the badge URL. You can use the markdown snippet below to add it to your project README.
            </p>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: isMobile ? '16px' : '24px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: '#333', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '4px 0 0 4px' 
              }}>
                <div style={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  backgroundColor: '#fff', 
                  display: 'inline-block',
                  marginRight: '8px',
                  position: 'relative'
                }} />
                citizen
              </div>
              <div style={{ 
                backgroundColor: '#2ebc4f', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '0 4px 4px 0' 
              }}>
                success
              </div>
            </div>
            
            <div style={{
              backgroundColor: '#222',
              color: 'white',
              padding: isMobile ? '16px' : '24px',
              borderRadius: '4px',
              position: 'relative',
              marginBottom: isMobile ? '16px' : '24px'
            }}>
              <code style={{ 
                fontFamily: 'monospace', 
                wordBreak: 'break-all',
                fontSize: isMobile ? '0.75rem' : '0.875rem'
              }}>
                [![Netlify Status](https://api.netlify.com/api/v1/badges/f6df13f5-22c5-42c7-a531-789a21422f45/deploy-status)](https://app.netlify.com/sites/customer-segment/deploys)
              </code>
              <button
                onClick={() => handleCopyToClipboard('[![Netlify Status](https://api.netlify.com/api/v1/badges/f6df13f5-22c5-42c7-a531-789a21422f45/deploy-status)](https://app.netlify.com/sites/customer-segment/deploys)')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  padding: '4px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                <CopyIcon style={{ fontSize: '1rem' }} />
              </button>
            </div>
            
            <div style={{ 
              width: '100%', 
              height: 20, 
              backgroundColor: '#f5f5f5', 
              borderRadius: '4px' 
            }} />
          </Card>
        </div>
      );
    }
    
    // Return custom content for General > Site members
    if (category.name === 'General' && subcategory?.name === 'Site members') {
      return (
        <div>
          <h2 style={{ 
            fontSize: isMobile ? '1.125rem' : '1.25rem',
            fontWeight: 500,
            marginBottom: isMobile ? '8px' : '16px',
            color: '#333'
          }}>
            Site members
          </h2>
          <p style={{ 
            fontSize: isMobile ? '0.875rem' : '1rem',
            color: '#666',
            marginBottom: isMobile ? '24px' : '32px'
          }}>
            Manage who has access to this site and what permissions they have
          </p>
          
          {/* Teams with Access section using the new component */}
          <SiteTeamAccess 
            teams={teams}
            teamMembers={teamMembers}
            isAdmin={isAdmin}
          />
          
          {/* External Collaborators section using the new component */}
          <ExternalCollaborators
            pendingInvites={pendingInvites}
            isAdmin={isAdmin}
            onAddInvite={handleAddInvite}
            onApproveInvite={handleApproveInvite}
            onDeclineInvite={handleDeclineInvite}
          />
          
          {/* Admin mode toggle - for demo purposes */}
          <div style={{ 
            marginTop: isMobile ? '24px' : '32px', 
            display: 'flex', 
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '8px' : '16px',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <span style={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
              Demo: Toggle admin mode
            </span>
            <Button 
              variant="outline"
              onClick={() => setIsAdmin(!isAdmin)}
              responsive
              sx={{
                color: isAdmin ? '#f44336' : '#004aad',
                borderColor: isAdmin ? '#f44336' : '#004aad',
              }}
            >
              {isAdmin ? 'Switch to Member mode' : 'Switch to Admin mode'}
            </Button>
          </div>
        </div>
      );
    }
    
    // Return custom content for General > Danger zone
    if (category.name === 'General' && subcategory?.name === 'Danger zone') {
      return (
        <DangerZone 
          siteName={siteData?.name || ''}
          siteEnabled={siteEnabled}
          onToggleSiteEnabled={handleToggleSiteEnabled}
          onDeleteSite={onDeleteSite}
        />
      );
    }

    // Return custom content for Build & deploy > Continuous deployment
    if (category.name === 'Build & deploy' && subcategory?.name === 'Continuous deployment') {
      return (
        <ContinuousDeployment 
          repoUrl={siteData?.repoUrl || ''}
          repoName={siteData?.repoName || ''}
        />
      );
    }
    
    // Return custom content for Notifications > Emails and webhooks
    if (category.name === 'Notifications' && subcategory?.name === 'Emails and webhooks') {
      return <EmailsAndWebhooks />;
    }
    
    // Return custom content for Access & Certificates > SSL Certificates
    if (category.name === 'Access & Certificates' && subcategory?.name === 'SSL Certificates') {
      return <SSLCertificates />;
    }
    
    // Return custom content for Emails > Configuration
    if (category.name === 'Emails' && subcategory?.name === 'Configuration') {
      return <EmailsConfiguration />;
    }
    
    return subcategory ? subcategory.content : 'Content not found';
  };

  return getCurrentContent();
} 