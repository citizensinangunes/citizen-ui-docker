import { BaseEntity, Status, Environment, DeploymentStatus } from './common.types';
import { User } from './user.types';
import type { DeploymentStats } from './deployment.types';

// Framework types
export interface Framework {
  id: number;
  name: string;
  logo?: string;
  version?: string;
  buildCommand?: string;
  startCommand?: string;
  outputDirectory?: string;
}

// Site core interfaces
export interface Site extends BaseEntity {
  name: string;
  description?: string;
  subdomain: string;
  siteUuid: string;
  status: Status;
  language?: string;
  visibility: 'public' | 'private';
  
  // Repository info
  repositoryUrl?: string;
  repositoryName?: string;
  branch: string;
  autoDeploy: boolean;
  
  // Relationships
  ownerId: number;
  owner?: User;
  teamId?: number;
  team?: SiteTeam;
  frameworkId?: number;
  framework?: Framework;
  
  // Timestamps
  lastDeployedAt?: string;
  
  // Configuration
  configuration?: SiteConfiguration;
  domains?: SiteDomain[];
  
  // Stats
  deploymentStats?: DeploymentStats;
}

// Site configuration
export interface SiteConfiguration extends BaseEntity {
  siteId: number;
  buildCommand?: string;
  startCommand?: string;
  installCommand?: string;
  outputDirectory: string;
  rootDirectory?: string;
  nodeVersion: string;
  npmVersion?: string;
  autoDeploy: boolean;
  headers: Record<string, string>;
  redirects: SiteRedirect[];
  rewrites: SiteRewrite[];
  httpsOnly: boolean;
  environmentVariables: Record<string, string>;
  buildCacheEnabled: boolean;
  previewDeploymentsEnabled: boolean;
}

// Site domain
export interface SiteDomain extends BaseEntity {
  siteId: number;
  domainName: string;
  isPrimary: boolean;
  verificationStatus: 'pending' | 'verified' | 'failed';
  dnsRecords?: DnsRecord[];
  certificate?: SiteCertificate;
}

// DNS and SSL
export interface DnsRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT';
  name: string;
  value: string;
  ttl?: number;
}

export interface SiteCertificate extends BaseEntity {
  siteId: number;
  domainId: number;
  domain: string;
  issuer: string;
  status: 'active' | 'pending' | 'expired' | 'error';
  issueDate: string;
  expiryDate: string;
  autoRenew: boolean;
}

// Site redirects and rewrites
export interface SiteRedirect {
  from: string;
  to: string;
  status: number;
  force?: boolean;
}

export interface SiteRewrite {
  from: string;
  to: string;
}

// Site team and access
export interface SiteTeam {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
  department?: string;
  access: 'admin' | 'citizen' | 'viewer';
}

export interface SiteAccess extends BaseEntity {
  siteId: number;
  userId?: number;
  teamId?: number;
  role: 'owner' | 'admin' | 'citizen' | 'viewer';
  grantedBy: number;
}

// Site invitation
export interface SiteInvitation extends BaseEntity {
  siteId: number;
  token: string;
  email?: string;
  role: 'admin' | 'citizen' | 'viewer';
  expiresAt: string;
  acceptedAt?: string;
  acceptedBy?: number;
  createdBy: number;
}

// Site metrics
export interface SiteMetrics extends BaseEntity {
  siteId: number;
  collectedAt: string;
  uptimePercentage?: number;
  performanceStatus?: string;
  responseTimeMs?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  storageUsage?: number;
  visitorsCount?: number;
  pageViews?: number;
  uniqueVisitors?: number;
  bounceRate?: number;
  avgSessionDuration?: number;
  geoDistribution?: Record<string, number>;
  deviceBreakdown?: Record<string, number>;
  browserBreakdown?: Record<string, number>;
}

// Request/Response types
export interface CreateSiteRequest {
  name: string;
  description?: string;
  subdomain: string;
  teamSize?: string;
  framework?: string;
  language?: string;
  repositoryUrl?: string;
  branch?: string;
}

export interface UpdateSiteRequest {
  name?: string;
  description?: string;
  status?: Status;
  repositoryUrl?: string;
  branch?: string;
  autoDeploy?: boolean;
  visibility?: 'public' | 'private';
}

export interface SiteResponse {
  site: Site;
}

export interface SitesResponse {
  sites: Site[];
}

export interface SiteDetailsResponse {
  site: Site;
}

// Site sharing
export interface ShareSiteRequest {
  role?: 'viewer' | 'citizen' | 'admin';
  expiresIn?: number; // hours
}

export interface ShareSiteResponse {
  token: string;
  siteId: string;
  role: string;
  inviteLink: string;
  expiresAt: string;
  createdAt: string;
}

// Legacy compatibility (to be removed)
export interface SiteDetails extends Site {
  siteId: string; // UUID field for backward compatibility
  repoUrl?: string; // Alias for repositoryUrl
  repoName?: string; // Alias for repositoryName
} 