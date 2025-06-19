"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Tabs, 
  Tab, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon, 
  ViewModule as GridViewIcon, 
  ViewList as ListViewIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useRole } from '@/context/RoleContext';
import NewSiteModal from '../components/NewSiteModal';
import MySitesList from './MySitesList';
import SharedSitesList from './SharedSitesList';
import { useRouter } from 'next/navigation';

export default function SitesDashboard() {
  const { currentRole } = useRole();
  const [tabValue, setTabValue] = useState(currentRole === 'viewer' ? 1 : 0);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  // Debug logging
  useEffect(() => {
    console.log('[SITES-DASHBOARD] Current role:', currentRole);
    console.log('[SITES-DASHBOARD] Initial tab value:', tabValue);
    console.log('[SITES-DASHBOARD] Current filters:', {
      language: filterLanguage,
      status: filterStatus,
      search: searchTerm,
      sortBy: sortBy
    });
  }, [currentRole, tabValue, filterLanguage, filterStatus, searchTerm, sortBy]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log('[SITES-DASHBOARD] Tab changed to:', newValue);
    setTabValue(newValue);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  const handleSiteCreated = (siteId: number) => {
    // Yeni site oluşturulduğunda, My Sites tabına geç ve modalı kapat
    setTabValue(0);
    setModalOpen(false);
    // Instead of using router.refresh(), increment the key to force remount
    setRefreshKey(prev => prev + 1);
    // Optionally, also refresh the router
    router.refresh();
  };
  
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'card' ? 'list' : 'card');
  };
  
  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };
  
  const handleFilterLanguageChange = (event: SelectChangeEvent) => {
    setFilterLanguage(event.target.value);
  };
  
  const handleFilterStatusChange = (event: SelectChangeEvent) => {
    setFilterStatus(event.target.value);
  };
  
  const handleSortByChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
    handleSortClose();
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const resetAllFilters = () => {
    setSearchTerm('');
    setFilterLanguage('all');
    setFilterStatus('all');
    setSortBy('newest');
    setRefreshKey(prev => prev + 1);
    console.log('[SITES-DASHBOARD] All filters reset');
  };
  
  // Viewerlar sadece shared with me tab'ini görebilir
  const isViewerRole = currentRole === 'viewer';

  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: 3,
        gap: { xs: 2, sm: 0 }
      }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Bandwidth
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            2.1 GB / 100 GB
          </Typography>
        </Box>
        
        {/* Sadece admin ve citizen yeni site oluşturabilir */}
        {!isViewerRole && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            fullWidth={false}
            sx={{
              bgcolor: '#004aad',
              color: 'white',
              '&:hover': { bgcolor: '#003a87' },
              fontWeight: 500,
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            New Site
          </Button>
        )}
      </Box>

      {/* Görünüm, filtreleme ve sıralama araçları */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', md: 'center' }, 
        mb: 2,
        gap: { xs: 2, md: 1 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Viewer rolü için sadece Shared With Me tab'i göster */}
          {isViewerRole ? (
            <Typography variant="h6" fontWeight={500}>
              Shared With Me
            </Typography>
          ) : (
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  minWidth: { xs: 'auto', sm: 90 },
                  px: { xs: 1, sm: 2 }
                }
              }}
            >
              <Tab label="My Sites" />
              <Tab label="Shared With Me" />
            </Tabs>
          )}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' }, 
          gap: { xs: 1, sm: 1 }
        }}>
          <TextField
            placeholder="Search sites..."
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: { xs: '100%', sm: 200 },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          />
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            justifyContent: { xs: 'space-between', sm: 'flex-start' }
          }}>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={resetAllFilters}
              sx={{ 
                height: 40,
                textTransform: 'none',
                borderColor: '#004aad20',
                color: '#004aad',
                '&:hover': {
                  borderColor: '#004aad40'
                },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              Reset
            </Button>
            
            <Tooltip title="Filter">
              <IconButton onClick={handleFilterClick} size="small">
                <FilterIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
              PaperProps={{
                sx: { 
                  width: { xs: 280, sm: 220 }, 
                  p: 1,
                  maxWidth: '90vw'
                }
              }}
            >
              <Typography variant="subtitle2" sx={{ px: 1, mb: 1 }}>
                Filter Options
              </Typography>
              
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={filterLanguage}
                  label="Language"
                  onChange={handleFilterLanguageChange}
                >
                  <MenuItem value="all">All Languages</MenuItem>
                  <MenuItem value="Python">Python</MenuItem>
                  <MenuItem value="Node.js">Node.js</MenuItem>
                  <MenuItem value="React">React</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={handleFilterStatusChange}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Menu>
            
            <Tooltip title="Sort">
              <IconButton onClick={handleSortClick} size="small">
                <SortIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
              PaperProps={{
                sx: { 
                  minWidth: { xs: 160, sm: 140 }
                }
              }}
            >
              <MenuItem 
                selected={sortBy === 'newest'} 
                onClick={() => {setSortBy('newest'); handleSortClose();}}
              >
                Newest First
              </MenuItem>
              <MenuItem 
                selected={sortBy === 'oldest'} 
                onClick={() => {setSortBy('oldest'); handleSortClose();}}
              >
                Oldest First
              </MenuItem>
              <MenuItem 
                selected={sortBy === 'name-asc'} 
                onClick={() => {setSortBy('name-asc'); handleSortClose();}}
              >
                Name (A-Z)
              </MenuItem>
              <MenuItem 
                selected={sortBy === 'name-desc'} 
                onClick={() => {setSortBy('name-desc'); handleSortClose();}}
              >
                Name (Z-A)
              </MenuItem>
            </Menu>
            
            <Tooltip title={viewMode === 'card' ? 'List View' : 'Card View'}>
              <IconButton onClick={toggleViewMode} size="small">
                {viewMode === 'card' ? <ListViewIcon fontSize="small" /> : <GridViewIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Viewer rolü için her zaman SharedSitesList göster */}
      {isViewerRole ? (
        <SharedSitesList viewMode={viewMode} searchTerm={searchTerm} filterLanguage={filterLanguage} filterStatus={filterStatus} sortBy={sortBy} />
      ) : (
        <>
          {tabValue === 0 && (
            <MySitesList 
              key={`my-sites-${refreshKey}`}
              openCreateModal={handleOpenModal} 
              viewMode={viewMode} 
              searchTerm={searchTerm} 
              filterLanguage={filterLanguage} 
              filterStatus={filterStatus} 
              sortBy={sortBy} 
            />
          )}
          {tabValue === 1 && (
            <SharedSitesList 
              key={`shared-sites-${refreshKey}`}
              viewMode={viewMode} 
              searchTerm={searchTerm} 
              filterLanguage={filterLanguage} 
              filterStatus={filterStatus} 
              sortBy={sortBy} 
            />
          )}
        </>
      )}
      
      {/* New Site Modal - sadece admin ve citizen için */}
      {!isViewerRole && (
        <NewSiteModal 
          open={modalOpen} 
          onClose={handleCloseModal} 
          onSuccess={handleSiteCreated}
        />
      )}
    </Box>
  );
}