import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';

export interface CodeBlockProps {
  code: string;
  language?: string;
  showCopy?: boolean;
  onCopy?: (code: string) => void;
  maxHeight?: string | number;
  backgroundColor?: string;
  responsive?: boolean;
}

export interface EditableCodeBlockProps {
  code: string;
  onChange: (code: string) => void;
  language?: string;
  placeholder?: string;
  maxHeight?: string | number;
  backgroundColor?: string;
  readOnly?: boolean;
  responsive?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  showCopy = true,
  onCopy,
  maxHeight,
  backgroundColor = '#f5f5f5',
  responsive = true
}) => {
  const [copied, setCopied] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.(code);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: shouldBeMobile ? 1.5 : 2, 
        bgcolor: backgroundColor, 
        borderRadius: shouldBeMobile ? 1 : 1, 
        mb: shouldBeMobile ? 1.5 : 2,
        position: 'relative',
        maxHeight,
        overflow: 'auto'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: shouldBeMobile ? 'flex-start' : 'center', 
        justifyContent: 'space-between',
        flexDirection: shouldBeMobile ? 'column' : 'row',
        gap: shouldBeMobile ? 1 : 0
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            fontFamily: 'monospace', 
            fontSize: shouldBeMobile ? '0.75rem' : '0.8rem',
            flex: 1,
            pr: showCopy && !shouldBeMobile ? 1 : 0,
            wordBreak: 'break-all',
            lineHeight: shouldBeMobile ? 1.4 : 1.5
          }}
        >
          {code}
        </Typography>
        {showCopy && (
          <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
            <IconButton 
              size={shouldBeMobile ? "small" : "small"} 
              onClick={handleCopy}
              sx={{ 
                alignSelf: shouldBeMobile ? 'flex-end' : 'center',
                mt: shouldBeMobile ? -0.5 : 0
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Paper>
  );
};

export const EditableCodeBlock: React.FC<EditableCodeBlockProps> = ({
  code,
  onChange,
  language,
  placeholder = 'Enter your code here...',
  maxHeight = '300px',
  backgroundColor = '#f8f9fa',
  readOnly = false,
  responsive = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(code);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const handleSave = () => {
    onChange(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(code);
    setIsEditing(false);
  };

  if (isEditing && !readOnly) {
    return (
      <Box sx={{ mb: shouldBeMobile ? 1.5 : 2 }}>
        <TextField
          multiline
          fullWidth
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          placeholder={placeholder}
          minRows={shouldBeMobile ? 8 : 10}
          maxRows={shouldBeMobile ? 15 : 20}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontFamily: 'monospace',
              fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
              backgroundColor,
              '& textarea': {
                lineHeight: shouldBeMobile ? 1.4 : 1.5
              }
            }
          }}
        />
        <Box sx={{ 
          mt: shouldBeMobile ? 1 : 1.5, 
          display: 'flex', 
          gap: shouldBeMobile ? 1 : 1.5,
          flexDirection: shouldBeMobile ? 'column-reverse' : 'row',
          justifyContent: shouldBeMobile ? 'stretch' : 'flex-end'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: shouldBeMobile ? '8px 16px' : '10px 20px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: shouldBeMobile ? '0.875rem' : '1rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: shouldBeMobile ? '8px 16px' : '10px 20px',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: '#004aad',
              color: 'white',
              cursor: 'pointer',
              fontSize: shouldBeMobile ? '0.875rem' : '1rem'
            }}
          >
            Save
          </button>
        </Box>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: shouldBeMobile ? 1.5 : 2, 
        bgcolor: backgroundColor, 
        borderRadius: shouldBeMobile ? 1 : 1, 
        mb: shouldBeMobile ? 1.5 : 2,
        position: 'relative',
        maxHeight,
        overflow: 'auto',
        cursor: readOnly ? 'default' : 'pointer'
      }}
      onClick={() => !readOnly && setIsEditing(true)}
    >
      <Typography 
        variant="body2" 
        sx={{ 
          fontFamily: 'monospace', 
          fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          lineHeight: shouldBeMobile ? 1.4 : 1.5,
          color: code ? 'inherit' : '#999'
        }}
      >
        {code || placeholder}
      </Typography>
    </Paper>
  );
}; 