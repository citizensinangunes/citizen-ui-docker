import { User } from './user.types';
import { Role } from './common.types';

// Authentication request types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  inviteToken?: string;
  siteId?: string;
  acceptTerms?: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Authentication response types
export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  message?: string;
  error?: string;
}

export interface LoginResponse extends AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterResponse extends AuthResponse {
  user: User;
  token: string;
  requiresEmailVerification?: boolean;
}

// Session and token types
export interface AuthSession {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: string;
  issuedAt: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: Role;
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Email verification
export interface EmailVerificationRequest {
  token: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
}

export interface ResendVerificationRequest {
  email: string;
}

// Two-factor authentication
export interface TwoFactorSetupRequest {
  password: string;
}

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyRequest {
  code: string;
  backupCode?: string;
}

export interface TwoFactorDisableRequest {
  password: string;
  code: string;
}

// OAuth types
export interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export interface OAuthRequest {
  provider: string;
  redirectUrl?: string;
  state?: string;
}

export interface OAuthResponse {
  authUrl: string;
  state: string;
}

export interface OAuthCallbackRequest {
  provider: string;
  code: string;
  state: string;
}

// Permission and role types
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: Partial<User>) => void;
}

// Invitation types
export interface InviteTokenData {
  token: string;
  siteId?: string;
  teamId?: string;
  role: Role;
  email?: string;
  expiresAt: string;
  invitedBy: number;
} 