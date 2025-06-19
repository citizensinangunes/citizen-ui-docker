import React, { useState } from 'react';
import { useTheme, useMediaQuery } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

// Import UI components
import { 
  Box,
  Typography,
  Card,
  CollapsibleSection,
  SimpleTable,
  TeamBadge,
  CustomStatusBadge,
  ActionButton,
  FormModal,
  FormField
} from '@/components/ui';

// Import mobile components
import { PendingInviteCard, ExternalMemberCard } from '@/components/mobile';

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

interface ExternalCollaboratorsProps {
  pendingInvites: PendingInvite[];
  isAdmin: boolean;
  onAddInvite: (invite: Omit<PendingInvite, 'id' | 'name' | 'status'>) => void;
  onApproveInvite: (id: number) => void;
  onDeclineInvite: (id: number) => void;
}

const ExternalCollaborators: React.FC<ExternalCollaboratorsProps> = ({ 
  pendingInvites, 
  isAdmin, 
  onAddInvite, 
  onApproveInvite, 
  onDeclineInvite 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [showNewInviteForm, setShowNewInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('External');
  const [inviteType, setInviteType] = useState('invitation'); // 'invitation' or 'request'

  // Sample external members data
  const externalMembers: ExternalMember[] = [
    { id: 201, name: 'Lisa Johnson', email: 'lisa@externalcompany.com', role: 'Viewer', status: 'Active', lastActive: '2 days ago' },
    { id: 202, name: 'Mark Wilson', email: 'mark@partner.org', role: 'Viewer', status: 'Active', lastActive: 'Yesterday' },
    { id: 203, name: 'Emma Davis', email: 'emma@client.net', role: 'Viewer', status: 'Active', lastActive: '4 hours ago' },
    { id: 204, name: 'Robert Chen', email: 'robert@consultant.io', role: 'Viewer', status: 'Active', lastActive: 'Just now' },
    { id: 205, name: 'Sophie Miller', email: 'sophie@vendor.com', role: 'Viewer', status: 'Active', lastActive: '1 week ago' },
  ];

  // Sample invited/requested members with different statuses
  const combinedPendingInvites = [
    ...pendingInvites,
    { id: 301, name: 'David Lee', email: 'david@agency.com', role: 'Citizen', team: 'External', status: 'Request' }
  ];

  const handleSendInvite = () => {
    if (!inviteEmail) return;
    
    onAddInvite({
      email: inviteEmail,
      role: 'Citizen',
      team: selectedTeam,
    });
    
    setShowNewInviteForm(false);
    setInviteEmail('');
    setPersonalMessage('');
    setSelectedTeam('External');
  };

  const handleCloseModal = () => {
    setShowNewInviteForm(false);
    setInviteEmail('');
    setPersonalMessage('');
    setSelectedTeam('External');
  };

  const teamOptions = [
    { value: 'External', label: 'External Collaborator' },
    { value: 'Core Team', label: 'Core Team' },
    { value: 'Product Team', label: 'Product Team' },
    { value: 'Design Team', label: 'Design Team' }
  ];

  const shouldShowSection = isAdmin || combinedPendingInvites.some(invite => invite.team === 'Core Team');

  if (!shouldShowSection) return null;

  // Render mobile cards or desktop table for pending invites
  const renderPendingInvites = () => {
    if (isMobile) {
      return combinedPendingInvites.map(invite => (
        <PendingInviteCard
          key={invite.id}
          invite={invite}
          isAdmin={isAdmin}
          onApprove={onApproveInvite}
          onDecline={onDeclineInvite}
        />
      ));
    } else {
      return (
        <SimpleTable
          columns={pendingInvitesColumns}
          data={pendingInvitesData}
          responsive
        />
      );
    }
  };

  // Render mobile cards or desktop table for active members
  const renderActiveMembers = () => {
    if (isMobile) {
      return externalMembers.map(member => (
        <ExternalMemberCard
          key={member.id}
          member={member}
          isAdmin={isAdmin}
        />
      ));
    } else {
      return (
        <SimpleTable
          columns={activeMembersColumns}
          data={activeMembersData}
          responsive
        />
      );
    }
  };

  // Prepare data for pending invites table
  const pendingInvitesData = combinedPendingInvites.map(invite => ({
    email: invite.email,
    team: <TeamBadge team={invite.team} responsive />,
    invitedBy: 'John Doe',
    status: <CustomStatusBadge status={invite.status} responsive />,
    actions: isAdmin ? (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <ActionButton 
          variant="approve"
          onClick={() => onApproveInvite(invite.id)}
          responsive
        >
          Approve
        </ActionButton>
        <ActionButton 
          variant="reject"
          onClick={() => onDeclineInvite(invite.id)}
          responsive
        >
          {invite.status === 'Request' ? 'Reject' : 'Decline'}
        </ActionButton>
      </Box>
    ) : (
      <Typography variant="caption" color="text.secondary">
        Waiting for admin approval
      </Typography>
    )
  }));

  // Prepare data for active members table
  const activeMembersData = externalMembers.map(member => ({
    name: member.name,
    email: member.email,
    role: (
      <Box sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
        borderRadius: 1,
        color: '#9e9e9e',
        fontWeight: 500,
        fontSize: '0.875rem'
      }}>
        {member.role}
      </Box>
    ),
    lastActive: member.lastActive,
    ...(isAdmin && {
      actions: (
        <ActionButton variant="remove" responsive>
          Remove
        </ActionButton>
      )
    })
  }));

  const pendingInvitesColumns = [
    { key: 'email', label: 'Email' },
    { key: 'team', label: 'Team' },
    { key: 'invitedBy', label: 'Invited by' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ];

  const activeMembersColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'lastActive', label: 'Last Active' },
    ...(isAdmin ? [{ key: 'actions', label: 'Actions' }] : [])
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Card
        variant="outlined"
        responsive
        header={
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            p: { xs: 2, sm: 3 }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PeopleAltIcon 
                sx={{ 
                  color: '#9e9e9e',
                  mr: 2,
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }} 
              />
              <Box>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  External Collaborators
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  5 members • Viewer access
                </Typography>
              </Box>
            </Box>
            <button
              onClick={() => setShowNewInviteForm(true)}
              style={{
                padding: isMobile ? '8px 16px' : '8px 16px',
                backgroundColor: '#004aad',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: isMobile ? '0.875rem' : '1rem',
                width: isMobile ? '100%' : 'auto'
              }}
            >
              + Add Collaborator
            </button>
          </Box>
        }
      >
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Pending invitations and requests section */}
          {combinedPendingInvites.length > 0 && (
            <CollapsibleSection
              title="Pending Invitations & Requests"
              defaultExpanded={true}
              responsive
            >
              <Box sx={{ p: isMobile ? 1 : 0 }}>
                {renderPendingInvites()}
              </Box>
            </CollapsibleSection>
          )}
          
          {/* Active external collaborators section */}
          <CollapsibleSection
            title="Active External Collaborators"
            defaultExpanded={true}
            responsive
          >
            {externalMembers.length > 0 ? (
              <Box sx={{ p: isMobile ? 1 : 0 }}>
                {renderActiveMembers()}
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                No active external collaborators
              </Typography>
            )}
          </CollapsibleSection>
        </Box>
      </Card>

      {/* New invitation form modal */}
      <FormModal
        open={showNewInviteForm}
        title="Invite external collaborator"
        onClose={handleCloseModal}
        onSubmit={handleSendInvite}
        submitText={inviteType === 'invitation' ? 'Send invitation' : 'Submit request'}
        submitDisabled={!inviteEmail}
        responsive
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormField
            label="Email address"
            type="text"
            value={inviteEmail}
            onChange={setInviteEmail}
            textFieldProps={{
              placeholder: 'email@example.com',
              type: 'email'
            }}
            responsive
          />
          
          <FormField
            label="Team"
            type="select"
            options={teamOptions}
            value={selectedTeam}
            onChange={setSelectedTeam}
            responsive
          />

          <FormField
            label="Type"
            type="radio"
            options={[
              { value: 'invitation', label: 'Invitation' },
              { value: 'request', label: 'Request' }
            ]}
            value={inviteType}
            onChange={setInviteType}
            responsive
          />
          
          <FormField
            label="Personal message (optional)"
            type="text"
            value={personalMessage}
            onChange={setPersonalMessage}
            textFieldProps={{
              placeholder: 'Add a personal message to the invitation email...',
              multiline: true,
              rows: 3
            }}
            responsive
          />
        </Box>
      </FormModal>
    </Box>
  );
};

export default ExternalCollaborators; 