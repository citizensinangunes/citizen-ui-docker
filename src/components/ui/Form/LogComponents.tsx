import React from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  IconButton,
  InputBase,
  Divider,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon, Refresh as RefreshIcon } from '@mui/icons-material';

export interface LogSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilter?: () => void;
  onRefresh?: () => void;
  responsive?: boolean;
}

export interface LogControlBarProps {
  timeRange: string;
  onTimeRangeChange: (value: string) => void;
  autoScroll: boolean;
  onAutoScrollChange: (checked: boolean) => void;
  timeRangeOptions: Array<{ value: string; label: string }>;
  responsive?: boolean;
}

export interface LogOutputProps {
  entries: Array<{
    timestamp: string;
    source: string;
    message: string;
    level: string;
  }>;
  height?: string;
  responsive?: boolean;
}

export const LogSearchBar: React.FC<LogSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search logs...',
  onFilter,
  onRefresh,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
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
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton sx={{ p: '10px' }} onClick={onFilter}>
        <FilterListIcon />
      </IconButton>
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton sx={{ p: '10px', color: '#004aad' }} onClick={onRefresh}>
        <RefreshIcon />
      </IconButton>
    </Box>
  );
};

export const LogControlBar: React.FC<LogControlBarProps> = ({
  timeRange,
  onTimeRangeChange,
  autoScroll,
  onAutoScrollChange,
  timeRangeOptions,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    onTimeRangeChange(event.target.value);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      flexDirection: shouldBeMobile ? 'column' : 'row',
      gap: shouldBeMobile ? 2 : 0
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        width: shouldBeMobile ? '100%' : 'auto'
      }}>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Time range:
        </Typography>
        
        <FormControl variant="standard" size="small" sx={{ minWidth: 120 }}>
          <Select
            value={timeRange}
            onChange={handleTimeRangeChange}
            displayEmpty
            sx={{ fontSize: '0.875rem' }}
          >
            {timeRangeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <FormControlLabel
        control={
          <Checkbox 
            checked={autoScroll}
            onChange={(e) => onAutoScrollChange(e.target.checked)}
            sx={{ 
              color: '#004aad',
              '&.Mui-checked': {
                color: '#004aad',
              },
            }}
          />
        }
        label="Autoscroll with output"
        sx={{ 
          '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
          width: shouldBeMobile ? '100%' : 'auto'
        }}
      />
    </Box>
  );
};

export const LogOutput: React.FC<LogOutputProps> = ({
  entries,
  height = '400px',
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box 
      sx={{ 
        fontFamily: 'monospace',
        fontSize: shouldBeMobile ? '0.75rem' : '0.85rem',
        bgcolor: '#f8f8f8',
        p: shouldBeMobile ? 1.5 : 2,
        borderRadius: 1,
        height: shouldBeMobile ? '300px' : height,
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        '& .log-timestamp': {
          color: '#888'
        },
        '& .log-source': {
          color: '#0366d6'
        },
        '& .log-warning': {
          color: '#e67e22'
        },
        '& .log-success': {
          color: '#27ae60'
        },
        '& .log-info': {
          color: '#333'
        },
        '& .log-entry': {
          mb: 0.5,
          display: 'block'
        }
      }}
    >
      {entries.map((entry, index) => (
        <Box key={index} className="log-entry">
          <Box component="span" className="log-timestamp">{entry.timestamp} </Box>
          <Box 
            component="span" 
            className="log-source"
            sx={{
              color: entry.source.includes('heroku') ? '#e67e22' : '#0366d6'
            }}
          >
            {entry.source}
          </Box>
          <Box 
            component="span" 
            className={`log-${entry.level}`}
          >
            : {entry.message}
          </Box>
        </Box>
      ))}
    </Box>
  );
}; 