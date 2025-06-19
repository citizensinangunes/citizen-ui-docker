import { BaseEntity, Role, Status, InvitationStatus } from './common.types';
import { User } from './user.types';

// Team core interfaces
export interface Team extends BaseEntity {
  name: string;
  description?: string;
  department?: string;
  memberCount: number;
  access: 'admin' | 'citizen' | 'viewer';
  organizationId?: number;
  settings?: TeamSettings;
  members?: TeamMember[];
}

export interface TeamSettings {
  isPublic: boolean;
  allowSelfJoin: boolean;
  requireApproval: boolean;
  maxMembers?: number;
  defaultRole: Role;
}

// Team membership
export interface TeamMember extends BaseEntity {
  teamId: number;
  userId: number;
  role: Role;
  status: Status;
  joinedAt: string;
  invitedBy?: number;
  user?: User;
}

// Team invitations
export interface TeamInvitation extends BaseEntity {
  teamId: number;
  email: string;
  role: Role;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt?: string;
  acceptedBy?: number;
  invitedBy: number;
  inviter?: User;
  team?: Team;
}

// Team access to sites
export interface TeamSiteAccess extends BaseEntity {
  teamId: number;
  siteId: number;
  role: 'admin' | 'citizen' | 'viewer';
  grantedBy: number;
  grantedAt: string;
}

// Request/Response types
export interface CreateTeamRequest {
  name: string;
  description?: string;
  department?: string;
  settings?: Partial<TeamSettings>;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  department?: string;
  settings?: Partial<TeamSettings>;
}

export interface TeamResponse {
  team: Team;
}

export interface TeamsResponse {
  teams: Team[];
}

// Team member management
export interface AddTeamMemberRequest {
  userId?: number;
  email?: string;
  role: Role;
}

export interface UpdateTeamMemberRequest {
  role?: Role;
  status?: Status;
}

export interface RemoveTeamMemberRequest {
  userId: number;
  reason?: string;
}

// Team invitations
export interface InviteToTeamRequest {
  email: string;
  role: Role;
  message?: string;
  expiresIn?: number; // hours, default 168 (7 days)
}

export interface InviteToTeamResponse {
  invitation: TeamInvitation;
  inviteLink: string;
}

export interface AcceptTeamInviteRequest {
  token: string;
}

export interface ResendTeamInviteRequest {
  invitationId: number;
}

// Team statistics
export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  pendingInvitations: number;
  totalSites: number;
  activeSites: number;
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
}

// Team activity
export interface TeamActivity extends BaseEntity {
  teamId: number;
  userId: number;
  action: string;
  resource: string;
  resourceId?: number;
  metadata?: Record<string, any>;
  user?: User;
}

// Team permissions
export interface TeamPermission {
  id: string;
  name: string;
  description: string;
  category: 'sites' | 'members' | 'settings' | 'deployments';
}

export interface TeamRolePermissions {
  role: Role;
  permissions: TeamPermission[];
}

// Team dashboard data
export interface TeamDashboard {
  team: Team;
  stats: TeamStats;
  recentActivity: TeamActivity[];
  members: TeamMember[];
  pendingInvitations: TeamInvitation[];
  sites: TeamSiteAccess[];
} 