import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider,
  Chip,
  Switch,
  FormControlLabel,
  SelectChangeEvent,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  RefreshIcon,
  AddIcon,
  PlayIcon,
  StopIcon,
  DeleteIcon,
  EditIcon,
  StorageIcon,
  UploadIcon
} from '@/components/ui';
import { 
  Button, 
  Card, 
  DataTable, 
  ResourceSelector, 
  SearchBar, 
  ResourceMetrics,
  EditableCodeBlock,
  ActionButtons
} from '@/components/ui';
import { ContainerCard, ImageCard, VolumeCard } from '@/components/mobile';

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

interface DockerManagementProps {
  siteName: string;
}

// Mock containers data
const mockContainers: DockerContainer[] = [
  { 
    id: 'abc123def456', 
    name: 'customer-segment-app', 
    image: 'node:18-alpine',
    status: 'Running',
    ports: '3000:3000',
    created: '2 days ago',
    size: '345MB',
    cpu: '0.5%',
    memory: '128MB'
  },
  { 
    id: 'ghi789jkl012', 
    name: 'customer-segment-db', 
    image: 'mongo:latest',
    status: 'Running',
    ports: '27017:27017',
    created: '2 days ago',
    size: '650MB',
    cpu: '1.2%',
    memory: '512MB'
  },
  { 
    id: 'mno345pqr678', 
    name: 'customer-segment-cache', 
    image: 'redis:alpine',
    status: 'Running',
    ports: '6379:6379',
    created: '2 days ago',
    size: '110MB',
    cpu: '0.1%',
    memory: '64MB'
  },
  { 
    id: 'stu901vwx234', 
    name: 'customer-segment-test', 
    image: 'node:18-alpine',
    status: 'Stopped',
    ports: '3001:3000',
    created: '1 week ago',
    size: '345MB',
    cpu: '0%',
    memory: '0MB'
  }
];

// Mock images data
const mockImages: DockerImage[] = [
  {
    id: 'sha256:a1b2c3d4e5f6',
    repository: 'node',
    tag: '18-alpine',
    size: '128MB',
    created: '3 weeks ago',
    usedBy: ['customer-segment-app', 'customer-segment-test']
  },
  {
    id: 'sha256:g7h8i9j0k1l2',
    repository: 'mongo',
    tag: 'latest',
    size: '650MB',
    created: '1 month ago',
    usedBy: ['customer-segment-db']
  },
  {
    id: 'sha256:m3n4o5p6q7r8',
    repository: 'redis',
    tag: 'alpine',
    size: '32MB',
    created: '2 months ago',
    usedBy: ['customer-segment-cache']
  },
  {
    id: 'sha256:s9t0u1v2w3x4',
    repository: 'nginx',
    tag: 'latest',
    size: '142MB',
    created: '2 months ago',
    usedBy: []
  }
];

// Mock volumes data
const mockVolumes: DockerVolumeMount[] = [
  {
    name: 'customer-segment-mongo-data',
    mountPath: '/data/db',
    size: '2.5GB',
    type: 'persistent'
  },
  {
    name: 'customer-segment-redis-data',
    mountPath: '/data',
    size: '150MB',
    type: 'persistent'
  },
  {
    name: 'customer-segment-node-modules',
    mountPath: '/app/node_modules',
    size: '450MB',
    type: 'ephemeral'
  }
];

