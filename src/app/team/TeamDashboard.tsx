"use client";

import React, { useState } from 'react';
import { GridLegacy as Grid } from '@mui/material';
import { 
  Box, 
  Typography, 
  Button, 
  Paper,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  InsertChart as ChartIcon,
  Group as TeamIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useRole } from '@/context/RoleContext';

import TeamCard from './TeamCard';
import CreateTeam from './CreateTeam';
import TeamDetails from './TeamDetails';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'citizen' | 'viewer';
  avatar: string;
  department?: string;
  joinedAt: string;
  status: 'active' | 'pending' | 'disabled';
  lastActive?: string;
  projects?: number;
}

interface Team {
  id: number;
  name: string;
  description: string;
  members: number[];
  createdAt: string;
  updatedAt: string;
  department?: string;
}

// Mock data for team members (aynı)
const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: 'Ahmet Sinan Gunes',
    email: 'asinang.su@gmail.com',
    role: 'admin',
    avatar: 'A',
    department: 'Engineering',
    joinedAt: '2023-01-15',
    status: 'active',
    lastActive: '2 hours ago',
    projects: 5
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'citizen',
    avatar: 'S',
    department: 'Product',
    joinedAt: '2023-02-20',
    status: 'active',
    lastActive: '1 day ago',
    projects: 3
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@company.com',
    role: 'citizen',
    avatar: 'M',
    department: 'Marketing',
    joinedAt: '2023-03-10',
    status: 'active',
    lastActive: '3 days ago',
    projects: 2
  },
  {
    id: 4,
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@company.com',
    role: 'viewer',
    avatar: 'L',
    department: 'Sales',
    joinedAt: '2023-04-05',
    status: 'active',
    lastActive: 'Just now',
    projects: 1
  },
  {
    id: 5,
    name: 'David Thompson',
    email: 'david.thompson@company.com',
    role: 'viewer',
    avatar: 'D',
    department: 'Support',
    joinedAt: '2023-04-15',
    status: 'pending',
    projects: 0
  },
  {
    id: 6,
    name: 'Emily Parker',
    email: 'emily.parker@company.com',
    role: 'citizen',
    avatar: 'E',
    department: 'Engineering',
    joinedAt: '2023-05-20',
    status: 'active',
    lastActive: '5 days ago',
    projects: 4
  },
  {
    id: 7,
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'viewer',
    avatar: 'J',
    department: 'Finance',
    joinedAt: '2023-06-10',
    status: 'active',
    lastActive: '2 weeks ago',
    projects: 1
  }
];

// Takımlar için departman eklenmiş şekilde yeni veri
const initialTeams: Team[] = [
  {
    id: 1,
    name: 'Core Team',
    description: 'Main team with primary access to all resources',
    members: [1, 2, 3, 6],
    createdAt: '2023-01-01',
    updatedAt: '2023-06-15',
    department: 'Engineering'
  },
  {
    id: 2,
    name: 'External Collaborators',
    description: 'External stakeholders with limited site access',
    members: [4, 5, 7],
    createdAt: '2023-02-10',
    updatedAt: '2023-06-20',
    department: 'Business'
  },
  {
    id: 3,
    name: 'Design Team',
    description: 'Responsible for UI/UX design and visual assets',
    members: [3, 6],
    createdAt: '2023-03-15',
    updatedAt: '2023-05-10',
    department: 'Design'
  },
  {
    id: 4,
    name: 'Marketing Team',
    description: 'Handles all marketing initiatives and campaigns',
    members: [3, 7],
    createdAt: '2023-04-10',
    updatedAt: '2023-06-05',
    department: 'Marketing'
  },
  {
    id: 5,
    name: 'Product Development',
    description: 'Manages product roadmap and feature development',
    members: [1, 2, 5],
    createdAt: '2023-02-15',
    updatedAt: '2023-05-20',
    department: 'Product'
  },
  {
    id: 6,
    name: 'Sales Team',
    description: 'Handles customer acquisition and account management',
    members: [4, 7],
    createdAt: '2023-03-01',
    updatedAt: '2023-04-25',
    department: 'Sales'
  }
];

// Varsayılan olarak giriş yapmış kullanıcının ID'si
// Gerçek uygulamada auth context'ten alınacak
const currentUserId = 2; // Örnek olarak Sarah Johnson (citizen role)

