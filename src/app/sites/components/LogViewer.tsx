import React, { useState } from 'react';
import { useTheme, useMediaQuery, Button as MuiButton } from '@mui/material';

// Import UI components
import {
  Box,
  Typography,
  LogsCard,
  LogSearchBar,
  LogControlBar,
  LogOutput,
  Divider
} from '@/components/ui';

interface LogViewerProps {
  siteName?: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ siteName = "Customer Segmentation" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [logSource, setLogSource] = useState<string>('Application');
  const [timeframeFilter, setTimeframeFilter] = useState<string>('Last hour');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  
  const handleLogSourceChange = (value: string) => {
    setLogSource(value);
  };
  
  const handleTimeframeChange = (value: string) => {
    setTimeframeFilter(value);
  };

  const handleDownload = () => {
    // Download logs functionality
  };

  const handleFilter = () => {
    // Filter functionality
  };

  const handleRefresh = () => {
    // Refresh functionality
  };

  // Sample log entries
  const logEntries = [
    { timestamp: '2025-05-01T12:23:47.967093+00:00', source: 'app[web.1]', message: '', level: 'info' },
    { timestamp: '2025-05-01T12:23:47.967107+00:00', source: 'app[web.1]', message: '> citizendeveloper@1.0.0 start', level: 'info' },
    { timestamp: '2025-05-01T12:23:47.967129+00:00', source: 'app[web.1]', message: '> node server.js', level: 'info' },
    { timestamp: '2025-05-01T12:23:47.967129+00:00', source: 'app[web.1]', message: '', level: 'info' },
    { timestamp: '2025-05-01T12:23:48.719859+00:00', source: 'app[web.1]', message: '(node:21) [MONGODB DRIVER] Warning: useNewUrlParser is a deprecated option: useNewUrlParser has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version', level: 'warning' },
    { timestamp: '2025-05-01T12:23:48.719873+00:00', source: 'app[web.1]', message: '(Use `node --trace-warnings ...` to show where the warning was created)', level: 'info' },
    { timestamp: '2025-05-01T12:23:48.720325+00:00', source: 'app[web.1]', message: '(node:21) [MONGODB DRIVER] Warning: useUnifiedTopology is a deprecated option: useUnifiedTopology has no effect since Node.js Driver version 4.0.0 and will be removed in the next major version', level: 'warning' },
    { timestamp: '2025-05-01T12:23:48.721115+00:00', source: 'app[web.1]', message: 'Server running on port 15935', level: 'info' },
    { timestamp: '2025-05-01T12:23:49.120523+00:00', source: 'app[web.1]', message: 'MongoDB connected successfully', level: 'info' },
    { timestamp: '2025-05-01T12:23:49.143690+00:00', source: 'heroku[web.1]', message: 'State changed from starting to up', level: 'success' },
  ];

  const logSourceOptions = [
    { value: 'Application', label: 'Application' },
    { value: 'Build', label: 'Build' },
    { value: 'Deployment', label: 'Deployment' },
    { value: 'System', label: 'System' }
  ];

  const timeRangeOptions = [
    { value: 'Last hour', label: 'Last hour' },
    { value: 'Last 24 hours', label: 'Last 24 hours' },
    { value: 'Last 7 days', label: 'Last 7 days' },
    { value: 'Custom', label: 'Custom range' }
  ];

  return (
    <Box sx={{ mb: 4, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1, fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
        Application Logs
      </Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          View and analyze logs from your application
        </Typography>
      </Box>
      
      {/* Logs Section */}
      <LogsCard
        title={`${logSource} Logs`}
        subtitle={`Real-time logs from your ${siteName} site`}
        logSource={logSource}
        onLogSourceChange={handleLogSourceChange}
        logSourceOptions={logSourceOptions}
        onDownload={handleDownload}
        responsive
      >
        {/* Search and Filter */}
        <Box sx={{ mb: 3 }}>
          <LogSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search logs..."
            onFilter={handleFilter}
            onRefresh={handleRefresh}
            responsive
          />
          
          <LogControlBar
            timeRange={timeframeFilter}
            onTimeRangeChange={handleTimeframeChange}
            autoScroll={autoScroll}
            onAutoScrollChange={setAutoScroll}
            timeRangeOptions={timeRangeOptions}
            responsive
          />
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Log Output */}
        <LogOutput
          entries={logEntries}
          height="400px"
          responsive
        />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mt: 2,
          gap: { xs: 1, sm: 2 },
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <MuiButton
            variant="text"
            onClick={() => {}}
            sx={{
              color: '#004aad',
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            View All Processes
          </MuiButton>
          <MuiButton
            variant="text"
            onClick={() => {}}
            sx={{
              color: '#004aad',
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Save
          </MuiButton>
        </Box>
      </LogsCard>
    </Box>
  );
};

export default LogViewer; 