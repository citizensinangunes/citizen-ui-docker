import React from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery
} from '@mui/material';

export interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitText?: string;
  cancelText?: string;
  submitDisabled?: boolean;
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const FormModal: React.FC<FormModalProps> = ({
  open,
  title,
  onClose,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitDisabled = false,
  children,
  maxWidth = 'sm',
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: shouldBeMobile ? 1 : 2,
          m: shouldBeMobile ? 1 : 3
        }
      }}
    >
      <DialogTitle sx={{ 
        fontSize: shouldBeMobile ? '1.125rem' : '1.25rem',
        fontWeight: 500,
        p: shouldBeMobile ? 2 : 3
      }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ p: shouldBeMobile ? 2 : 3, pt: shouldBeMobile ? 1 : 2 }}>
        {children}
      </DialogContent>
      <DialogActions sx={{ 
        p: shouldBeMobile ? 2 : 3, 
        pt: shouldBeMobile ? 1 : 2,
        gap: shouldBeMobile ? 1 : 2,
        flexDirection: shouldBeMobile ? 'column-reverse' : 'row'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: shouldBeMobile ? '10px 20px' : '12px 24px',
            border: '1px solid #004aad',
            borderRadius: '6px',
            backgroundColor: 'transparent',
            color: '#004aad',
            cursor: 'pointer',
            fontSize: shouldBeMobile ? '0.875rem' : '1rem',
            fontWeight: 500,
            width: shouldBeMobile ? '100%' : 'auto'
          }}
        >
          {cancelText}
        </button>
        <button
          onClick={onSubmit}
          disabled={submitDisabled}
          style={{
            padding: shouldBeMobile ? '10px 20px' : '12px 24px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: submitDisabled ? '#ccc' : '#004aad',
            color: 'white',
            cursor: submitDisabled ? 'not-allowed' : 'pointer',
            fontSize: shouldBeMobile ? '0.875rem' : '1rem',
            fontWeight: 500,
            width: shouldBeMobile ? '100%' : 'auto'
          }}
        >
          {submitText}
        </button>
      </DialogActions>
    </Dialog>
  );
}; 