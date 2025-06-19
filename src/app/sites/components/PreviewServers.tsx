import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  InputBase,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import CodeIcon from '@mui/icons-material/Code';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface PreviewServer {
  id: string;
  branch: string;
  status: 'Running' | 'Stopped' | 'Starting' | 'Failed';
  lastUpdated: string;
  command?: string;
  targetPort?: string;
  size?: string;
  autoShutdown?: boolean;
}

interface PreviewServersProps {
  siteName: string;
  servers?: PreviewServer[];
}

const PreviewServers: React.FC<PreviewServersProps> = ({ 
  siteName,
  servers = [
    {
      id: 'main@HEAD',
      branch: 'main',
      status: 'Stopped',
      lastUpdated: 'Apr 29 at 3:48 PM',
      command: '',
      targetPort: '',
      size: '1 vCPU, 4 GB RAM, 20 GB Storage',
      autoShutdown: true
    },
    {
      id: 'main@HEAD',
      branch: 'upgrade ui',
      status: 'Stopped',
      lastUpdated: 'Apr 29 at 3:29 PM',
      autoShutdown: false
    }
  ] 
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('Any status');
  const [timeframeFilter, setTimeframeFilter] = useState<string>('Any time frame');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
  };
  
  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframeFilter(event.target.value);
  };

  return (
    <Box sx={{ mb: 4, px: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Preview Servers
      </Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Manage preview servers for testing and staging environments
        </Typography>
      </Box>
      
      {/* Server Settings Section */}
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
          {/* Server Settings Header */}
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
                Preview Server Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure how your preview servers run
              </Typography>
            </Box>
          </Box>
          
          {/* Server Settings Content */}
          <Box sx={{ p: 3 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Configure how Netlify CLI runs your site in the Preview Server. By default, it uses the same
              settings as when running locally on your machine.
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2, mb: 2 }}>
              <Typography variant="body1" sx={{ color: '#555', fontWeight: 500 }}>
                Preview Server command:
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                {servers[0].command || 'Not set'}
              </Typography>
              
              <Typography variant="body1" sx={{ color: '#555', fontWeight: 500 }}>
                Target port:
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                {servers[0].targetPort || 'Not set'}
              </Typography>
              
              <Typography variant="body1" sx={{ color: '#555', fontWeight: 500 }}>
                Preview Server size:
              </Typography>
              <Typography variant="body1" sx={{ color: '#666' }}>
                {servers[0].size || '1 vCPU, 4 GB RAM, 20 GB Storage'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 4 }}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#004aad',
                  color: 'white',
                  '&:hover': { bgcolor: '#003a87' },
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  mr: 2
                }}
              >
                Configure
              </Button>
              
              <Button
                variant="text"
                endIcon={<ChevronRightIcon />}
                sx={{ 
                  color: '#2ebc4f',
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                  fontWeight: 500
                }}
              >
                Learn more about configuring the Netlify CLI
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
      
      {/* Server List Section */}
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
          {/* Server List Header */}
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
                Preview Servers for {siteName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and monitor your preview environments
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: '#004aad',
                  color: 'white',
                  '&:hover': { bgcolor: '#003a87' },
                  fontWeight: 500,
                  fontSize: '0.875rem'
                }}
              >
                Add new server
              </Button>
            </Box>
          </Box>
          
          {/* Server List Content */}
          <Box sx={{ p: 3 }}>
            {/* Search and Filter */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: '2px 4px', 
                width: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 2
              }}>
                <IconButton sx={{ p: '10px' }}>
                  <SearchIcon />
                </IconButton>
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
                  placeholder="Search by branch name or Preview Server ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Filter:
                </Typography>
                
                <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={statusFilter}
                    onChange={handleStatusChange}
                    displayEmpty
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="Any status">Any status</MenuItem>
                    <MenuItem value="Running">Running</MenuItem>
                    <MenuItem value="Stopped">Stopped</MenuItem>
                    <MenuItem value="Failed">Failed</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl variant="standard" size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={timeframeFilter}
                    onChange={handleTimeframeChange}
                    displayEmpty
                    sx={{ fontSize: '0.875rem' }}
                  >
                    <MenuItem value="Any time frame">Any time frame</MenuItem>
                    <MenuItem value="Last 24 hours">Last 24 hours</MenuItem>
                    <MenuItem value="Last 7 days">Last 7 days</MenuItem>
                    <MenuItem value="Last 30 days">Last 30 days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {/* Server List */}
            {servers.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {servers.map((server, index) => (
                  <Box 
                    key={index} 
                    sx={{
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': { bgcolor: '#f9f9f9' }
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body1" fontWeight={500} sx={{ mr: 1 }}>
                          Preview Server: <Box component="span" sx={{ fontFamily: 'monospace' }}>{server.id}</Box>
                        </Typography>
                        <Chip 
                          label={server.status} 
                          size="small"
                          sx={{ 
                            bgcolor: server.status === 'Running' ? '#e8f5e9' : '#f5f5f5',
                            color: server.status === 'Running' ? '#2e7d32' : '#666',
                            fontWeight: 500,
                            fontSize: '0.75rem'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {server.branch}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {server.lastUpdated}
                      </Typography>
                      {server.autoShutdown && (
                        <Typography variant="body2" color="text.secondary">
                          Auto-shutdown
                        </Typography>
                      )}
                      <IconButton sx={{ color: '#666' }}>
                        <ChevronRightIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                py: 4, 
                textAlign: 'center', 
                bgcolor: '#f9f9f9', 
                borderRadius: 1,
                border: '1px dashed #ccc'
              }}>
                <Typography variant="body1" color="text.secondary">
                  No preview servers found.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Create a new preview server to get started.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default PreviewServers; 