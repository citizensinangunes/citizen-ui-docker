import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper,
  Collapse,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Button,
  TeamMemberTable,
  TeamAddForm,
  PeopleIcon,
  GroupAddIcon,
  ExpandMoreIcon,
  ExpandLessIcon
} from '@/components/ui';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  team: string;
  status: string;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  department?: string;
  access: string;
}

interface SiteTeamAccessProps {
  teams: Team[];
  teamMembers: TeamMember[];
  isAdmin: boolean;
}

const SiteTeamAccess: React.FC<SiteTeamAccessProps> = ({ teams, teamMembers, isAdmin }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [expandedTeam, setExpandedTeam] = useState<string | null>('core-001');
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);

  const coreTeam = teams.find(team => team.id === 'core-001');
  const productTeam = teams.find(team => team.id === 'product-005');
  const guestTeams = teams.filter(team => team.access === 'viewer');

  const handleToggleTeam = (teamId: string) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId);
  };

  const handleAddTeam = (teamId: string, accessLevel: string) => {
    // Handle add team logic here
    console.log('Adding team:', teamId, 'with access:', accessLevel);
    setShowAddTeamForm(false);
  };

  const handleManageMembers = () => {
    router.push('/team');
  };

  const renderTeamAccordion = (team: Team, iconColor: string, isPrimary: boolean = false) => {
    const isExpanded = expandedTeam === team.id;
    const filteredMembers = teamMembers.filter(member => member.team === team.name);
    
    return (
      <Paper 
        key={team.id}
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2
        }}
      >
        <Box 
          sx={{ 
            p: 0,  
            border: '1px solid #e0e0e0',
            borderRadius: 2
          }}
        >
          {/* Team Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: isMobile ? 1.5 : 2,
              cursor: 'pointer',
              bgcolor: isExpanded ? 'rgba(0, 74, 173, 0.05)' : 'transparent',
              borderBottom: isExpanded ? '1px solid #e0e0e0' : 'none',
              borderRadius: !isExpanded ? 2 : '2px 2px 0 0'
            }}
            onClick={() => handleToggleTeam(team.id)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <PeopleIcon 
                sx={{ 
                  color: iconColor,
                  mr: isMobile ? 1.5 : 2,
                  flexShrink: 0
                }} 
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight={500}
                  sx={{ 
                    fontSize: isMobile ? '0.875rem' : '1rem',
                    wordBreak: 'break-word'
                  }}
                >
                  {team.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: isMobile ? '0.75rem' : '0.875rem'
                  }}
                >
                  {team.memberCount} members • {team.access} access
                </Typography>
              </Box>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flexShrink: 0,
              ml: 1
            }}>
              {isPrimary && (
                <Box 
                  sx={{ 
                    px: isMobile ? 1 : 1.5, 
                    py: 0.5, 
                    borderRadius: 1,
                    bgcolor: 'rgba(0,74,173,0.1)',
                    color: '#004aad',
                    mr: isMobile ? 1 : 2,
                    fontSize: isMobile ? '0.625rem' : '0.75rem',
                    fontWeight: 500
                  }}
                >
                  Primary Team
                </Box>
              )}
              {isExpanded ? (
                <ExpandLessIcon sx={{ color: '#666' }} />
              ) : (
                <ExpandMoreIcon sx={{ color: '#666' }} />
              )}
            </Box>
          </Box>
          
          {/* Team Content */}
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: isMobile ? 1.5 : 2 }}>
              {team.id === 'core-001' ? (
                <TeamMemberTable
                  members={filteredMembers}
                  onManageClick={handleManageMembers}
                  responsive
                />
              ) : (
                <>
                  {team.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      paragraph
                      sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
                    >
                      {team.description}
                    </Typography>
                  )}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: team.access === 'viewer' ? 'space-between' : 'flex-end',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 1 : 2
                  }}>
                    {team.access === 'viewer' && (
                      <Button
                        size="small"
                        variant="outline"
                        fullWidth={isMobile}
                        sx={{
                          borderColor: '#004aad',
                          color: '#004aad',
                          '&:hover': { borderColor: '#003a87', bgcolor: 'rgba(0,74,173,0.04)' }
                        }}
                      >
                        Upgrade to Citizen
                      </Button>
                    )}
                    <Button
                      size="small"
                      variant="outline"
                      fullWidth={isMobile}
                      sx={{
                        borderColor: '#f44336',
                        color: '#f44336',
                        '&:hover': { borderColor: '#d32f2f', bgcolor: 'rgba(244,67,54,0.04)' }
                      }}
                    >
                      Remove Access
                    </Button>
                  </Box>
                </>
              )}
            </Box>
          </Collapse>
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1.5 : 0
      }}>
        <Typography variant="h6">Teams with Access</Typography>
        <Button
          variant="primary"
          startIcon={<GroupAddIcon />}
          onClick={() => setShowAddTeamForm(!showAddTeamForm)}
          fullWidth={isMobile}
          sx={{
            bgcolor: '#004aad',
            color: 'white',
            '&:hover': { bgcolor: '#003a87' },
            fontWeight: 500
          }}
        >
          Add Team
        </Button>
      </Box>
      
      {/* Add Team Form */}
      {showAddTeamForm && (
        <TeamAddForm
          teams={teams}
          excludeTeamIds={['core-001', ...guestTeams.map(t => t.id)]}
          onSubmit={handleAddTeam}
          onCancel={() => setShowAddTeamForm(false)}
          responsive
        />
      )}
      
      {/* Core Team Section */}
      {coreTeam && renderTeamAccordion(coreTeam, '#004aad', true)}
      
      {/* Product Team Section */}
      {productTeam && renderTeamAccordion(productTeam, '#ff9800')}
      
      {/* Guest Teams Section */}
      {guestTeams.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
            Guest Teams (View Only)
          </Typography>
          {guestTeams.map(team => renderTeamAccordion(team, '#9e9e9e'))}
        </>
      )}
    </Box>
  );
};

export default SiteTeamAccess; 