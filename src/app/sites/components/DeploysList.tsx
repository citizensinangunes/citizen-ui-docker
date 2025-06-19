import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Avatar,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  GitHub as GitHubIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Button, TabContainer, DataTable, StatusIcon, CodeBlock } from '@/components/ui';
import { DeployCard } from '@/components/mobile';

interface Build {
  id: string;
  siteName: string;
  branch: string;
  commitMessage: string;
  author: string;
  authorAvatar: string;
  status: 'Published' | 'Error' | 'Building' | 'Waiting';
  deployTime: string;
  deployDuration: string;
  files?: number;
  assetsChanged?: number;
  redirectRules?: number;
  deploymentUrl?: string;
  framework: string;
  error?: string;
}

interface DeploysListProps {
  siteName: string;
}

// Mock builds data
const mockBuilds: Build[] = [
  { 
    id: 'a1b2c3d4', 
    siteName: 'Customer Segmentation', 
    branch: 'main', 
    commitMessage: 'Update navigation and add new dashboard components',
    author: 'Ahmet Sinan',
    authorAvatar: 'AS',
    status: 'Published',
    deployTime: '2 hours ago',
    deployDuration: '1m 25s',
    files: 12,
    assetsChanged: 12,
    redirectRules: 2,
    deploymentUrl: 'https://customer-segment.citizen.company.com',
    framework: 'Next.js'
  },
  { 
    id: 'e5f6g7h8', 
    siteName: 'Customer Segmentation', 
    branch: 'feature/ui-updates', 
    commitMessage: 'Implement responsive layout for mobile devices',
    author: 'Sarah Chen',
    authorAvatar: 'SC',
    status: 'Published',
    deployTime: 'Yesterday',
    deployDuration: '1m 42s',
    files: 8,
    assetsChanged: 6,
    redirectRules: 0,
    deploymentUrl: 'https://ui-updates.customer-segment.citizen.company.com',
    framework: 'Next.js'
  },
  { 
    id: 'i9j0k1l2', 
    siteName: 'Customer Segmentation', 
    branch: 'fix/auth-error', 
    commitMessage: 'Fix authentication error on login page',
    author: 'John Doe',
    authorAvatar: 'JD',
    status: 'Error',
    deployTime: '2 days ago',
    deployDuration: '45s',
    error: 'Build failed: Cannot find module "auth-provider"',
    framework: 'Next.js'
  },
  { 
    id: 'm3n4o5p6', 
    siteName: 'Customer Segmentation', 
    branch: 'main', 
    commitMessage: 'Update dependencies and fix security vulnerabilities',
    author: 'Ahmet Sinan',
    authorAvatar: 'AS',
    status: 'Published',
    deployTime: '3 days ago',
    deployDuration: '1m 18s',
    files: 3,
    assetsChanged: 2,
    redirectRules: 0,
    deploymentUrl: 'https://customer-segment.citizen.company.com',
    framework: 'Next.js'
  },
  { 
    id: 'q7r8s9t0', 
    siteName: 'Customer Segmentation', 
    branch: 'feature/analytics', 
    commitMessage: 'Add analytics dashboard and reporting features',
    author: 'Sarah Chen',
    authorAvatar: 'SC',
    status: 'Building',
    deployTime: 'Just now',
    deployDuration: '30s',
    framework: 'Next.js'
  }
];

