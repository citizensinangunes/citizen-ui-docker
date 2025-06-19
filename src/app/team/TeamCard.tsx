import React from 'react';
import { 
  Card, 
  CardContent, 
  CardActions, 
  Typography, 
  Box, 
  Avatar, 
  AvatarGroup, 
  Chip, 
  Button, 
  Divider 
} from '@mui/material';
import { 
  Group as TeamIcon, 
  Info as InfoIcon, 
  People as PeopleIcon 
} from '@mui/icons-material';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'citizen' | 'viewer';
  avatar: string;
  status: 'active' | 'pending' | 'disabled';
}

interface Team {
  id: number;
  name: string;
  description: string;
  members: number[];
  createdAt: string;
  updatedAt: string;
}

interface TeamCardProps {
  team: Team;
  members: TeamMember[];
  onViewDetails: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, members, onViewDetails }) => {
  // Calculate role counts
  const admins = members.filter(m => m.role === 'admin').length;
  const citizens = members.filter(m => m.role === 'citizen').length;
  const viewers = members.filter(m => m.role === 'viewer').length;
  
  // Calculate active members
  const activeMembers = members.filter(m => m.status === 'active').length;
  
  return (
    <Card 
      elevation={0} 
      sx={{ 
        border: '1px solid #e0e0e0', 
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Team Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TeamIcon sx={{ color: '#004aad', mr: 1 }} />
          <Typography variant="h6" fontWeight={500}>
            {team.name}
          </Typography>
        </Box>
        
        {/* Team Description */}
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3, 
            height: 40, 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {team.description}
        </Typography>
        
        {/* Team Members */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight={500} gutterBottom>
            Team Members ({members.length})
          </Typography>
          
          <AvatarGroup max={5} sx={{ mb: 2, justifyContent: 'flex-start' }}>
            {members.map((member) => (
              <Avatar 
                key={member.id} 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: member.role === 'admin' ? '#004aad' : 
                          member.role === 'citizen' ? '#ff9800' : '#9e9e9e',
                  fontSize: '0.875rem',
                  opacity: member.status === 'pending' ? 0.6 : 1
                }}
              >
                {member.avatar}
              </Avatar>
            ))}
          </AvatarGroup>
          
          {/* Role Distribution */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {admins > 0 && (
              <Chip
                label={`${admins} Admin${admins !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  bgcolor: '#4caf5020',
                  color: '#4caf50',
                  fontSize: '0.75rem'
                }}
              />
            )}
            
            {citizens > 0 && (
              <Chip
                label={`${citizens} Citizen${citizens !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  bgcolor: '#ff980020',
                  color: '#ff9800',
                  fontSize: '0.75rem'
                }}
              />
            )}
            
            {viewers > 0 && (
              <Chip
                label={`${viewers} Viewer${viewers !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  bgcolor: '#90909020',
                  color: '#909090',
                  fontSize: '0.75rem'
                }}
              />
            )}
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Team Metadata */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <Typography variant="body2" color="text.secondary">Created:</Typography>
          <Typography variant="body2">{new Date(team.createdAt).toLocaleDateString()}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <Typography variant="body2" color="text.secondary">Last Updated:</Typography>
          <Typography variant="body2">{new Date(team.updatedAt).toLocaleDateString()}</Typography>
        </Box>
      </CardContent>
      
      {/* Card Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          size="small" 
          startIcon={<InfoIcon />}
          onClick={onViewDetails}
          sx={{ color: '#004aad' }}
        >
          View Details
        </Button>
        <Button 
          size="small" 
          startIcon={<PeopleIcon />}
          sx={{ color: '#004aad' }}
        >
          Manage Members
        </Button>
      </CardActions>
    </Card>
  );
};

export default TeamCard;