// TeamDashboard component
const TeamDashboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [openCreateTeamDialog, setOpenCreateTeamDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Role context'ini kullan
  const { currentRole } = useRole();
  
  // Filter options
  const departments = Array.from(new Set(teams.map(team => team.department)));
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Create new team
  const handleCreateTeam = (name: string, description: string) => {
    const newTeam: Team = {
      id: teams.length + 1,
      name,
      description,
      members: [currentUserId], // Geçerli kullanıcıyı ekler
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      department: 'Engineering' // Varsayılan departman
    };
    
    setTeams([...teams, newTeam]);
  };
  
  // View team details
  const handleViewTeamDetails = (team: Team) => {
    setSelectedTeam(team);
    setOpenDetailsDialog(true);
  };
  
  // Get team members
  const getTeamMembers = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    return team.members.map(memberId => 
      teamMembers.find(m => m.id === memberId)
    ).filter(Boolean) as TeamMember[];
  };
  
  // Kullanıcının rolüne göre görüntülenecek takımları filtrele
  const getUserTeams = () => {
    // Admin tüm takımları görebilir
    if (currentRole === 'admin') {
      return teams;
    }
    
    // Citizen ve Viewer sadece üyesi olduğu takımları görebilir
    if (currentRole === 'citizen' || currentRole === 'viewer') {
      return teams.filter(team => team.members.includes(currentUserId));
    }
    
    // Diğer roller için tüm takımları göster
    return teams;
  };
  
  // Kullanıcıya göre filtrelenmiş takımlar
  const userTeams = getUserTeams();
  
  // Filter teams based on tab and search
  const filteredTeams = userTeams.filter(team => {
    // First filter by search term
    const matchesSearch = 
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.department && team.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Then filter by selected tab
    if (tabValue === 0) {
      return matchesSearch; // All teams
    } else if (tabValue === 1) {
      return matchesSearch && team.department === 'Engineering';
    } else if (tabValue === 2) {
      return matchesSearch && team.department === 'Design';
    } else if (tabValue === 3) {
      return matchesSearch && !['Engineering', 'Design'].includes(team.department || '');
    }
    
    return matchesSearch;
  });
  
  // Kullanıcıya özel dashboard başlığı 
  const getDashboardTitle = () => {
    if (currentRole === 'admin') {
      return "Teams Dashboard";
    } else if (currentRole === 'citizen' || currentRole === 'viewer') {
      return "My Teams";
    } else {
      return "Teams View";
    }
  };
  
  return (
    <Box sx={{ py: 3, px: 4 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Box>
          <Typography variant="h5" fontWeight={500} color="#004aad" gutterBottom>
            {getDashboardTitle()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentRole === 'citizen' 
              ? "View all teams you're a member of" 
              : "Manage all teams and their members in one place"}
          </Typography>
        </Box>
        
        {/* Sadece admin ve citizen yeni takım oluşturabilir */}
        {(currentRole === 'admin' || currentRole === 'citizen') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateTeamDialog(true)}
            sx={{
              bgcolor: '#004aad',
              color: 'white',
              '&:hover': { bgcolor: '#003a87' },
              fontWeight: 500
            }}
          >
            New Team
          </Button>
        )}
      </Box>
      
      {/* Overview stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TeamIcon sx={{ color: '#004aad', mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                {currentRole === 'citizen' ? "My Teams" : "Total Teams"}
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={500} color="#004aad">
              {userTeams.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentRole === 'citizen' 
                ? `Across ${Array.from(new Set(userTeams.map(t => t.department))).length} departments` 
                : `Across ${departments.length} departments`}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PeopleIcon sx={{ color: '#ff9800', mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Team Members
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={500} color="#ff9800">
              {currentRole === 'citizen' 
                ? userTeams.reduce((count, team) => count + team.members.length, 0)
                : teamMembers.filter(m => m.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentRole === 'citizen' 
                ? 'Working together' 
                : `${teamMembers.filter(m => m.status === 'pending').length} pending invitations`}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Departments
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={500} color="#4caf50">
              {Array.from(new Set(userTeams.map(t => t.department))).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {currentRole === 'citizen' 
                ? 'Cross-functional collaboration' 
                : `${Math.round(userTeams.length / departments.length)} teams per department`}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ChartIcon sx={{ color: '#9c27b0', mr: 1 }} />
              <Typography variant="subtitle1" fontWeight={500}>
                Avg. Team Size
              </Typography>
            </Box>
            <Typography variant="h4" fontWeight={500} color="#9c27b0">
              {userTeams.length > 0 
                ? Math.round(userTeams.reduce((sum, team) => sum + team.members.length, 0) / userTeams.length) 
                : 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userTeams.length > 0 
                ? `${userTeams.reduce((max, team) => Math.max(max, team.members.length), 0)} max team size` 
                : 'No teams available'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Filter section */}
      <Paper elevation={0} sx={{ p: 0, mb: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          bgcolor: '#fafafa'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#004aad',
              }
            }}
          >
            <Tab label="All Teams" />
            <Tab label="Engineering" />
            <Tab label="Design" />
            <Tab label="Other" />
          </Tabs>
          
          <TextField
            placeholder="Search teams..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              }
            }}
          />
        </Box>
        
        {/* Teams grid */}
        <Box sx={{ p: 3 }}>
          {filteredTeams.length > 0 ? (
            <Grid container spacing={3}>
              {filteredTeams.map((team) => (
                <Grid item xs={12} sm={6} md={4} key={team.id}>
                  <TeamCard 
                    team={team}
                    members={getTeamMembers(team.id)}
                    onViewDetails={() => handleViewTeamDetails(team)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">
                {currentRole === 'citizen' 
                  ? "You're not a member of any teams matching your search criteria" 
                  : "No teams found matching your search criteria"}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Dialogs */}
      <CreateTeam
        open={openCreateTeamDialog}
        onClose={() => setOpenCreateTeamDialog(false)}
        onCreate={handleCreateTeam}
      />
      
      {selectedTeam && (
        <TeamDetails
          open={openDetailsDialog}
          onClose={() => setOpenDetailsDialog(false)}
          team={selectedTeam}
          members={getTeamMembers(selectedTeam.id)}
          canManage={currentRole === 'admin'}  // Sadece admin yönetebilir
        />
      )}
    </Box>
  );
};

export default TeamDashboard;