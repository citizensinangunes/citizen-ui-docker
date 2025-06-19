import React, { useEffect, useState } from 'react';
import { GridLegacy as Grid } from '@mui/material';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon,
  GitHub as GitHubIcon,
  Code as GitLabIcon,
  QuestionAnswer as BitbucketIcon,
  Language as LanguageIcon,
  MoreVert as MoreIcon,
  CloudUpload as UploadIcon,
  Visibility as VisitIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { Site } from '@/types/site.types';
import { useAuth } from '@/context/AuthContext';

interface MySitesListProps {
  openCreateModal: () => void;
  viewMode: 'card' | 'list';
  searchTerm: string;
  filterLanguage: string;
  filterStatus: string;
  sortBy: string;
}

const MySitesList: React.FC<MySitesListProps> = ({ 
  openCreateModal, 
  viewMode, 
  searchTerm, 
  filterLanguage, 
  filterStatus, 
  sortBy 
}) => {
  const { token } = useAuth();
  const [mySites, setMySites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      if (!token) {
        console.log('[SITES] No token in state, checking localStorage');
        const localStorageToken = localStorage.getItem('auth_token');
        if (!localStorageToken) {
          setLoading(false);
          return;
        }
      }
      
      try {
        setLoading(true);
        // Get token from state or localStorage as fallback
        const currentToken = token || localStorage.getItem('auth_token');
        
        if (!currentToken) {
          console.log('[SITES] No token available, cannot fetch sites');
          setError('Authentication error. Please try logging in again.');
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/sites', {
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'X-Auth-Token': currentToken // currentToken is guaranteed to be non-null here
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Siteler yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        console.log('[SITES] Loaded sites data:', data.sites.length, 'sites');
        setMySites(data.sites);
        setError(null);
      } catch (err) {
        console.error('Siteler alınırken hata:', err);
        setError('Siteler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    console.log('[SITES] Fetching sites data');
    fetchSites();
  }, [token]);

  // API'den gelen verilere filtreler uygula
  let filteredSites = [...mySites];
  
  console.log('[SITES] Before filtering - Total sites:', mySites.length);
  
  // Log site properties to diagnose issues
  if (mySites.length > 0) {
    console.log('[SITES] First site properties:', {
      name: mySites[0].name,
      status: mySites[0].status,
      language: mySites[0].language,
      subdomain: mySites[0].subdomain,
      description: mySites[0].description
    });
  }
  
  // Ensure all sites have proper properties before filtering
  const validSites = filteredSites.filter(site => {
    const hasName = !!site.name;
    const hasStatus = !!site.status;
    const hasLanguage = !!site.language;
    
    if (!hasName || !hasStatus || !hasLanguage) {
      console.warn('[SITES] Found site with missing properties:', site);
      return false;
    }
    
    return true;
  });
  
  if (validSites.length < filteredSites.length) {
    console.log('[SITES] Filtered out', filteredSites.length - validSites.length, 'invalid sites');
    filteredSites = validSites;
  }
  
  // Search filtresi - ensure all properties exist before accessing
  if (searchTerm) {
    filteredSites = filteredSites.filter(site => 
      (site.name && site.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (site.description && site.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (site.subdomain && site.subdomain.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    console.log('[SITES] After search filter:', filteredSites.length, 'sites remaining');
  }
  
  // Dil filtresi - check if language exists
  if (filterLanguage !== 'all') {
    filteredSites = filteredSites.filter(site => site.language && site.language === filterLanguage);
    console.log('[SITES] After language filter:', filteredSites.length, 'sites remaining, filter was:', filterLanguage);
  }
  
  // Durum filtresi - check if status exists
  if (filterStatus !== 'all') {
    filteredSites = filteredSites.filter(site => site.status && site.status.toLowerCase() === filterStatus.toLowerCase());
    console.log('[SITES] After status filter:', filteredSites.length, 'sites remaining, filter was:', filterStatus);
  }
  
  // Sıralama
  switch (sortBy) {
    case 'newest':
      filteredSites = [...filteredSites].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
    case 'oldest':
      filteredSites = [...filteredSites].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case 'name-asc':
      filteredSites = [...filteredSites].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      filteredSites = [...filteredSites].sort((a, b) => b.name.localeCompare(a.name));
      break;
    default:
      break;
  }

  console.log('[SITES] Final filtered sites:', filteredSites.length, '- Filters:', {
    searchTerm,
    filterLanguage,
    filterStatus,
    sortBy
  });
  
  // If there's a discrepancy, log site information
  if (mySites.length > filteredSites.length && !searchTerm && filterLanguage === 'all' && filterStatus === 'all') {
    console.log('[SITES] Missing sites detected - full list:', mySites);
  }

  // Yükleme durumunda
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Hata durumunda
  if (error) {
    return (
      <Box sx={{ textAlign: 'center', my: 4 }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button 
          variant="outlined" 
          onClick={() => {
            setLoading(true);
            setError(null);
            // Re-trigger the effect to fetch sites
            // We can't directly call fetchSites since it's inside the effect
            const refreshToken = token || localStorage.getItem('auth_token');
            if (refreshToken) {
              console.log('[SITES] Retrying data fetch');
              // Small delay to ensure state updates properly
              setTimeout(() => {
                fetch('/api/sites', {
                  headers: {
                    'Authorization': `Bearer ${refreshToken}`,
                    'X-Auth-Token': refreshToken
                  },
                  credentials: 'include'
                })
                .then(response => {
                  if (!response.ok) throw new Error('Failed to fetch sites');
                  return response.json();
                })
                .then(data => {
                  console.log('[SITES] Retry successful. Loaded sites:', data.sites.length);
                  setMySites(data.sites);
                  setError(null);
                })
                .catch(err => {
                  console.error('[SITES] Retry failed:', err);
                  setError('Could not load sites. Please try again.');
                })
                .finally(() => {
                  setLoading(false);
                });
              }, 500);
            } else {
              setError('No authentication token found. Please log in again.');
              setLoading(false);
            }
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Site yoksa
  if (filteredSites.length === 0) {
    return <EmptySitesState openCreateModal={openCreateModal} />;
  }

  // Kartlı görünüm
  const renderCardView = () => {
    return (
      <Grid container spacing={{ xs: 2, sm: 2.5 }}>
        {filteredSites.map((site) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={site.id}>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ 
                p: 1, 
                px: 2, 
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: '#F8F8FF',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: { xs: 0.5, sm: 0 }
              }}>
                <Chip
                  label={site.language || 'Unknown'}
                  size="small"
                  sx={{
                    bgcolor: site.language === 'TypeScript' ? '#3178c630' : 
                             site.language === 'JavaScript' ? '#f7df1e30' : 
                             site.language === 'Python' ? '#3776ab30' : '#61dafb30',
                    color: site.language === 'TypeScript' ? '#3178c6' : 
                           site.language === 'JavaScript' ? '#f7df1e' : 
                           site.language === 'Python' ? '#3776ab' : '#61dafb',
                    fontWeight: 500,
                    fontSize: { xs: '0.65rem', sm: '0.7rem' }
                  }}
                />
                <Chip
                  label={site.status}
                  size="small"
                  sx={{
                    bgcolor: site.status === 'active' ? '#4caf5030' : '#f4433630',
                    color: site.status === 'active' ? '#4caf50' : '#f44336',
                    fontWeight: 500,
                    fontSize: { xs: '0.65rem', sm: '0.7rem' }
                  }}
                />
              </Box>
              <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 } }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={600} 
                  gutterBottom 
                  sx={{ 
                    mb: 0.5,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    lineHeight: 1.3
                  }}
                >
                  {site.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: { xs: 2, sm: 3 },
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {site.description || 'No description provided'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LanguageIcon fontSize="small" sx={{ color: '#666', mr: 1 }} />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }, 
                      color: '#004aad',
                      wordBreak: 'break-all'
                    }}
                  >
                    {site.subdomain}
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.8rem' }, 
                    color: '#666' 
                  }}
                >
                  {site.lastDeployedAt 
                    ? `Deployed ${formatDate(site.lastDeployedAt)}`
                    : 'Not yet deployed'}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 0, borderTop: '1px solid #f0f0f0' }}>
                <Button 
                  size="small" 
                  startIcon={<VisitIcon fontSize="small" />}
                  sx={{ 
                    flex: 1, 
                    py: { xs: 0.75, sm: 1 }, 
                    borderRadius: 0,
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }}
                  component="a"
                  href={`https://${site.subdomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit
                </Button>
                <Divider orientation="vertical" flexItem />
                <Link href={`/sites/${site.id}`} passHref style={{ flex: 1 }}>
                  <Button 
                    size="small"
                    startIcon={<SettingsIcon fontSize="small" />}
                    sx={{ 
                      width: '100%', 
                      py: { xs: 0.75, sm: 1 }, 
                      borderRadius: 0,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' }
                    }}
                  >
                    Settings
                  </Button>
                </Link>
              </CardActions>
            </Paper>
          </Grid>
        ))}
        
        {/* Yeni site kartı */}
        <Grid item xs={12} sm={6} md={6} lg={4}>
          <Paper
            elevation={0}
            onClick={openCreateModal}
            sx={{
              border: '1px dashed #ccc',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: { xs: 2, sm: 3 },
              bgcolor: 'rgba(0, 74, 173, 0.02)',
              cursor: 'pointer',
              minHeight: { xs: '200px', sm: '230px' },
              '&:hover': {
                bgcolor: 'rgba(0, 74, 173, 0.05)',
              }
            }}
          >
            <AddIcon sx={{ 
              fontSize: { xs: 36, sm: 48 }, 
              color: '#004aad', 
              opacity: 0.6, 
              mb: { xs: 1, sm: 2 } 
            }} />
            <Typography 
              variant="subtitle1" 
              color="#004aad" 
              align="center" 
              sx={{ 
                opacity: 0.75,
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Create a New Site
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  // Liste görünümü
  const renderListView = () => {
    return (
      <TableContainer 
        component={Paper} 
        elevation={0} 
        sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: 2,
          overflowX: 'auto'
        }}
      >
        <Table sx={{ minWidth: { xs: 600, sm: 650 } }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Name
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                display: { xs: 'none', sm: 'table-cell' }
              }}>
                Status
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                display: { xs: 'none', md: 'table-cell' }
              }}>
                Framework
              </TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Domain
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                display: { xs: 'none', lg: 'table-cell' }
              }}>
                Last Deployed
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSites.map((site) => (
              <TableRow
                key={site.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={500}
                      sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                    >
                      {site.name}
                    </Typography>
                    {/* Mobile: Show status and framework inline */}
                    <Box sx={{ 
                      display: { xs: 'flex', sm: 'none' }, 
                      gap: 1, 
                      mt: 0.5,
                      alignItems: 'center',
                      flexWrap: 'wrap'
                    }}>
                      <Chip
                        label={site.status}
                        size="small"
                        sx={{
                          bgcolor: site.status === 'active' ? '#4caf5030' : '#f4433630',
                          color: site.status === 'active' ? '#4caf50' : '#f44336',
                          fontWeight: 500,
                          fontSize: '0.65rem',
                          height: 20
                        }}
                      />
                      {site.framework?.name && (
                        <Typography variant="caption" color="text.secondary">
                          {site.framework.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <Chip
                    label={site.status}
                    size="small"
                    sx={{
                      bgcolor: site.status === 'active' ? '#4caf5030' : '#f4433630',
                      color: site.status === 'active' ? '#4caf50' : '#f44336',
                      fontWeight: 500,
                      fontSize: '0.7rem'
                    }}
                  />
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {site.framework?.logo && (
                      <Box 
                        component="img" 
                        src={site.framework.logo} 
                        alt={site.framework.name} 
                        sx={{ width: 18, height: 18, mr: 1 }} 
                      />
                    )}
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                      {site.framework?.name || 'Unknown'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#004aad',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      wordBreak: 'break-all'
                    }}
                  >
                    {site.subdomain}
                  </Typography>
                  {/* Mobile: Show last deployed inline */}
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      display: { xs: 'block', lg: 'none' },
                      fontSize: '0.7rem',
                      mt: 0.5
                    }}
                  >
                    {site.lastDeployedAt ? formatDate(site.lastDeployedAt) : 'Not deployed'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {site.lastDeployedAt ? formatDate(site.lastDeployedAt) : 'Not yet deployed'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton 
                      size="small" 
                      component="a"
                      href={`https://${site.subdomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
                    >
                      <VisitIcon fontSize="small" />
                    </IconButton>
                    <Link href={`/sites/${site.id}`} passHref>
                      <IconButton size="small" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                        <SettingsIcon fontSize="small" />
                      </IconButton>
                    </Link>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return viewMode === 'card' ? (
    <>
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Showing {filteredSites.length} of {mySites.length} total sites
        </Typography>
        {filteredSites.length < mySites.length && (
          <Typography 
            variant="body2" 
            color="primary"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            Some sites are hidden due to filters
          </Typography>
        )}
      </Box>
      {renderCardView()}
    </>
  ) : (
    <>
      <Box sx={{ 
        mb: 2, 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 1, sm: 0 }
      }}>
        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Showing {filteredSites.length} of {mySites.length} total sites
        </Typography>
        {filteredSites.length < mySites.length && (
          <Typography 
            variant="body2" 
            color="primary"
            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            Some sites are hidden due to filters
          </Typography>
        )}
      </Box>
      {renderListView()}
    </>
  );
};

// Tarih formatlama yardımcı fonksiyonu
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}

// Boş site durumu bileşeni
const EmptySitesState: React.FC<{ openCreateModal: () => void }> = ({ openCreateModal }) => {
  return (
    <Box sx={{ 
      textAlign: 'center', 
      py: { xs: 4, sm: 6 },
      px: { xs: 2, sm: 0 }
    }}>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
      >
        No sites yet
      </Typography>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        paragraph
        sx={{ 
          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
          maxWidth: { xs: '100%', sm: '400px' },
          mx: 'auto'
        }}
      >
        You haven't created any sites yet. Start by creating your first site.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={openCreateModal}
        sx={{
          bgcolor: '#004aad',
          color: 'white',
          '&:hover': { bgcolor: '#003a87' },
          fontWeight: 500,
          mt: 2,
          px: { xs: 3, sm: 4 },
          py: { xs: 1, sm: 1.25 },
          fontSize: { xs: '0.875rem', sm: '0.9375rem' }
        }}
      >
        Create New Site
      </Button>
    </Box>
  );
};

export default MySitesList;