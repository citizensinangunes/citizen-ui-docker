import { BaseEntity, Status } from './common.types';
import type { Role } from './common.types';

// User interfaces
export interface User extends BaseEntity {
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  avatar?: string;
  role: Role;
  status: Status;
  lastLoginAt?: string;
  emailVerified: boolean;
  organizationId?: number;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  deployments: boolean;
  security: boolean;
  marketing: boolean;
}

// User creation/update
export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: Role;
  inviteToken?: string;
  siteId?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: Partial<UserPreferences>;
}

// User responses
export interface UserResponse {
  user: User;
}

export interface UsersResponse {
  users: User[];
}

// Profile
export interface UserProfile extends User {
  organizations: UserOrganization[];
  teams: UserTeam[];
  sites: UserSite[];
}

export interface UserOrganization {
  id: number;
  name: string;
  role: Role;
  joinedAt: string;
}

export interface UserTeam {
  id: number;
  name: string;
  role: Role;
  joinedAt: string;
}

export interface UserSite {
  id: number;
  name: string;
  role: Role;
  accessLevel: 'owner' | 'admin' | 'citizen' | 'viewer';
  joinedAt: string;
} 