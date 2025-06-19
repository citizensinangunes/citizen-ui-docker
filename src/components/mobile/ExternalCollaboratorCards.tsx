import React from 'react';
import {
  Box,
  Typography
} from '@mui/material';
import {
  TeamBadge,
  CustomStatusBadge,
  ActionButton
} from '@/components/ui';

interface PendingInvite {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string;
  status: string;
}

interface ExternalMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

interface PendingInviteCardProps {
  invite: PendingInvite;
  isAdmin: boolean;
  onApprove: (id: number) => void;
  onDecline: (id: number) => void;
}

interface ExternalMemberCardProps {
  member: ExternalMember;
  isAdmin: boolean;
}

export const PendingInviteCard: React.FC<PendingInviteCardProps> = ({ 
  invite, 
  isAdmin, 
  onApprove, 
  onDecline 
}) => (
  <Box sx={{ 
    p: { xs: 1.5, sm: 2 }, 
    border: '1px solid #e0e0e0', 
    borderRadius: 2, 
    mb: 2,
    bgcolor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
          {invite.email}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          Invited by: John Doe
        </Typography>
      </Box>
      <CustomStatusBadge status={invite.status} responsive />
    </Box>
    
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: '0.8rem' }}>
        Team:
      </Typography>
      <TeamBadge team={invite.team} responsive />
    </Box>
    
    {isAdmin ? (
      <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <ActionButton 
          variant="approve"
          onClick={() => onApprove(invite.id)}
          responsive
          sx={{ flex: 1 }}
        >
          Approve
        </ActionButton>
        <ActionButton 
          variant="reject"
          onClick={() => onDecline(invite.id)}
          responsive
          sx={{ flex: 1 }}
        >
          {invite.status === 'Request' ? 'Reject' : 'Decline'}
        </ActionButton>
      </Box>
    ) : (
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
        Waiting for admin approval
      </Typography>
    )}
  </Box>
);

export const ExternalMemberCard: React.FC<ExternalMemberCardProps> = ({ 
  member, 
  isAdmin 
}) => (
  <Box sx={{ 
    p: { xs: 1.5, sm: 2 }, 
    border: '1px solid #e0e0e0', 
    borderRadius: 2, 
    mb: 2,
    bgcolor: 'white',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
          {member.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          {member.email}
        </Typography>
      </Box>
      <Box sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
        borderRadius: 1,
        color: '#9e9e9e',
        fontWeight: 500,
        fontSize: '0.75rem'
      }}>
        {member.role}
      </Box>
    </Box>
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
        Last active: {member.lastActive}
      </Typography>
      {isAdmin && (
        <ActionButton variant="remove" responsive>
          Remove
        </ActionButton>
      )}
    </Box>
  </Box>
); 