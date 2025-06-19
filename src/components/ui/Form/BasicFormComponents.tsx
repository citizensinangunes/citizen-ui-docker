import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  TextFieldProps, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Select, 
  MenuItem, 
  SelectProps,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  OutlinedInput
} from '@mui/material';
import { Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

export interface FormFieldProps {
  label: string;
  description?: string;
  type?: 'text' | 'select' | 'radio';
  options?: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  textFieldProps?: Partial<TextFieldProps>;
  selectProps?: Partial<SelectProps>;
  required?: boolean;
  responsive?: boolean;
}

export interface GridFormFieldProps {
  label: string;
  children: React.ReactNode;
  responsive?: boolean;
}

export interface StaticGridFieldProps {
  label: string;
  value: string;
  responsive?: boolean;
}

export interface GridPasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  responsive?: boolean;
}

export interface FormContainerProps {
  children: React.ReactNode;
  gap?: number;
  direction?: 'row' | 'column';
  maxWidth?: string | number;
  padding?: number;
  responsive?: boolean;
}

export const GridFormField: React.FC<GridFormFieldProps> = ({
  label,
  children,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: shouldBeMobile ? '1fr' : '1fr 2fr',
      gap: shouldBeMobile ? 1 : 2,
      alignItems: shouldBeMobile ? 'flex-start' : 'center',
      mb: shouldBeMobile ? 2 : 3
    }}>
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ 
          fontSize: shouldBeMobile ? '0.875rem' : '1rem',
          fontWeight: 500
        }}
      >
        {label}
      </Typography>
      <Box sx={{ 
        fontSize: shouldBeMobile ? '0.875rem' : '1rem'
      }}>
        {children}
      </Box>
    </Box>
  );
};

export const StaticGridField: React.FC<StaticGridFieldProps> = ({
  label,
  value,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: shouldBeMobile ? '1fr' : '1fr 2fr',
      gap: shouldBeMobile ? 1 : 2,
      alignItems: shouldBeMobile ? 'flex-start' : 'center',
      mb: shouldBeMobile ? 2 : 3
    }}>
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ 
          fontSize: shouldBeMobile ? '0.875rem' : '1rem',
          fontWeight: 500
        }}
      >
        {label}
      </Typography>
      <Typography 
        variant="body1"
        sx={{ 
          fontSize: shouldBeMobile ? '0.875rem' : '1rem',
          fontWeight: 500,
          wordBreak: 'break-word'
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export const GridPasswordField: React.FC<GridPasswordFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <GridFormField label={label} responsive={responsive}>
      <FormControl fullWidth variant="outlined" size="small">
        <OutlinedInput
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
                size="small"
              >
                {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          }
          sx={{ 
            bgcolor: 'white',
            fontSize: shouldBeMobile ? '0.875rem' : '1rem'
          }}
        />
      </FormControl>
    </GridFormField>
  );
};

export const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  type = 'text',
  options = [],
  value = '',
  onChange,
  textFieldProps = {},
  selectProps = {},
  required = false,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const handleChange = (newValue: string) => {
    onChange?.(newValue);
  };

  const renderField = () => {
    switch (type) {
      case 'select':
        return (
          <Select
            value={value}
            onChange={(e) => handleChange(e.target.value as string)}
            fullWidth
            size={shouldBeMobile ? "small" : "small"}
            sx={{
              fontSize: shouldBeMobile ? '0.875rem' : '1rem',
              '& .MuiSelect-select': {
                py: shouldBeMobile ? 1 : 1.25
              }
            }}
            {...selectProps}
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
        );
      
      case 'radio':
        return (
          <RadioGroup
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: shouldBeMobile ? '0.875rem' : '1rem'
              }
            }}
          >
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio size={shouldBeMobile ? "small" : "small"} />}
                label={option.label}
                sx={{ mb: shouldBeMobile ? 0.5 : 1 }}
              />
            ))}
          </RadioGroup>
        );
      
      default:
        return (
          <TextField
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            fullWidth
            size={shouldBeMobile ? "small" : "small"}
            required={required}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: shouldBeMobile ? '0.875rem' : '1rem',
                py: shouldBeMobile ? 1 : 1.25
              }
            }}
            {...textFieldProps}
          />
        );
    }
  };

  return (
    <FormControl fullWidth sx={{ mb: shouldBeMobile ? 1.5 : 2 }}>
      <FormLabel sx={{ 
        mb: shouldBeMobile ? 0.75 : 1, 
        fontWeight: 500, 
        color: '#333',
        fontSize: shouldBeMobile ? '0.875rem' : '1rem'
      }}>
        {label}
        {required && <span style={{ color: '#f44336' }}> *</span>}
      </FormLabel>
      {renderField()}
      {description && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mt: shouldBeMobile ? 0.25 : 0.5,
            fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
          }}
        >
          {description}
        </Typography>
      )}
    </FormControl>
  );
};

export const FormContainer: React.FC<FormContainerProps> = ({
  children,
  gap = 2,
  direction = 'column',
  maxWidth,
  padding = 0,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap: shouldBeMobile ? Math.max(gap - 0.5, 1) : gap,
        maxWidth,
        p: shouldBeMobile ? Math.max(padding - 0.5, 0) : padding
      }}
    >
      {children}
    </Box>
  );
}; 