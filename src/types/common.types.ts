// Common types used across the application

export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

export type Environment = 'development' | 'staging' | 'production';

export type Role = 'admin' | 'citizen' | 'viewer' | 'external';

export type DeploymentStatus = 'pending' | 'building' | 'success' | 'error' | 'cancelled';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export type CertificateStatus = 'active' | 'pending' | 'expired' | 'error';

export type NotificationLevel = 'info' | 'warning' | 'error' | 'success';

// Base entity interface
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Generic API response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// File upload
export interface FileUpload {
  name: string;
  size: number;
  type: string;
  url?: string;
}

// Metadata
export interface Metadata {
  [key: string]: any;
} 