const DockerManagement: React.FC<DockerManagementProps> = ({ siteName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceView, setResourceView] = useState<string>('containers');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [dockerComposeContent, setDockerComposeContent] = useState(`version: '3.8'

services:
  app:
    container_name: customer-segment-app
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./:/app
      - customer-segment-node-modules:/app/node_modules
    ports:
      - "3000:3000"
    command: npm start
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://db:27017/customer_segment
      - REDIS_URI=redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    container_name: customer-segment-db
    image: mongo:latest
    volumes:
      - customer-segment-mongo-data:/data/db
    ports:
      - "27017:27017"

  cache:
    container_name: customer-segment-cache
    image: redis:alpine
    volumes:
      - customer-segment-redis-data:/data
    ports:
      - "6379:6379"

volumes:
  customer-segment-mongo-data:
  customer-segment-redis-data:
  customer-segment-node-modules:`);
  
  const handleResourceViewChange = (value: string) => {
    setResourceView(value);
  };

  const handleDockerComposeChange = (newContent: string) => {
    setDockerComposeContent(newContent);
  };

  // Resource selector options
  const resourceOptions = [
    { value: 'containers', label: 'Containers' },
    { value: 'images', label: 'Images' },
    { value: 'volumes', label: 'Volumes' }
  ];

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

  // Define table columns for containers
  const containerColumns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status', width: '120px' },
    { key: 'image', label: 'Image' },
    { key: 'ports', label: 'Ports', width: '150px' },
    { key: 'resources', label: 'Resources', width: '180px' },
    { key: 'created', label: 'Created', width: '120px' },
    { key: 'actions', label: '', width: '120px', align: 'right' as const }
  ];

  // Define table columns for images
  const imageColumns = [
    { key: 'repository', label: 'Repository' },
    { key: 'tag', label: 'Tag', width: '100px' },
    { key: 'imageId', label: 'Image ID', width: '150px' },
    { key: 'size', label: 'Size', width: '100px' },
    { key: 'created', label: 'Created', width: '120px' },
    { key: 'usedBy', label: 'Used By' },
    { key: 'actions', label: '', width: '80px', align: 'right' as const }
  ];

  // Define table columns for volumes
  const volumeColumns = [
    { key: 'name', label: 'Name' },
    { key: 'mountPath', label: 'Mount Path' },
    { key: 'type', label: 'Type', width: '120px' },
    { key: 'size', label: 'Size', width: '100px' },
    { key: 'actions', label: '', width: '80px', align: 'right' as const }
  ];

  // Render table cell content for containers
  const renderContainerCell = (key: string, value: any, row: DockerContainer) => {
    switch (key) {
      case 'name':
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.name}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem' }}>
              {row.id.substring(0, 12)}
            </Typography>
          </Box>
        );
      
      case 'status':
        return getStatusChip(row.status);
      
      case 'image':
        return (
          <Typography variant="body2">
            {row.image}
          </Typography>
        );
      
      case 'ports':
        return (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {row.ports}
          </Typography>
        );
      
      case 'resources':
        return <ResourceMetrics memory={row.memory} cpu={row.cpu} responsive />;
      
      case 'created':
        return (
          <Typography variant="body2">
            {row.created}
          </Typography>
        );
      
      case 'actions':
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={row.status === 'Running' ? 'Stop container' : 'Start container'}>
              <IconButton 
                size="small" 
                onClick={() => console.log(`${row.status === 'Running' ? 'Stop' : 'Start'} container ${row.name}`)}
                sx={{ color: row.status === 'Running' ? '#d32f2f' : '#2e7d32' }}
              >
                {row.status === 'Running' ? <StopIcon fontSize="small" /> : <PlayIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit container">
              <IconButton 
                size="small" 
                onClick={() => console.log(`Edit container ${row.name}`)}
                sx={{ color: '#555' }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete container">
              <IconButton 
                size="small" 
                onClick={() => console.log(`Delete container ${row.name}`)}
                sx={{ color: '#d32f2f' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      
      default:
        return value;
    }
  };

  // Render table cell content for images
  const renderImageCell = (key: string, value: any, row: DockerImage) => {
    switch (key) {
      case 'repository':
        return (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.repository}
          </Typography>
        );
      
      case 'tag':
        return (
          <Chip 
            label={row.tag} 
            size="small"
            sx={{ 
              bgcolor: '#f5f5f5',
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          />
        );
      
      case 'imageId':
        return (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {row.id.substring(7, 19)}
          </Typography>
        );
      
      case 'size':
        return (
          <Typography variant="body2">
            {row.size}
          </Typography>
        );
      
      case 'created':
        return (
          <Typography variant="body2">
            {row.created}
          </Typography>
        );
      
      case 'usedBy':
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {row.usedBy.length > 0 ? (
              row.usedBy.map((container, idx) => (
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
              <Typography variant="body2" color="text.secondary">
                None
              </Typography>
            )}
          </Box>
        );
      
      case 'actions':
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Push image">
              <IconButton 
                size="small" 
                onClick={() => console.log(`Push image ${row.repository}:${row.tag}`)}
                sx={{ color: '#555' }}
              >
                <UploadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete image">
              <IconButton 
                size="small" 
                onClick={() => console.log(`Delete image ${row.repository}:${row.tag}`)}
                sx={{ color: '#d32f2f' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      
      default:
        return value;
    }
  };

  // Render table cell content for volumes
  const renderVolumeCell = (key: string, value: any, row: DockerVolumeMount) => {
    switch (key) {
      case 'name':
        return (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.name}
          </Typography>
        );
      
      case 'mountPath':
        return (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {row.mountPath}
          </Typography>
        );
      
      case 'type':
        return (
          <Chip 
            label={row.type} 
            size="small"
            sx={{ 
              bgcolor: row.type === 'persistent' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(237, 108, 2, 0.1)',
              color: row.type === 'persistent' ? '#2e7d32' : '#ed6c02',
              fontWeight: 500,
              fontSize: '0.75rem'
            }}
          />
        );
      
      case 'size':
        return (
          <Typography variant="body2">
            {row.size}
          </Typography>
        );
      
      case 'actions':
        return (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Manage volume">
              <IconButton 
                size="small" 
                onClick={() => console.log(`Manage volume ${row.name}`)}
                sx={{ color: '#555' }}
              >
                <StorageIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete volume">
              <IconButton 
                size="small" 
                onClick={() => console.log(`Delete volume ${row.name}`)}
                sx={{ color: '#d32f2f' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      
      default:
        return value;
    }
  };

  // Get current data and render function based on resource view
  const getCurrentData = () => {
    switch (resourceView) {
      case 'containers':
        return { data: mockContainers, columns: containerColumns, renderCell: renderContainerCell };
      case 'images':
        return { data: mockImages, columns: imageColumns, renderCell: renderImageCell };
      case 'volumes':
        return { data: mockVolumes, columns: volumeColumns, renderCell: renderVolumeCell };
      default:
        return { data: mockContainers, columns: containerColumns, renderCell: renderContainerCell };
    }
  };

  const { data, columns, renderCell } = getCurrentData();

  // Render mobile cards or desktop table
  const renderContent = () => {
    if (isMobile) {
      switch (resourceView) {
        case 'containers':
          return mockContainers.map((container, index) => (
            <ContainerCard key={index} container={container} />
          ));
        case 'images':
          return mockImages.map((image, index) => (
            <ImageCard key={index} image={image} />
          ));
        case 'volumes':
          return mockVolumes.map((volume, index) => (
            <VolumeCard key={index} volume={volume} />
          ));
        default:
          return null;
      }
    } else {
      return (
        <DataTable
          columns={columns}
          data={data}
          renderCell={renderCell}
          responsive
        />
      );
    }
  };

  return (
    <Box sx={{ mb: 4, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
        Docker Management
      </Typography>
      
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Manage Docker containers, images, and configurations for {siteName}
        </Typography>
      </Box>
      
      {/* Docker Resources Section */}
      <Card
        title="Docker Resources"
        subtitle="Manage containers, images, and volumes"
        sx={{ mb: 3 }}
        responsive
        badge={
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <ResourceSelector
              value={resourceView}
              onChange={handleResourceViewChange}
              options={resourceOptions}
              responsive
            />
            <Button
              variant="primary"
              icon={<AddIcon />}
              responsive
            >
              {resourceView === 'containers' ? 'New Container' : 
               resourceView === 'images' ? 'Pull Image' : 'Create Volume'}
            </Button>
            <Button
              variant="outline"
              icon={<RefreshIcon />}
              responsive
            >
              Refresh
            </Button>
          </Box>
        }
      >
        {/* Search Bar */}
        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: '1px solid #f0f0f0' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${resourceView}...`}
            responsive
          />
        </Box>
        
        {/* Content - Mobile Cards or Desktop Table */}
        <Box sx={{ p: isMobile ? { xs: 1, sm: 1.5 } : 0 }}>
          {renderContent()}
        </Box>
      </Card>
      
      {/* Docker Compose Section */}
      <Card
        title="Docker Compose Configuration"
        subtitle="Manage your docker-compose.yml and related configurations"
        responsive
        badge={
          <Button variant="primary" responsive>
            Deploy Changes
          </Button>
        }
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Edit your docker-compose.yml file to configure your containerized services:
          </Typography>
          
          <EditableCodeBlock 
            code={dockerComposeContent}
            onChange={handleDockerComposeChange}
            language="yaml"
            placeholder="Enter your docker-compose.yml content here..."
            backgroundColor="#f8f9fa"
            maxHeight="300px"
            responsive
          />
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            mb: 2 
          }}>
            <Typography variant="body1" fontWeight={500} sx={{ display: 'flex', alignItems: 'center' }}>
              Auto-restart containers
              <Box component="span" sx={{ color: 'text.secondary', ml: 1, fontSize: '0.875rem' }}>
                (Automatically restart containers when they exit)
              </Box>
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label=""
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <ActionButtons
            onCancel={() => console.log('Reset to default')}
            onSave={() => console.log('Save configuration')}
            cancelText="Reset to Default"
            saveText="Save Configuration"
            responsive
          />
        </Box>
      </Card>
    </Box>
  );
};

export default DockerManagement; 