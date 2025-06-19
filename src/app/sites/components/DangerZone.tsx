import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {
  DangerCard,
  ConfirmDialog,
  DeleteConfirmDialog
} from '@/components/ui';

interface DangerZoneProps {
  siteName: string;
  siteEnabled: boolean;
  onToggleSiteEnabled: () => void;
  onDeleteSite: () => void;
}

const DangerZone: React.FC<DangerZoneProps> = ({ 
  siteName,
  siteEnabled = true,
  onToggleSiteEnabled,
  onDeleteSite
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      onDeleteSite();
      // Not closing dialog here as the parent component will redirect on success
    } catch (error) {
      setIsDeleting(false);
      
      // Hata mesajlarını daha anlaşılır hale getir
      let errorMessage = (error as Error).message || 'Silme işlemi başarısız oldu';
      
      // Özel hata mesajlarını dönüştür
      if (errorMessage.includes('foreign key constraint')) {
        errorMessage = 'Bu site başka kayıtlarla ilişkili olduğu için silinemiyor. Önce ilişkili kayıtları temizleyin.';
      } else if (errorMessage.includes('permission')) {
        errorMessage = 'Bu siteyi silmek için gerekli yetkiniz yok.';
      } else if (errorMessage.includes('bulunamadı') || errorMessage.includes('not found')) {
        errorMessage = 'Site bulunamadı veya zaten silinmiş olabilir.';
      }
      
      setDeleteError(errorMessage);
    }
  };
  
  const handleDisableConfirm = () => {
    setDisableDialogOpen(false);
    onToggleSiteEnabled();
  };

  const getSiteAvailabilityDescription = () => {
    if (siteEnabled) {
      return "Disabling your site makes it temporarily inaccessible on the web and will stop it from consuming bandwidth, functions, and other resources. You can re-enable your site anytime.";
    } else {
      return "Your site is currently disabled and not accessible on the web. Re-enabling it will restore all functions and make it accessible again.";
    }
  };

  const getSiteAvailabilityContent = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ mr: 1 }}>
          Your site is currently {siteEnabled ? 'enabled' : 'disabled'}.
        </Typography>
        {siteEnabled && (
          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" paragraph>
        {getSiteAvailabilityDescription()}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Danger zone
      </Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Critical actions that impact your site's availability
        </Typography>
      </Box>
      
      {/* Site Availability Section */}
      <DangerCard
        title="Site Availability"
        subtitle="Control whether your site is accessible"
        description=""
        buttonText={siteEnabled ? 'Disable site' : 'Enable site'}
        buttonColor={siteEnabled ? 'error' : 'success'}
        onButtonClick={() => setDisableDialogOpen(true)}
      >
        {getSiteAvailabilityContent()}
      </DangerCard>
      
      {/* Delete Site Section */}
      <DangerCard
        title="Delete Site"
        subtitle="Permanently remove this site and all its data"
        description="Once you delete a site, there is no going back."
        buttonText="Delete this site"
        buttonColor="error"
        onButtonClick={() => setDeleteDialogOpen(true)}
        icon={<DeleteForeverIcon />}
      />
      
      {/* Disable/Enable Confirmation Dialog */}
      <ConfirmDialog
        open={disableDialogOpen}
        title={siteEnabled ? 'Disable site?' : 'Enable site?'}
        message={
          siteEnabled 
            ? `Are you sure you want to disable ${siteName}? This will make your site temporarily inaccessible to visitors.`
            : `Are you sure you want to enable ${siteName}? This will make your site accessible to visitors again.`
        }
        confirmText={siteEnabled ? 'Disable' : 'Enable'}
        severity={siteEnabled ? 'error' : 'info'}
        onConfirm={handleDisableConfirm}
        onCancel={() => setDisableDialogOpen(false)}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Delete Site"
        itemName={siteName}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={isDeleting}
        error={deleteError}
      />
    </Box>
  );
};

export default DangerZone; 