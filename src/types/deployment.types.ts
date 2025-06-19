import { BaseEntity, DeploymentStatus, Environment } from './common.types';
import { User } from './user.types';

// Deployment core interfaces
export interface Deployment extends BaseEntity {
  siteId: number;
  userId: number;
  status: DeploymentStatus;
  environment: Environment;
  branch: string;
  commitSha?: string;
  commitMessage?: string;
  commitAuthor?: string;
  commitUrl?: string;
  isProduction: boolean;
  isAutoDeployment: boolean;
  buildId?: string;
  buildTime?: number; // seconds
  deployTime?: number; // seconds
  deployUrl?: string;
  previewUrl?: string;
  logUrl?: string;
  errorMessage?: string;
  user?: User;
  metadata?: DeploymentMetadata;
}

// Deployment metadata
export interface DeploymentMetadata extends BaseEntity {
  deploymentId: number;
  dependencies: Record<string, string>;
  buildOutput?: Record<string, any>;
  bundleSize?: number;
  frameworkVersion?: string;
  performanceScore?: PerformanceScore;
}

export interface PerformanceScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
}

// Build configuration
export interface BuildConfiguration {
  command: string;
  directory: string;
  environment: Record<string, string>;
  nodeVersion: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  installCommand?: string;
  buildCommand: string;
  outputDirectory: string;
  cacheEnabled: boolean;
  timeout: number; // minutes
}

// Deployment logs
export interface DeploymentLog extends BaseEntity {
  deploymentId: number;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  source: 'build' | 'deploy' | 'system';
  metadata?: Record<string, any>;
}

// Deployment hooks
export interface DeploymentHook extends BaseEntity {
  siteId: number;
  name: string;
  url: string;
  events: DeploymentEvent[];
  secret?: string;
  isActive: boolean;
  lastTriggered?: string;
  lastStatus?: 'success' | 'failed';
  retryCount: number;
  maxRetries: number;
}

export type DeploymentEvent = 
  | 'deploy_started'
  | 'deploy_success'
  | 'deploy_failed'
  | 'deploy_cancelled'
  | 'build_started'
  | 'build_success'
  | 'build_failed';

// Preview deployments
export interface PreviewDeployment extends BaseEntity {
  siteId: number;
  deploymentId: number;
  pullRequestId?: number;
  pullRequestUrl?: string;
  branch: string;
  previewUrl: string;
  status: DeploymentStatus;
  expiresAt?: string;
  isPublic: boolean;
  passwordProtected: boolean;
  password?: string;
}

// Deployment statistics
export interface DeploymentStats {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageBuildTime: number;
  averageDeployTime: number;
  lastDeployment?: Deployment;
  deploymentFrequency: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// Request/Response types
export interface CreateDeploymentRequest {
  siteId: number;
  branch?: string;
  environment?: Environment;
  commitSha?: string;
  isProduction?: boolean;
  clearCache?: boolean;
}

export interface DeploymentResponse {
  deployment: Deployment;
}

export interface DeploymentsResponse {
  deployments: Deployment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface DeploymentLogsResponse {
  logs: DeploymentLog[];
  hasMore: boolean;
  nextCursor?: string;
}

// Rollback
export interface RollbackRequest {
  deploymentId: number;
  reason?: string;
}

export interface RollbackResponse {
  deployment: Deployment;
  rollbackDeployment: Deployment;
}

// Cancel deployment
export interface CancelDeploymentRequest {
  deploymentId: number;
  reason?: string;
}

// Retry deployment
export interface RetryDeploymentRequest {
  deploymentId: number;
  clearCache?: boolean;
}

// Deployment filters
export interface DeploymentFilters {
  status?: DeploymentStatus[];
  environment?: Environment[];
  branch?: string[];
  isProduction?: boolean;
  userId?: number[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Build cache
export interface BuildCache extends BaseEntity {
  siteId: number;
  cacheKey: string;
  size: number;
  lastUsed: string;
  hitCount: number;
  expiresAt?: string;
}

// Deployment notifications
export interface DeploymentNotification extends BaseEntity {
  deploymentId: number;
  type: 'email' | 'webhook' | 'slack';
  recipient: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  errorMessage?: string;
  retryCount: number;
} 