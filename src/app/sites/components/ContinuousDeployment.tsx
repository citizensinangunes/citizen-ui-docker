import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  Link,
  Menu,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Collapse,
  IconButton
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import GitHubIcon from '@mui/icons-material/GitHub';
import StorageIcon from '@mui/icons-material/Storage';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';

// Import UI components
import { Card, ActionButtons, PrimaryButton, FormContainer, InfoGrid, MonospaceTextField } from '@/components/ui';

interface ContinuousDeploymentProps {
  repoUrl: string;
  repoName: string;
}

interface BuildSettings {
  runtime: string;
  baseDirectory: string;
  packageDirectory: string;
  buildCommand: string;
  publishDirectory: string;
  functionsDirectory: string;
  buildStatus: string;
}

interface DependencySettings {
  nodeVersion: string;
}

interface BranchSettings {
  productionBranch: string;
  branchDeploys: string;
  deployPreviews: string;
}

const ContinuousDeployment: React.FC<ContinuousDeploymentProps> = ({ 
  repoUrl,
  repoName
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  
  // Editing states
  const [isBuildSettingsEditing, setIsBuildSettingsEditing] = useState(false);
  const [isDependencyEditing, setIsDependencyEditing] = useState(false);
  const [isBranchSettingsEditing, setIsBranchSettingsEditing] = useState(false);
  
  // Initial build settings
  const [buildSettings, setBuildSettings] = useState<BuildSettings>({
    runtime: 'Next.js',
    baseDirectory: '/',
    packageDirectory: 'Not set',
    buildCommand: 'npm run build',
    publishDirectory: '.next',
    functionsDirectory: 'netlify/functions',
    buildStatus: 'Active'
  });

  // Initial dependency settings
  const [dependencySettings, setDependencySettings] = useState<DependencySettings>({
    nodeVersion: '22.x'
  });

  // Initial branch settings
  const [branchSettings, setBranchSettings] = useState<BranchSettings>({
    productionBranch: 'main',
    branchDeploys: 'None',
    deployPreviews: 'Any pull request against your production branch / branch deploy branches'
  });

  // Form states for editing
  const [editedBuildSettings, setEditedBuildSettings] = useState<BuildSettings>({...buildSettings});
  const [editedDependencySettings, setEditedDependencySettings] = useState<DependencySettings>({...dependencySettings});
  const [editedBranchSettings, setEditedBranchSettings] = useState<BranchSettings>({...branchSettings});

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Build Settings Handlers
  const handleConfigureBuildSettings = () => {
    setIsBuildSettingsEditing(true);
    setEditedBuildSettings({...buildSettings});
  };

  const handleCancelBuildEdit = () => {
    setIsBuildSettingsEditing(false);
  };

  const handleSaveBuildEdit = () => {
    setBuildSettings({...editedBuildSettings});
    setIsBuildSettingsEditing(false);
  };

  const handleBuildSettingChange = (field: keyof BuildSettings, value: string) => {
    setEditedBuildSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRuntimeChange = (event: SelectChangeEvent) => {
    handleBuildSettingChange('runtime', event.target.value);
  };

  // Dependency Settings Handlers
  const handleConfigureDependency = () => {
    setIsDependencyEditing(true);
    setEditedDependencySettings({...dependencySettings});
  };

  const handleCancelDependencyEdit = () => {
    setIsDependencyEditing(false);
  };

  const handleSaveDependencyEdit = () => {
    setDependencySettings({...editedDependencySettings});
    setIsDependencyEditing(false);
  };

  const handleDependencySettingChange = (field: keyof DependencySettings, value: string) => {
    setEditedDependencySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Branch Settings Handlers
  const handleConfigureBranchSettings = () => {
    setIsBranchSettingsEditing(true);
    setEditedBranchSettings({...branchSettings});
  };

  const handleCancelBranchEdit = () => {
    setIsBranchSettingsEditing(false);
  };

  const handleSaveBranchEdit = () => {
    setBranchSettings({...editedBranchSettings});
    setIsBranchSettingsEditing(false);
  };

  const handleBranchSettingChange = (field: keyof BranchSettings, value: string) => {
    setEditedBranchSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Build & deploy settings
      </Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Configuration for continuous deployment from a Git repository
        </Typography>
      </Box>
      
      {/* Repository Section - Using Card component */}
      <Card 
        title="Git Repository"
        subtitle={`Connected to ${repoName} repository`}
        icon={<GitHubIcon sx={{ color: '#004aad' }} />}
        badge={
          <Box 
            sx={{ 
              px: 1.5, 
              py: 0.5, 
              borderRadius: 1,
              bgcolor: 'rgba(0,74,173,0.1)',
              color: '#004aad',
              fontSize: '0.75rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LockIcon sx={{ mr: 0.5, fontSize: 14 }} />
            GitHub
          </Box>
        }
        sx={{ mb: 3 }}
        padding="medium"
      >
        <Typography variant="body1" paragraph>
          Your site is linked to a Git repository for continuous deployment.
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" sx={{ mr: 2, color: '#555', fontWeight: 500 }}>
            Current repository:
          </Typography>
          <Box 
            component="span" 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              color: '#004aad',
              fontWeight: 500
            }}
          >
            <LockIcon sx={{ mr: 1, fontSize: 18, color: '#555' }} />
            <Typography 
              component="span" 
              sx={{ 
                color: '#004aad',
                fontWeight: 500,
                textDecoration: 'none',
                '&:hover': { 
                  textDecoration: 'underline'
                }
              }}
            >
              {repoUrl}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <PrimaryButton
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleMenuClick}
          >
            Repository settings
          </PrimaryButton>
          <PrimaryButton
            variant="outlined"
            endIcon={<KeyboardArrowDownIcon />}
            onClick={handleMenuClick}
          >
            Actions
          </PrimaryButton>
        </Box>
        
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 1,
            sx: { boxShadow: '0px 1px 4px rgba(0,0,0,0.1)' }
          }}
        >
          <MenuItem onClick={handleMenuClose}>Update branch settings</MenuItem>
          <MenuItem onClick={handleMenuClose}>Reconnect repository</MenuItem>
          <MenuItem onClick={handleMenuClose}>Disconnect repository</MenuItem>
        </Menu>
      </Card>
      
      {/* Build Settings Section - Using Card component */}
      <Card 
        title="Build Settings"
        subtitle="Configure build options for your application"
        sx={{ mb: 3 }}
        padding="medium"
      >
        {isBuildSettingsEditing ? (
          <FormContainer>
            <FormControl fullWidth>
              <InputLabel id="runtime-label">Runtime</InputLabel>
              <Select
                labelId="runtime-label"
                id="runtime-select"
                value={editedBuildSettings.runtime}
                label="Runtime"
                onChange={handleRuntimeChange}
              >
                <MenuItem value="Next.js">Next.js</MenuItem>
                <MenuItem value="React">React</MenuItem>
                <MenuItem value="Vue">Vue</MenuItem>
                <MenuItem value="Angular">Angular</MenuItem>
                <MenuItem value="Node.js">Node.js</MenuItem>
              </Select>
            </FormControl>
            
            <MonospaceTextField
              label="Base directory"
              fullWidth
              value={editedBuildSettings.baseDirectory}
              onChange={(e) => handleBuildSettingChange('baseDirectory', e.target.value)}
            />
            
            <MonospaceTextField
              label="Package directory"
              fullWidth
              value={editedBuildSettings.packageDirectory !== 'Not set' ? editedBuildSettings.packageDirectory : ''}
              onChange={(e) => handleBuildSettingChange('packageDirectory', e.target.value || 'Not set')}
              placeholder="Not set"
            />
            
            <MonospaceTextField
              label="Build command"
              fullWidth
              value={editedBuildSettings.buildCommand}
              onChange={(e) => handleBuildSettingChange('buildCommand', e.target.value)}
            />
            
            <MonospaceTextField
              label="Publish directory"
              fullWidth
              value={editedBuildSettings.publishDirectory}
              onChange={(e) => handleBuildSettingChange('publishDirectory', e.target.value)}
            />
            
            <MonospaceTextField
              label="Functions directory"
              fullWidth
              value={editedBuildSettings.functionsDirectory}
              onChange={(e) => handleBuildSettingChange('functionsDirectory', e.target.value)}
            />
            
            <FormControl fullWidth>
              <InputLabel id="build-status-label">Build status</InputLabel>
              <Select
                labelId="build-status-label"
                id="build-status-select"
                value={editedBuildSettings.buildStatus}
                label="Build status"
                onChange={(e) => handleBuildSettingChange('buildStatus', e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Paused">Paused</MenuItem>
              </Select>
            </FormControl>

            <ActionButtons
              onCancel={handleCancelBuildEdit}
              onSave={handleSaveBuildEdit}
              saveText="Save changes"
            />
          </FormContainer>
        ) : (
          <>
            <InfoGrid
              items={[
                { label: 'Runtime', value: buildSettings.runtime },
                { label: 'Base directory', value: buildSettings.baseDirectory, monospace: true },
                { 
                  label: 'Package directory', 
                  value: buildSettings.packageDirectory,
                  color: buildSettings.packageDirectory === 'Not set' ? '#999' : 'inherit'
                },
                { label: 'Build command', value: buildSettings.buildCommand, monospace: true },
                { label: 'Publish directory', value: buildSettings.publishDirectory, monospace: true },
                { label: 'Functions directory', value: buildSettings.functionsDirectory, monospace: true },
                { 
                  label: 'Build status', 
                  value: buildSettings.buildStatus,
                  color: buildSettings.buildStatus === 'Active' ? '#4caf50' : '#f44336'
                }
              ]}
            />
            
            <Link 
              href="#" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                color: '#2ebc4f', 
                textDecoration: 'none',
                fontWeight: 500,
                mb: 3,
                '&:hover': { 
                  textDecoration: 'underline'
                }
              }}
            >
              Learn more about configuring builds in the docs
              <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 18 }} />
            </Link>
            
            <PrimaryButton onClick={handleConfigureBuildSettings}>
              Configure
            </PrimaryButton>
          </>
        )}
      </Card>
      
      {/* Dependency Management Section - Using Card component */}
      <Card 
        title="Dependency Management"
        subtitle="Configure software versions for your build environment"
        sx={{ mb: 3 }}
        padding="medium"
      >
        <Typography variant="body1" paragraph>
          Manage the software and tool versions installed in the build environment for your site.
        </Typography>
        
        {isDependencyEditing ? (
          <FormContainer>
            <FormControl fullWidth>
              <InputLabel id="node-version-label">Node.js Version</InputLabel>
              <Select
                labelId="node-version-label"
                id="node-version-select"
                value={editedDependencySettings.nodeVersion}
                label="Node.js Version"
                onChange={(e) => handleDependencySettingChange('nodeVersion', e.target.value)}
              >
                <MenuItem value="18.x">18.x</MenuItem>
                <MenuItem value="20.x">20.x</MenuItem>
                <MenuItem value="22.x">22.x</MenuItem>
              </Select>
            </FormControl>

            <ActionButtons
              onCancel={handleCancelDependencyEdit}
              onSave={handleSaveDependencyEdit}
            />
          </FormContainer>
        ) : (
          <>
            <InfoGrid
              items={[
                { label: 'Node.js', value: dependencySettings.nodeVersion }
              ]}
            />
            
            <Link 
              href="#" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                color: '#2ebc4f', 
                textDecoration: 'none',
                fontWeight: 500,
                mb: 3,
                '&:hover': { 
                  textDecoration: 'underline'
                }
              }}
            >
              Learn more about dependency management in the docs
              <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 18 }} />
            </Link>
            
            <PrimaryButton onClick={handleConfigureDependency}>
              Configure
            </PrimaryButton>
          </>
        )}
      </Card>
      
      {/* Branches and Deploy Contexts Section - Using Card component */}
      <Card 
        title="Branches and Deploy Contexts"
        subtitle="Configure deployments for different branches"
        sx={{ mb: 3 }}
        padding="medium"
      >
        <Typography variant="body1" paragraph>
          Deploy contexts are branch-based environments that enable you to configure builds 
          depending on the context. This includes production and preview environments.
        </Typography>
        
        {isBranchSettingsEditing ? (
          <FormContainer>
            <TextField
              label="Production branch"
              fullWidth
              value={editedBranchSettings.productionBranch}
              onChange={(e) => handleBranchSettingChange('productionBranch', e.target.value)}
            />
            
            <FormControl component="fieldset">
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Branch deploys</Typography>
              <RadioGroup
                value={editedBranchSettings.branchDeploys}
                onChange={(e) => handleBranchSettingChange('branchDeploys', e.target.value)}
              >
                <FormControlLabel 
                  value="All" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body1">All</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Deploy all the branches pushed to the repository.
                      </Typography>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="None" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body1">None</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Deploy only the production branch.
                      </Typography>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="Let me add individual branches" 
                  control={<Radio />} 
                  label="Let me add individual branches" 
                />
              </RadioGroup>
            </FormControl>
            
            <FormControl component="fieldset">
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Deploy Previews</Typography>
              <RadioGroup
                value={editedBranchSettings.deployPreviews}
                onChange={(e) => handleBranchSettingChange('deployPreviews', e.target.value)}
              >
                <FormControlLabel 
                  value="Any pull request against your production branch / branch deploy branches" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body1">Any pull request against your production branch / branch deploy branches</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Netlify will generate a deploy preview with a unique URL for each built pull request.
                      </Typography>
                    </Box>
                  } 
                />
                <FormControlLabel 
                  value="None" 
                  control={<Radio />} 
                  label={
                    <Box>
                      <Typography variant="body1">None</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Netlify won't build deploy previews for any pull requests.
                      </Typography>
                    </Box>
                  } 
                />
              </RadioGroup>
            </FormControl>

            <ActionButtons
              onCancel={handleCancelBranchEdit}
              onSave={handleSaveBranchEdit}
            />
          </FormContainer>
        ) : (
          <>
            <InfoGrid
              items={[
                { label: 'Production branch', value: branchSettings.productionBranch },
                { 
                  label: 'Branch deploys', 
                  value: branchSettings.branchDeploys === 'None' ? 'Deploy only the production branch' : branchSettings.branchDeploys 
                },
                { label: 'Deploy Previews', value: branchSettings.deployPreviews }
              ]}
            />
            
            <Link 
              href="#" 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                color: '#2ebc4f', 
                textDecoration: 'none',
                fontWeight: 500,
                mb: 3,
                '&:hover': { 
                  textDecoration: 'underline'
                }
              }}
            >
              Learn more about branches and deploys in the docs
              <ArrowForwardIcon sx={{ ml: 0.5, fontSize: 18 }} />
            </Link>
            
            <PrimaryButton onClick={handleConfigureBranchSettings}>
              Configure
            </PrimaryButton>
          </>
        )}
      </Card>
    </Box>
  );
};

export default ContinuousDeployment;