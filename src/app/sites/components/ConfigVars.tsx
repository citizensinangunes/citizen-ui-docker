import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import { 
  CollapsibleCard, 
  KeyValueRow, 
  TableHeader, 
  MonospaceTextField,
  useNotification
} from '@/components/ui';

interface ConfigVar {
  key: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ConfigVarsProps {
  siteId: string | number;
  isAdmin?: boolean;
}

const ConfigVars: React.FC<ConfigVarsProps> = ({ 
  siteId,
  isAdmin = true 
}) => {
  console.log("ConfigVars component - Received siteId:", siteId, "Type:", typeof siteId);
  const [expanded, setExpanded] = useState(true);
  const [vars, setVars] = useState<ConfigVar[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingVar, setEditingVar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { notification, showSuccess, showError, showInfo, hideNotification } = useNotification();

  useEffect(() => {
    const fetchConfigVars = async () => {
      try {
        setLoading(true);
        console.log(`Fetching config vars for site ID: ${siteId}`);
        const response = await fetch(`/api/sites/${siteId.toString()}/config-vars`);
        
        if (!response.ok) {
          console.error(`API Error Status: ${response.status}, Status Text: ${response.statusText}`);
          const errorData = await response.json().catch(() => null);
          console.error('Error data:', errorData);
          throw new Error(`Config variables yüklenirken bir hata oluştu: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched config vars:', data);
        setVars(data.configVars || []);
        setError(null);
      } catch (err: any) {
        console.error('Config variables alınırken hata:', err);
        setError(`Config variables yüklenirken bir hata oluştu. Lütfen tekrar deneyin. Hata: ${err?.message || 'Bilinmeyen hata'}`);
      } finally {
        setLoading(false);
      }
    };

    if (siteId) {
      fetchConfigVars();
    }
  }, [siteId]);

  const handleAddVar = async () => {
    if (newKey.trim() === '') return;
    
    try {
      const response = await fetch(`/api/sites/${siteId.toString()}/config-vars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: newKey, value: newValue }),
      });
      
      if (!response.ok) {
        throw new Error('Config variable eklenirken bir hata oluştu');
      }
      
      const data = await response.json();
      setVars([...vars, data.configVar]);
      setNewKey('');
      setNewValue('');
      showSuccess('Config variable başarıyla eklendi');
    } catch (err) {
      console.error('Config variable eklenirken hata:', err);
      showError('Config variable eklenirken bir hata oluştu');
    }
  };

  const handleDeleteVar = async (keyToDelete: string) => {
    try {
      const response = await fetch(`/api/sites/${siteId.toString()}/config-vars?key=${encodeURIComponent(keyToDelete)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Config variable silinirken bir hata oluştu');
      }
      
      setVars(vars.filter(v => v.key !== keyToDelete));
      showSuccess('Config variable başarıyla silindi');
    } catch (err) {
      console.error('Config variable silinirken hata:', err);
      showError('Config variable silinirken bir hata oluştu');
    }
  };

  const handleEditVar = async (key: string, newValue: string) => {
    try {
      const response = await fetch(`/api/sites/${siteId}/config-vars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value: newValue }),
      });
      
      if (!response.ok) {
        throw new Error('Config variable güncellenirken bir hata oluştu');
      }
      
      const data = await response.json();
      setVars(vars.map(v => v.key === key ? data.configVar : v));
      setEditingVar(null);
      showSuccess('Config variable başarıyla güncellendi');
    } catch (err) {
      console.error('Config variable güncellenirken hata:', err);
      showError('Config variable güncellenirken bir hata oluştu');
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showInfo('Panoya kopyalandı');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Tekrar Dene
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
          Config Vars
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Config vars change the way your app behaves.
          In addition to creating your own, some add-ons come with their own.
        </Typography>
      </Box>

      <CollapsibleCard
        title="Environment Variables"
        subtitle={`${vars.length} variables defined`}
        icon={<CodeIcon sx={{ color: '#004aad' }} />}
        defaultExpanded={expanded}
        expandButtonText={{
          expanded: 'Hide Config Vars',
          collapsed: 'Show Config Vars'
        }}
        onToggle={setExpanded}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" fontWeight={500}>
              Environment Variables
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{
                borderColor: '#004aad',
                color: '#004aad',
                '&:hover': { borderColor: '#003a87', bgcolor: 'rgba(0,74,173,0.04)' }
              }}
              onClick={() => window.scrollTo(0, document.body.scrollHeight)}
            >
              Add Variable
            </Button>
          </Box>

          <TableHeader 
            columns={[
              { label: 'Key', width: '45%' },
              { label: 'Value', width: '55%' }
            ]} 
          />

          {vars.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No config variables defined yet.
              </Typography>
            </Box>
          ) : (
            vars.map((configVar, index) => (
              <KeyValueRow
                key={`${configVar.key}-${index}`}
                keyName={configVar.key}
                value={configVar.value}
                isEditing={editingVar === configVar.key}
                isLast={index === vars.length - 1}
                onEdit={setEditingVar}
                onSave={handleEditVar}
                onDelete={handleDeleteVar}
                onCopy={handleCopyToClipboard}
                onStopEditing={() => setEditingVar(null)}
              />
            ))
          )}

          {/* Add new variable section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
              Add New Config Var
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <MonospaceTextField
                label="KEY"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 1 }}
              />
              <MonospaceTextField
                label="VALUE"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleAddVar}
                disabled={!newKey.trim()}
                sx={{ 
                  bgcolor: '#004aad',
                  color: 'white',
                  '&:hover': { bgcolor: '#003a87' },
                  fontWeight: 500
                }}
              >
                Add
              </Button>
            </Box>
          </Box>
        </Box>
      </CollapsibleCard>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={notification.severity}
          onClose={hideNotification}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ConfigVars; 