import React from 'react';
import { 
  TextField, 
  TextFieldProps, 
  FormControl, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  InputAdornment,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export interface MonospaceTextFieldProps extends Omit<TextFieldProps, 'InputProps'> {
  InputProps?: TextFieldProps['InputProps'];
  responsive?: boolean;
}

export interface ResourceSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  minWidth?: number;
  responsive?: boolean;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  responsive?: boolean;
}

export const MonospaceTextField: React.FC<MonospaceTextFieldProps> = ({
  InputProps,
  responsive = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <TextField
      {...props}
      InputProps={{
        sx: { 
          fontFamily: 'monospace',
          fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
          '& .MuiInputBase-input': {
            py: shouldBeMobile ? 1 : 1.25
          },
          ...InputProps?.sx
        },
        ...InputProps
      }}
    />
  );
};

export const ResourceSelector: React.FC<ResourceSelectorProps> = ({
  value,
  onChange,
  options,
  minWidth = 140,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl 
      variant="standard" 
      size="small" 
      sx={{ 
        minWidth: shouldBeMobile ? 120 : minWidth,
        width: shouldBeMobile ? '100%' : 'auto'
      }}
    >
      <Select
        value={value}
        onChange={handleChange}
        displayEmpty
        sx={{ 
          fontSize: shouldBeMobile ? '0.875rem' : '1rem',
          '& .MuiSelect-select': {
            py: shouldBeMobile ? 0.75 : 1
          }
        }}
      >
        {options.map((option) => (
          <MenuItem 
            key={option.value} 
            value={option.value}
            sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  fullWidth = true,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <TextField
      fullWidth={fullWidth}
      placeholder={placeholder}
      variant="outlined"
      size={shouldBeMobile ? "small" : "small"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize={shouldBeMobile ? "small" : "small"} />
          </InputAdornment>
        ),
        sx: {
          py: shouldBeMobile ? 0.75 : 1
        }
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: shouldBeMobile ? 1 : 1,
          fontSize: shouldBeMobile ? '0.875rem' : '1rem'
        },
        '& .MuiInputBase-input': {
          fontSize: shouldBeMobile ? '0.875rem' : '1rem'
        }
      }}
    />
  );
}; 