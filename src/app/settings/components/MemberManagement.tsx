"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Avatar,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { 
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'citizen' | 'viewer';
  status: 'active' | 'suspended';
  joinedAt: string;
  lastActive: string;
}

const MemberManagement: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Mock data
  useEffect(() => {
    const mockMembers: TeamMember[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'admin',
        status: 'active',
        joinedAt: '2024-01-01T00:00:00Z',
        lastActive: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah@example.com',
        role: 'citizen',
        status: 'active',
        joinedAt: '2024-01-10T00:00:00Z',
        lastActive: '2024-01-14T16:45:00Z'
      }
    ];
    setMembers(mockMembers);
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, memberId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(memberId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#4caf50';
      case 'citizen': return '#ff9800';
      case 'viewer': return '#9e9e9e';
      default: return '#9e9e9e';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Team Members
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage existing team members and their permissions
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 500 }}>Member</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Last Active</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          mr: 2,
                          bgcolor: getRoleColor(member.role),
                          fontSize: '0.875rem'
                        }}
                      >
                        {getUserInitials(member.firstName, member.lastName)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {member.firstName} {member.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.role}
                      size="small"
                      sx={{
                        bgcolor: `${getRoleColor(member.role)}20`,
                        color: getRoleColor(member.role),
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.status}
                      size="small"
                      sx={{
                        bgcolor: member.status === 'active' ? '#4caf5020' : '#f4433620',
                        color: member.status === 'active' ? '#4caf50' : '#f44336',
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(member.joinedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(member.lastActive)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, member.id)}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit Role
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            View Profile
          </MenuItem>
          <MenuItem onClick={handleMenuClose} sx={{ color: '#f44336' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Remove Member
          </MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

export default MemberManagement; 