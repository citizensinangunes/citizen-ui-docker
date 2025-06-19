/**
 * Application constants
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
export const API_TIMEOUT = 30000; // 30 seconds

// Authentication
export const AUTH_TOKEN_KEY = 'auth_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes in milliseconds

// Site Configuration
export const SITE_LIMITS = {
  MAX_SITES_PER_USER: 10,
  MAX_DOMAINS_PER_SITE: 5,
  MAX_TEAM_MEMBERS: 50,
  MAX_DEPLOYMENTS_HISTORY: 100,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
} as const;

// Deployment Status
export const DEPLOYMENT_STATUS = {
  PENDING: 'pending',
  BUILDING: 'building',
  SUCCESS: 'success',
  ERROR: 'error',
  CANCELLED: 'cancelled',
} as const;

// Site Status
export const SITE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  CITIZEN: 'citizen',
  VIEWER: 'viewer',
  OWNER: 'owner',
} as const;

// Framework Icons Mapping
export const FRAMEWORK_ICONS: Record<string, string> = {
  'Next.js': '/next.svg',
  'React': '/react.svg',
  'Node.js': '/nodejs.svg',
  'Python': '/python.svg',
  'Docker': '/docker.svg',
  'JavaScript': '/js.svg',
  'PostgreSQL': '/postgresql.svg',
  'Ruby': '/ruby.svg',
  'PHP': '/php.svg',
  'Go': '/go.svg',
};

// Language Colors
export const LANGUAGE_COLORS: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f7df1e',
  'Python': '#3776ab',
  'Ruby': '#cc342d',
  'PHP': '#777bb4',
  'Go': '#00add8',
  'Java': '#ed8b00',
  'C#': '#239120',
  'C++': '#00599c',
  'Rust': '#000000',
};

// Navigation Routes
export const ROUTES = {
  HOME: '/',
  SITES: '/sites',
  TEAMS: '/team',
  DOMAINS: '/domains',
  SETTINGS: '/settings',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'citizen-theme',
  SIDEBAR_COLLAPSED: 'citizen-sidebar-collapsed',
  RECENT_SITES: 'citizen-recent-sites',
  USER_PREFERENCES: 'citizen-user-preferences',
} as const; 