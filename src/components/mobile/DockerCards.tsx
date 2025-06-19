import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayIcon,
  StopIcon,
  DeleteIcon,
  EditIcon,
  StorageIcon,
  UploadIcon
} from '@/components/ui';
import { ResourceMetrics } from '@/components/ui';

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: 'Running' | 'Stopped' | 'Exited' | 'Created';
  ports: string;
  created: string;
  size: string;
  cpu: string;
  memory: string;
}

interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
  usedBy: string[];
}

interface DockerVolumeMount {
  name: string;
  mountPath: string;
  size: string;
  type: string;
}

interface ContainerCardProps {
  container: DockerContainer;
}

interface ImageCardProps {
  image: DockerImage;
}

interface VolumeCardProps {
  volume: DockerVolumeMount;
}

// Get status chip based on container status
const getStatusChip = (status: string) => {
  let color = '';
  let bgcolor = '';
  
  switch(status) {
    case 'Running':
      color = '#2e7d32';
      bgcolor = '#e8f5e9';
      break;
    case 'Stopped':
      color = '#ed6c02';
      bgcolor = '#fff3e0';
      break;
    case 'Exited':
      color = '#d32f2f';
      bgcolor = '#ffebee';
      break;
    case 'Created':
      color = '#0288d1';
      bgcolor = '#e1f5fe';
      break;
    default:
      color = '#757575';
      bgcolor = '#f5f5f5';
  }
  
  return (
    <Chip 
      label={status} 
      size="small"
      sx={{ 
        color,
        bgcolor,
        fontWeight: 500,
        fontSize: '0.75rem'
      }}
    />
  );
};

export const ContainerCard: React.FC<ContainerCardProps> = ({ container }) => (
  <Box sx={{ 
    p: { xs: 1.5, sm: 2 }, 
    border: '1px solid #e0e0e0', 
    borderRadius: 2, 
    mb: 2,
    bgcolor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
          {container.name}
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem' }}>
          {container.id.substring(0, 12)}
        </Typography>
      </Box>
      {getStatusChip(container.status)}
    </Box>
    
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
        Image: <span style={{ fontFamily: 'monospace' }}>{container.image}</span>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
        Ports: <span style={{ fontFamily: 'monospace' }}>{container.ports}</span>
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
        Created: {container.created}
      </Typography>
    </Box>
    
    <Box sx={{ mb: 1.5 }}>
      <ResourceMetrics memory={container.memory} cpu={container.cpu} responsive />
    </Box>
    
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
      <Tooltip title={container.status === 'Running' ? 'Stop container' : 'Start container'}>
        <IconButton 
          size="small" 
          onClick={() => console.log(`${container.status === 'Running' ? 'Stop' : 'Start'} container ${container.name}`)}
          sx={{ color: container.status === 'Running' ? '#d32f2f' : '#2e7d32' }}
        >
          {container.status === 'Running' ? <StopIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
      <Tooltip title="Edit container">
        <IconButton 
          size="small" 
          onClick={() => console.log(`Edit container ${container.name}`)}
          sx={{ color: '#555' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete container">
        <IconButton 
          size="small" 
          onClick={() => console.log(`Delete container ${container.name}`)}
          sx={{ color: '#d32f2f' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

export const ImageCard: React.FC<ImageCardProps> = ({ image }) => (
  <Box sx={{ 
    p: { xs: 1.5, sm: 2 }, 
    border: '1px solid #e0e0e0', 
    borderRadius: 2, 
    mb: 2,
    bgcolor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
          {image.repository}
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem' }}>
          {image.id.substring(7, 19)}
        </Typography>
      </Box>
      <Chip 
        label={image.tag} 
        size="small"
        sx={{ 
          bgcolor: '#f5f5f5',
          fontWeight: 500,
          fontSize: '0.75rem'
        }}
      />
    </Box>
    
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
        Size: {image.size}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
        Created: {image.created}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
        {image.usedBy.length > 0 ? (
          image.usedBy.map((container, idx) => (
            <Chip 
              key={idx}
              label={container} 
              size="small"
              sx={{ 
                bgcolor: 'rgba(0, 74, 173, 0.1)',
                color: '#004aad',
                fontSize: '0.7rem',
                height: '20px'
              }}
            />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            No containers using this image
          </Typography>
        )}
      </Box>
    </Box>
    
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
      <Tooltip title="Push image">
        <IconButton 
          size="small" 
          onClick={() => console.log(`Push image ${image.repository}:${image.tag}`)}
          sx={{ color: '#555' }}
        >
          <UploadIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete image">
        <IconButton 
          size="small" 
          onClick={() => console.log(`Delete image ${image.repository}:${image.tag}`)}
          sx={{ color: '#d32f2f' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);

export const VolumeCard: React.FC<VolumeCardProps> = ({ volume }) => (
  <Box sx={{ 
    p: { xs: 1.5, sm: 2 }, 
    border: '1px solid #e0e0e0', 
    borderRadius: 2, 
    mb: 2,
    bgcolor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
          {volume.name}
        </Typography>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem' }}>
          {volume.mountPath}
        </Typography>
      </Box>
      <Chip 
        label={volume.type} 
        size="small"
        sx={{ 
          bgcolor: volume.type === 'persistent' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(237, 108, 2, 0.1)',
          color: volume.type === 'persistent' ? '#2e7d32' : '#ed6c02',
          fontWeight: 500,
          fontSize: '0.75rem'
        }}
      />
    </Box>
    
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
        Size: {volume.size}
      </Typography>
    </Box>
    
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
      <Tooltip title="Manage volume">
        <IconButton 
          size="small" 
          onClick={() => console.log(`Manage volume ${volume.name}`)}
          sx={{ color: '#555' }}
        >
          <StorageIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Delete volume">
        <IconButton 
          size="small" 
          onClick={() => console.log(`Delete volume ${volume.name}`)}
          sx={{ color: '#d32f2f' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  </Box>
);