const DeploysList: React.FC<DeploysListProps> = ({ siteName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Define table columns with responsive visibility
  const columns = [
    { key: 'status', label: 'Status', width: isMobile ? '80px' : '120px' },
    { key: 'message', label: 'Deploy message' },
    { 
      key: 'branch', 
      label: 'Branch/Author', 
      width: isMobile ? '160px' : '200px'
    },
    { 
      key: 'deployTime', 
      label: 'Deploy time', 
      width: isMobile ? '100px' : '120px'
    },
    ...(isMobile ? [] : [{ 
      key: 'duration', 
      label: 'Duration', 
      width: '100px' 
    }]),
    { 
      key: 'actions', 
      label: '', 
      width: isMobile ? '40px' : '60px', 
      align: 'right' as const 
    }
  ];

  // Render table cell content with responsive adjustments
  const renderCell = (key: string, value: any, row: Build) => {
    switch (key) {
      case 'status':
        return <StatusIcon status={row.status} responsive />;
      
      case 'message':
        return (
          <Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                lineHeight: isMobile ? 1.3 : 1.4,
                display: '-webkit-box',
                WebkitLineClamp: isMobile ? 2 : 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {row.commitMessage}
            </Typography>
            {row.error && (
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#e53935', 
                  mt: 0.5,
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  lineHeight: 1.3
                }}
              >
                {row.error}
              </Typography>
            )}
            {/* Show duration inline on mobile */}
            {isMobile && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mt: 0.5,
                  fontSize: '0.7rem'
                }}
              >
                Duration: {row.deployDuration}
              </Typography>
            )}
          </Box>
        );
      
      case 'branch':
        return (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: isMobile ? 0.5 : 1
            }}>
              <GitHubIcon 
                fontSize="small" 
                sx={{ 
                  color: '#333', 
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: isMobile ? '0.7rem' : '0.875rem',
                  fontWeight: 500,
                  wordBreak: 'break-word'
                }}
              >
                {row.branch}
              </Typography>
              <Chip 
                label={row.id.substring(0, isMobile ? 5 : 7)} 
                size="small"
                sx={{ 
                  bgcolor: '#f0f0f0',
                  height: isMobile ? '16px' : '20px',
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  fontFamily: 'monospace',
                  '& .MuiChip-label': {
                    px: isMobile ? 0.5 : 0.75
                  }
                }}
              />
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mt: isMobile ? 0.25 : 0.5,
              gap: 0.5
            }}>
              <Avatar 
                sx={{ 
                  width: isMobile ? 12 : 16, 
                  height: isMobile ? 12 : 16, 
                  fontSize: isMobile ? '0.5rem' : '0.6rem',
                  bgcolor: '#004aad'
                }}
              >
                {row.authorAvatar}
              </Avatar>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontSize: isMobile ? '0.65rem' : '0.75rem'
                }}
              >
                {row.author}
              </Typography>
            </Box>
          </Box>
        );
      
      case 'deployTime':
        return (
          <Typography 
            variant="body2"
            sx={{ 
              fontSize: isMobile ? '0.7rem' : '0.875rem'
            }}
          >
            {row.deployTime}
          </Typography>
        );
      
      case 'duration':
        return (
          <Typography 
            variant="body2"
            sx={{ 
              fontSize: isMobile ? '0.7rem' : '0.875rem'
            }}
          >
            {row.deployDuration}
          </Typography>
        );
      
      case 'actions':
        return (
          <IconButton 
            size={isMobile ? "small" : "small"}
            sx={{ 
              p: isMobile ? 0.5 : 1
            }}
          >
            <MoreVertIcon fontSize={isMobile ? "small" : "small"} />
          </IconButton>
        );
      
      default:
        return value;
    }
  };

  // Tab content components with responsive adjustments
  const AllDeploysTab = () => {
    if (isMobile) {
      return (
        <Box sx={{ p: 2 }}>
          {mockBuilds.map((build, index) => (
            <DeployCard 
              key={build.id} 
              build={build} 
              onMenuClick={(build) => {
                // Handle menu click
                console.log('Menu clicked for build:', build.id);
              }}
            />
          ))}
        </Box>
      );
    }

    return (
      <DataTable
        columns={columns}
        data={mockBuilds}
        renderCell={renderCell}
        responsive
      />
    );
  };

  const ProductionDeploysTab = () => {
    const productionBuilds = mockBuilds.filter(build => build.status === 'Published');
    
    if (isMobile) {
      return (
        <Box sx={{ p: 2 }}>
          {productionBuilds.map((build, index) => (
            <DeployCard 
              key={build.id} 
              build={build} 
              onMenuClick={(build) => {
                // Handle menu click
                console.log('Menu clicked for build:', build.id);
              }}
            />
          ))}
        </Box>
      );
    }

    return (
      <DataTable
        columns={columns}
        data={productionBuilds}
        renderCell={renderCell}
        responsive
      />
    );
  };

  const DeployHooksTab = () => (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <Typography 
        variant={isMobile ? "body1" : "h6"} 
        fontWeight={500} 
        sx={{ 
          mb: isMobile ? 1.5 : 2,
          fontSize: isMobile ? '0.875rem' : '1rem'
        }}
      >
        Deploy hooks
      </Typography>
      
      <Box sx={{ mb: isMobile ? 2 : 3 }}>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: isMobile ? 1.5 : 2,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            lineHeight: isMobile ? 1.4 : 1.5
          }}
        >
          Deploy hooks allow external services to trigger new builds and deploys for your site.
        </Typography>
        
        <CodeBlock 
          code="https://api.citizen.company.com/build_hooks/a1b2c3d4e5f6g7h8i9j0"
          responsive
        />
        
        <Button 
          variant="primary"
          responsive
          fullWidth={isMobile}
        >
          Create deploy hook
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ mb: 4, px: isMobile ? 2 : 3 }}>
      <Typography 
        variant={isMobile ? "h6" : "h5"} 
        sx={{ 
          fontWeight: 500, 
          mb: 1,
          fontSize: isMobile ? '1rem' : '1.25rem'
        }}
      >
        Deploys
      </Typography>
      
      <Box sx={{ mt: 2, mb: isMobile ? 2 : 3 }}>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}
        >
          View and manage all deployments for this site
        </Typography>
      </Box>
      
      <TabContainer
        title="Deploy History"
        subtitle={`Recent deployments for ${siteName}`}
        actionButton={
          <Button
            variant="primary"
            icon={<RefreshIcon />}
            responsive
            size={isMobile ? "small" : "medium"}
          >
            {isMobile ? "Deploy" : "Trigger Deploy"}
          </Button>
        }
        tabs={[
          {
            label: 'All deploys',
            content: <AllDeploysTab />
          },
          {
            label: 'Production deploys',
            content: <ProductionDeploysTab />
          },
          {
            label: 'Deploy hooks',
            content: <DeployHooksTab />
          }
        ]}
        responsive
      />
    </Box>
  );
};

export default DeploysList; 