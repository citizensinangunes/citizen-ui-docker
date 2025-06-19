"use client";

import React, { ReactNode, useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper,
  Divider,
  Popover,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Storage as StorageIcon,
  Build as BuildIcon,
  Extension as ExtensionIcon,
  Language as LanguageIcon,
  People as TeamIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  BorderColor as EditorIcon,
  Notifications as NotificationsIcon,
  QuestionMark as SupportIcon,
  Code as CodeIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  LockOutlined as LockIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Tune as TuneIcon,
  PushPin as PushPinIcon,
  PushPinOutlined as PushPinOutlinedIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRole, Role } from '@/context/RoleContext';
import { useAuth } from '@/context/AuthContext';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  href: string;
  roles: Role[]; // Roles that can access this menu item
  comingSoon?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
}

// Define sidebar behavior modes
type SidebarMode = 'expanded' | 'collapsed' | 'hover';

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRole, setCurrentRole } = useRole();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Add responsive breakpoint detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  // Replace sidebarCollapsed with sidebarMode
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expanded');
  // For hover state
  const [isHovering, setIsHovering] = useState(false);
  // Add mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Add state for the logo control popover
  const [logoAnchorEl, setLogoAnchorEl] = useState<HTMLElement | null>(null);
  const logoPopoverOpen = Boolean(logoAnchorEl);
  
  // Add state for the context menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  
  // Auto-collapse sidebar on tablet
  useEffect(() => {
    if (isTablet && !isMobile && sidebarMode === 'expanded') {
      setSidebarMode('collapsed');
    }
  }, [isTablet, isMobile, sidebarMode]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    // Check for user in state and localStorage
    const localStorageUser = localStorage.getItem('user');
    const localStorageToken = localStorage.getItem('auth_token');
    
    console.log('[UI-DASHBOARD] Auth check - User in state:', !!user);
    console.log('[UI-DASHBOARD] Auth check - User in localStorage:', !!localStorageUser);
    console.log('[UI-DASHBOARD] Auth check - Token in localStorage:', !!localStorageToken);
    
    // If we have user data in localStorage but not in state, load it directly
    if (!user && localStorageUser && localStorageToken) {
      try {
        console.log('[UI-DASHBOARD] Using user data from localStorage');
        // Instead of reloading, we'll just return early and let the AuthContext 
        // handle loading the user on its own
        return;
      } catch (error) {
        console.error('[UI-DASHBOARD] Error processing localStorage data:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
      }
    }
    
    // If no user in state or localStorage, redirect to login
    if (!user && !localStorageUser) {
      console.log('[UI-DASHBOARD] User not authenticated, redirecting to login page');
      router.push('/auth');
    }
  }, [user, router]);
  
  // Add a new effect to check token validity periodically
  useEffect(() => {
    // We need to check token validity even if user is not loaded yet
    // This prevents issues with stale localStorage data
    const localStorageToken = localStorage.getItem('auth_token');
    const localStorageUser = localStorage.getItem('user');
    
    if (!localStorageToken) {
      console.log('[UI-DASHBOARD] No token in localStorage, skipping validation');
      return;
    }
    
    // If we already have user in state, don't need to validate
    if (user) {
      console.log('[UI-DASHBOARD] User already in state, skipping validation');
      return;
    }
    
    console.log('[UI-DASHBOARD] Setting up token validation');
    
    // Function to validate token
    const validateToken = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          console.log('[UI-DASHBOARD] No token in localStorage, logging out');
          if (user) logout();
          router.push('/auth');
          return;
        }
        
        console.log('[UI-DASHBOARD] Checking token validity');
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Auth-Token': token
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          console.log('[UI-DASHBOARD] Token validation failed, logging out');
          // Clean up localStorage manually to prevent loops
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          
          if (user) logout();
          router.push('/auth');
        } 
      } catch (error) {
        console.error('[UI-DASHBOARD] Token validation error:', error);
      }
    };
    
    // Run validation once with a small delay to avoid race conditions
    const timeoutId = setTimeout(validateToken, 1000);
    
    // Don't set repeated validation here, as it's done in AuthContext
    return () => {
      clearTimeout(timeoutId);
      console.log('[UI-DASHBOARD] Cleaning up token validation');
    };
  }, [user, logout, router]);
  
  // Determine the effective width based on mode and hover state
  const getEffectiveWidth = () => {
    if (isMobile) return 0; // No sidebar width on mobile
    if (sidebarMode === 'expanded') return 220;
    if (sidebarMode === 'collapsed') return 64;
    // Hover mode
    return isHovering ? 220 : 64;
  };
  
  const drawerWidth = getEffectiveWidth();
  
  const shouldShowText = !isMobile && (sidebarMode === 'expanded' || (sidebarMode === 'hover' && isHovering));
  
  const handleMouseEnter = () => {
    if (!isMobile && sidebarMode === 'hover') {
      setIsHovering(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!isMobile && sidebarMode === 'hover') {
      setIsHovering(false);
    }
  };
  
  const changeSidebarMode = (mode: SidebarMode) => {
    if (!isMobile) {
      setSidebarMode(mode);
      setIsHovering(false);
    }
  };
  
  // Mobile drawer handlers
  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };
  
  // Load preferred sidebar mode from localStorage on component mount
  useEffect(() => {
    const savedMode = localStorage.getItem('sidebar_mode') as SidebarMode;
    if (savedMode && ['expanded', 'collapsed', 'hover'].includes(savedMode)) {
      setSidebarMode(savedMode);
    }
  }, []);
  
  // Define menu items with role restrictions
  const allMenuItems: MenuItem[] = [
    { text: 'Sites', icon: <StorageIcon fontSize="small" />, href: '/sites', roles: ['admin', 'citizen', 'viewer'] },
    { text: 'Builds', icon: <BuildIcon fontSize="small" />, href: '/builds', roles: ['admin', 'citizen'] },
    { text: 'Domains', icon: <LanguageIcon fontSize="small" />, href: '/domains', roles: ['admin'] },
    { text: 'Team', icon: <TeamIcon fontSize="small" />, href: '/team', roles: ['admin', 'citizen', 'viewer'] }, // Changed from 'Members'
    { text: 'Team settings', icon: <SettingsIcon fontSize="small" />, href: '/settings', roles: ['admin'] },
  ];

  // Filter menu items based on current role
  const menuItems = allMenuItems.filter(item => item.roles.includes(currentRole));

  // Handle role change
  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setCurrentRole(event.target.value as Role);
    
    // Check if the current page is not accessible with the new role
    const currentPath = pathname;
    const menuItem = allMenuItems.find(item => item.href === currentPath);
    
    if (menuItem && !menuItem.roles.includes(event.target.value as Role)) {
      // Redirect to sites or another accessible page
      router.push('/sites');
    }
  };

  // Handle mobile role change from menu
  const handleMobileRoleChange = () => {
    handleProfileMenuClose();
    // You could open a role selection dialog here or navigate to a role selection page
    // For now, we'll just cycle through roles
    const roles: Role[] = ['admin', 'citizen', 'viewer'];
    const currentIndex = roles.indexOf(currentRole);
    const nextRole = roles[(currentIndex + 1) % roles.length];
    setCurrentRole(nextRole);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleProfileMenuClose();
    logout();
  };

  const handlePreferences = () => {
    handleProfileMenuClose();
    // Navigate to preferences page or open preferences modal
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '';
    
    const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
    const lastInitial = user.lastName ? user.lastName.charAt(0) : '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };

  // Handle logo click to show control options
  const handleLogoClick = (event: React.MouseEvent<HTMLElement>) => {
    setLogoAnchorEl(event.currentTarget);
  };

  const handleLogoPopoverClose = () => {
    setLogoAnchorEl(null);
  };

  // Toggle sidebar mode with a single button
  const toggleSidebarMode = () => {
    // Cycle through modes: expanded -> collapsed -> hover -> expanded...
    if (sidebarMode === 'expanded') {
      changeSidebarMode('collapsed');
    } else if (sidebarMode === 'collapsed') {
      changeSidebarMode('hover');
    } else {
      changeSidebarMode('expanded');
    }
  };

  // Handle opening the menu
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle closing the menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle selecting a menu option
  const handleModeSelect = (mode: SidebarMode) => {
    changeSidebarMode(mode);
    handleMenuClose();
  };

  // If user is not authenticated yet, show nothing
  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f8f9fa' }}>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileDrawerOpen}
          onClose={handleMobileDrawerClose}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              bgcolor: 'white',
              borderRight: '1px solid #eaeaea',
            },
          }}
        >
          {/* Mobile Drawer Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Mobile header */}
            <Box sx={{ 
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              px: 2.5,
              borderBottom: '1px solid #eaeaea',
            }}>
              <Image 
                src="/citizen-logo.svg"
                width={22} 
                height={22}
                alt="Citizen Logo"
              />
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', ml: 1.5 }}>
                Citizen
              </Typography>
            </Box>
            
            {/* Mobile search */}
            <Box sx={{ p: 1.5 }}>
              <TextField
                fullWidth
                placeholder="Search..."
                size="small"
                InputProps={{
                  style: { fontSize: '13px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" style={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                  sx: { py: 0.5, px: 1 }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: '#f8f9fa',
                    '& fieldset': {
                      borderColor: 'transparent'
                    },
                    '&:hover fieldset': {
                      borderColor: '#e0e0e0'
                    }
                  }
                }}
              />
            </Box>
            
            {/* Mobile menu items */}
            <List sx={{ px: 1, py: 0, flex: 1, overflowY: 'auto' }}>
              {menuItems.map((item, index) => (
                <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                  <Link 
                    href={item.comingSoon ? '#' : item.href} 
                    style={{ textDecoration: 'none', width: '100%', color: 'inherit' }}
                    onClick={handleMobileDrawerClose}
                  >
                    <ListItemButton
                      sx={{
                        borderRadius: 1.5,
                        py: 0.75,
                        px: 2,
                        bgcolor: item.href === pathname ? 'rgba(0, 74, 173, 0.08)' : 'transparent',
                        '&:hover': {
                          bgcolor: item.href === pathname ? 'rgba(0, 74, 173, 0.12)' : 'rgba(0, 0, 0, 0.03)',
                        },
                        opacity: item.comingSoon ? 0.6 : 1,
                      }}
                      disabled={item.comingSoon}
                    >
                      <ListItemIcon sx={{ 
                        minWidth: 32, 
                        color: item.href === pathname ? '#004aad' : '#666',
                        mr: 2,
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography sx={{ 
                              fontSize: 13,
                              fontWeight: item.href === pathname ? 500 : 400,
                              color: item.href === pathname ? '#004aad' : '#555'
                            }}>
                              {item.text}
                            </Typography>
                            {item.comingSoon && (
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  ml: 1, 
                                  fontSize: 10, 
                                  color: 'text.secondary',
                                  bgcolor: 'rgba(0,0,0,0.05)',
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                }}
                              >
                                Soon
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      )}

      {/* Desktop Sidebar - only show on desktop */}
      {!isMobile && (
        <Box
          sx={{
            width: drawerWidth,
            position: 'fixed',
            height: '100%',
            bgcolor: 'white',
            borderRight: '1px solid #eaeaea',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10,
            transition: 'width 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
            overflow: 'hidden',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Sidebar header with logo only */}
          <Box 
            sx={{ 
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: shouldShowText ? 2.5 : 1,
              borderBottom: '1px solid #eaeaea',
              transition: 'padding 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: shouldShowText ? 'flex-start' : 'center',
                width: '100%',
                transition: 'all 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
              }}
            >
              <Image 
                src="/citizen-logo.svg"
                width={22} 
                height={22}
                alt="Citizen Logo"
              />
              {shouldShowText && (
                <Typography sx={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', ml: 1.5 }}>
                  Citizen
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Sidebar search - only show when expanded or on hover in hover mode */}
          {shouldShowText && (
            <Box sx={{ p: 1.5 }}>
              <TextField
                fullWidth
                placeholder="Search..."
                size="small"
                InputProps={{
                  style: { fontSize: '13px' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" style={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>⌘K</Typography>
                    </InputAdornment>
                  ),
                  sx: { py: 0.5, px: 1 }
                }}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    bgcolor: '#f8f9fa',
                    '& fieldset': {
                      borderColor: 'transparent'
                    },
                    '&:hover fieldset': {
                      borderColor: '#e0e0e0'
                    }
                  }
                }}
              />
            </Box>
          )}
          
          {/* Menu items */}
          <List sx={{ 
            px: shouldShowText ? 1 : 0.5, 
            py: 0, 
            flex: 1, 
            overflowY: 'auto',
            transition: 'padding 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
          }}>
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip 
                  title={!shouldShowText ? item.text : ''} 
                  placement="right"
                  disableHoverListener={shouldShowText}
                >
                  <Link href={item.comingSoon ? '#' : item.href} style={{ 
                    textDecoration: 'none', 
                    width: '100%', 
                    color: 'inherit' 
                  }}>
                    <ListItemButton
                      sx={{
                        borderRadius: 1.5,
                        py: 0.75,
                        px: shouldShowText ? 2 : 1,
                        bgcolor: item.href === pathname ? 'rgba(0, 74, 173, 0.08)' : 'transparent',
                        '&:hover': {
                          bgcolor: item.href === pathname ? 'rgba(0, 74, 173, 0.12)' : 'rgba(0, 0, 0, 0.03)',
                        },
                        justifyContent: shouldShowText ? 'initial' : 'center',
                        opacity: item.comingSoon ? 0.6 : 1,
                        transition: 'padding 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
                      }}
                      disabled={item.comingSoon}
                    >
                      <ListItemIcon 
                        sx={{ 
                          minWidth: shouldShowText ? 32 : 0, 
                          color: item.href === pathname ? '#004aad' : '#666',
                          mr: shouldShowText ? 2 : 0,
                          transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {shouldShowText && (
                        <ListItemText 
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography 
                                sx={{ 
                                  fontSize: 13,
                                  fontWeight: item.href === pathname ? 500 : 400,
                                  color: item.href === pathname ? '#004aad' : '#555'
                                }}
                              >
                                {item.text}
                              </Typography>
                              {item.comingSoon && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    ml: 1, 
                                    fontSize: 10, 
                                    color: 'text.secondary',
                                    bgcolor: 'rgba(0,0,0,0.05)',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                  }}
                                >
                                  Soon
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      )}
                    </ListItemButton>
                  </Link>
                </Tooltip>
              </ListItem>
            ))}
          </List>
          
          {/* Control at the bottom for all modes */}
          <Box sx={{ 
            mt: 'auto', 
            display: 'flex', 
            justifyContent: 'center', 
            py: shouldShowText ? 1.5 : 2, 
            px: shouldShowText ? 2 : 0,
            borderTop: '1px solid #eaeaea',
            bgcolor: 'white'
          }}>
            {/* In expanded mode, show the icon at right */}
            {shouldShowText ? (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <IconButton 
                  size="small" 
                  onClick={handleMenuClick}
                  aria-controls={menuOpen ? 'sidebar-mode-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                  sx={{ color: '#666' }}
                >
                  <MenuIcon fontSize="small" sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            ) : (
              <IconButton 
                size="small" 
                onClick={handleMenuClick}
                aria-controls={menuOpen ? 'sidebar-mode-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                sx={{ color: '#666' }}
              >
                <MenuIcon fontSize="small" sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            
            {/* Context menu for sidebar mode selection */}
            <Menu
              id="sidebar-mode-menu"
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'sidebar-mode-button',
                dense: true,
              }}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              PaperProps={{
                elevation: 2,
                sx: {
                  minWidth: 150,
                  borderRadius: 1,
                  mb: 0.5,
                  '& .MuiMenuItem-root': {
                    fontSize: '13px',
                    py: 0.75,
                  }
                }
              }}
            >
              <MenuItem 
                onClick={() => handleModeSelect('expanded')}
                sx={{ 
                  color: sidebarMode === 'expanded' ? '#004aad' : 'inherit',
                  fontWeight: sidebarMode === 'expanded' ? 500 : 400,
                  bgcolor: sidebarMode === 'expanded' ? 'rgba(0, 74, 173, 0.05)' : 'transparent',
                }}
              >
                Expanded
              </MenuItem>
              <MenuItem 
                onClick={() => handleModeSelect('hover')}
                sx={{ 
                  color: sidebarMode === 'hover' ? '#004aad' : 'inherit',
                  fontWeight: sidebarMode === 'hover' ? 500 : 400,
                  bgcolor: sidebarMode === 'hover' ? 'rgba(0, 74, 173, 0.05)' : 'transparent',
                }}
              >
                Hover expand
              </MenuItem>
              <MenuItem 
                onClick={() => handleModeSelect('collapsed')}
                sx={{ 
                  color: sidebarMode === 'collapsed' ? '#004aad' : 'inherit',
                  fontWeight: sidebarMode === 'collapsed' ? 500 : 400,
                  bgcolor: sidebarMode === 'collapsed' ? 'rgba(0, 74, 173, 0.05)' : 'transparent',
                }}
              >
                Collapsed
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      )}

      {/* Main content area */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        ml: isMobile ? 0 : `${drawerWidth}px`,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: isMobile ? 'none' : 'margin-left 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
      }}>
        {/* Top navigation bar */}
        <Box
          sx={{
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            px: { xs: 2, sm: 3 },
            bgcolor: 'white',
            borderBottom: '1px solid #eaeaea',
            position: 'sticky',
            top: 0,
            zIndex: 5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Mobile menu button */}
            {isMobile && (
              <IconButton
                edge="start"
                onClick={handleMobileDrawerToggle}
                sx={{ 
                  mr: 2, 
                  color: '#1a1a1a',
                  bgcolor: 'white',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  '&:hover': {
                    bgcolor: '#f9fafb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  },
                  borderRadius: 2,
                  p: 1.25,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  width: 40,
                  height: 40,
                }}
              >
                <MenuIcon sx={{ 
                  fontSize: 18,
                  transition: 'transform 0.2s ease',
                  ...(mobileDrawerOpen && {
                    transform: 'rotate(90deg)'
                  })
                }} />
              </IconButton>
            )}
            
            <Typography 
              variant="subtitle1" 
              component="div" 
              color="#333" 
              fontWeight={600} 
              sx={{ fontSize: { xs: '14px', sm: '15px' } }}
            >
              {pathname === '/' 
                ? 'Dashboard'
                : pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2)}
            </Typography>
            
            <Typography 
              variant="caption" 
              sx={{ 
                ml: { xs: 1, sm: 2 },
                bgcolor: currentRole === 'admin' ? '#4caf5010' : 
                currentRole === 'citizen' ? '#ff980010' : '#90909010',
                color: currentRole === 'admin' ? '#4caf50' : 
                      currentRole === 'citizen' ? '#ff9800' : '#909090',
                fontWeight: 500,
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: { xs: '10px', sm: '11px' },
                display: { xs: 'none', sm: 'inline-block' }
              }}
            >
              {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Role
            </Typography>
            
            {!isMobile && (
              <FormControl size="small" sx={{ ml: 2 }}>
                <Select
                  value={currentRole}
                  onChange={handleRoleChange}
                  sx={{ 
                    fontSize: '12px',
                    '& .MuiSelect-select': {
                      py: 0.5,
                      bgcolor: '#f8f9fa',
                      border: 'none'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      border: 'none'
                    }
                  }}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="citizen">Citizen</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
          
          {/* Right side of top bar - actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
            {!isMobile && (
              <>
                <IconButton size="small" aria-label="notifications" sx={{ color: '#555' }}>
                  <NotificationsIcon fontSize="small" sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton size="small" aria-label="support" sx={{ color: '#555' }}>
                  <SupportIcon fontSize="small" sx={{ fontSize: 18 }} />
                </IconButton>
              </>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: { xs: 0, sm: 1.5 } }}>
              <IconButton
                size="small"
                onClick={handleProfileMenuOpen}
                aria-controls={open ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{ p: 0 }}
              >
                <Avatar 
                  sx={{ 
                    width: { xs: 24, sm: 28 }, 
                    height: { xs: 24, sm: 28 }, 
                    bgcolor: '#004aad',
                    fontSize: { xs: '10px', sm: '12px' },
                    cursor: 'pointer'
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleProfileMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'profile-button',
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    mt: 1.5,
                    width: { xs: 200, sm: 220 },
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                {isMobile && (
                  <MenuItem onClick={handleMobileRoleChange} sx={{ py: 1.5 }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography variant="body2">Switch Role ({currentRole})</Typography>
                  </MenuItem>
                )}
                <MenuItem onClick={handlePreferences} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <TuneIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2">Preferences</Typography>
                </MenuItem>
                <MenuItem onClick={handleSignOut} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <Typography variant="body2">Sign out</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Box>
        
        {/* Page content */}
        <Box sx={{ 
          p: { xs: 2, sm: 3 }, 
          flex: 1, 
          overflowY: 'auto',
          maxWidth: '100%'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}