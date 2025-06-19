import React from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  useTheme,
  useMediaQuery,
  Button
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export interface TableHeaderProps {
  columns: Array<{
    label: string;
    width: string;
  }>;
  responsive?: boolean;
}

export interface KeyValueRowProps {
  keyName: string;
  value: string;
  isEditing: boolean;
  isLast?: boolean;
  keyWidth?: string;
  valueWidth?: string;
  onEdit: (key: string) => void;
  onSave: (key: string, value: string) => void;
  onDelete: (key: string) => void;
  onCopy: (text: string) => void;
  onStopEditing: () => void;
  showActions?: {
    copy?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
  responsive?: boolean;
}

export interface DataTableProps {
  columns: Array<{
    key: string;
    label: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
  }>;
  data: Array<Record<string, any>>;
  onRowClick?: (row: any, index: number) => void;
  renderCell?: (key: string, value: any, row: any, index: number) => React.ReactNode;
  minWidth?: number;
  showHeader?: boolean;
  responsive?: boolean;
}

export interface SimpleTableProps {
  columns: Array<{ key: string; label: string }>;
  data: Array<Record<string, React.ReactNode>>;
  responsive?: boolean;
}

export interface TeamMemberTableProps {
  members: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
  onManageClick?: () => void;
  responsive?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ 
  columns, 
  responsive = true 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box sx={{ 
      display: 'flex', 
      borderBottom: '1px solid #f0f0f0', 
      pb: shouldBeMobile ? 1 : 1.5, 
      mb: shouldBeMobile ? 1.5 : 2,
      flexDirection: shouldBeMobile ? 'column' : 'row',
      gap: shouldBeMobile ? 0.5 : 0
    }}>
      {columns.map((column, index) => (
        <Box 
          key={index} 
          sx={{ 
            width: shouldBeMobile ? '100%' : column.width,
            py: shouldBeMobile ? 0.5 : 0
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500, 
              color: '#555',
              fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
            }}
          >
            {column.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export const KeyValueRow: React.FC<KeyValueRowProps> = ({
  keyName,
  value,
  isEditing,
  isLast = false,
  keyWidth = '45%',
  valueWidth = '55%',
  onEdit,
  onSave,
  onDelete,
  onCopy,
  onStopEditing,
  showActions = { copy: true, edit: true, delete: true },
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        borderBottom: !isLast ? '1px solid #f5f5f5' : 'none',
        py: shouldBeMobile ? 1 : 1.5,
        alignItems: shouldBeMobile ? 'flex-start' : 'center',
        flexDirection: shouldBeMobile ? 'column' : 'row',
        gap: shouldBeMobile ? 1 : 0
      }}
    >
      <Box sx={{ 
        width: shouldBeMobile ? '100%' : keyWidth, 
        pr: shouldBeMobile ? 0 : 2 
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',  
          py: shouldBeMobile ? 0.75 : 1, 
          px: shouldBeMobile ? 1 : 1.5,
          border: '1px solid #e0e0e0',
          borderRadius: shouldBeMobile ? 0.75 : 1,
          bgcolor: '#f9f9f9'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: 'monospace', 
              fontWeight: 500,
              color: '#333',
              fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
            }}
          >
            {keyName}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ 
        width: shouldBeMobile ? '100%' : valueWidth, 
        display: 'flex', 
        alignItems: 'center' 
      }}>
        {isEditing ? (
          <TextField
            fullWidth
            variant="outlined"
            value={value}
            onChange={(e) => onSave(keyName, e.target.value)}
            size="small"
            sx={{ mr: shouldBeMobile ? 0 : 1, mb: shouldBeMobile ? 1 : 0 }}
            autoFocus
            onBlur={onStopEditing}
            InputProps={{
              sx: { 
                fontFamily: 'monospace', 
                fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
              }
            }}
          />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%',
            py: shouldBeMobile ? 0.75 : 1, 
            px: shouldBeMobile ? 1 : 1.5,
            border: '1px solid #e0e0e0',
            borderRadius: shouldBeMobile ? 0.75 : 1,
            mr: shouldBeMobile ? 0 : 1,
            bgcolor: 'white'
          }}>
            <Typography 
              variant="body2" 
              sx={{ 
                flex: 1,
                fontFamily: 'monospace', 
                overflowX: 'auto',
                whiteSpace: shouldBeMobile ? 'normal' : 'nowrap',
                wordBreak: shouldBeMobile ? 'break-all' : 'normal',
                fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
              }}
            >
              {value}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ 
          display: 'flex',
          flexDirection: shouldBeMobile ? 'row' : 'row',
          gap: shouldBeMobile ? 0.5 : 0,
          mt: shouldBeMobile && isEditing ? 1 : 0
        }}>
          {!isEditing && (
            <>
              {showActions.copy && (
                <Tooltip title="Copy value">
                  <IconButton 
                    size="small" 
                    onClick={() => onCopy(value)}
                    sx={{ 
                      color: '#555',
                      p: shouldBeMobile ? 0.5 : 1
                    }}
                  >
                    <ContentCopyIcon fontSize={shouldBeMobile ? "small" : "small"} />
                  </IconButton>
                </Tooltip>
              )}
              {showActions.edit && (
                <Tooltip title="Edit value">
                  <IconButton 
                    size="small" 
                    onClick={() => onEdit(keyName)}
                    sx={{ 
                      color: '#555',
                      p: shouldBeMobile ? 0.5 : 1
                    }}
                  >
                    <EditIcon fontSize={shouldBeMobile ? "small" : "small"} />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}
          {showActions.delete && (
            <Tooltip title="Delete variable">
              <IconButton 
                size="small" 
                onClick={() => onDelete(keyName)}
                sx={{ 
                  color: '#f44336',
                  p: shouldBeMobile ? 0.5 : 1
                }}
              >
                <CloseIcon fontSize={shouldBeMobile ? "small" : "small"} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onRowClick,
  renderCell,
  minWidth = 650,
  showHeader = true,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  return (
    <TableContainer 
      sx={{ 
        overflowX: shouldBeMobile ? 'auto' : 'visible',
        borderRadius: shouldBeMobile ? 1 : 1.5,
        border: shouldBeMobile ? '1px solid #e0e0e0' : 'none'
      }}
    >
      <Table sx={{ 
        minWidth: shouldBeMobile ? 'auto' : minWidth,
        '& .MuiTableCell-root': {
          fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
          py: shouldBeMobile ? 1 : 1.5,
          px: shouldBeMobile ? 1 : 2
        }
      }}>
        {showHeader && (
          <TableHead sx={{ bgcolor: shouldBeMobile ? '#f8f9fa' : '#f5f5f5' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  sx={{ 
                    fontWeight: 600,
                    width: column.width,
                    textAlign: column.align || 'left',
                    fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
                    py: shouldBeMobile ? 0.75 : 1,
                    px: shouldBeMobile ? 1 : 2,
                    whiteSpace: shouldBeMobile ? 'nowrap' : 'normal'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        )}
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index}
              sx={{ 
                '&:hover': { bgcolor: shouldBeMobile ? '#f8f9fa' : '#f9f9f9' },
                cursor: onRowClick ? 'pointer' : 'default',
                borderBottom: '1px solid #f0f0f0'
              }}
              onClick={() => onRowClick?.(row, index)}
            >
              {columns.map((column) => (
                <TableCell 
                  key={column.key}
                  sx={{ 
                    textAlign: column.align || 'left',
                    fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
                    py: shouldBeMobile ? 1 : 1.5,
                    px: shouldBeMobile ? 1 : 2,
                    whiteSpace: shouldBeMobile ? 'nowrap' : 'normal',
                    overflow: shouldBeMobile ? 'hidden' : 'visible',
                    textOverflow: shouldBeMobile ? 'ellipsis' : 'clip',
                    maxWidth: shouldBeMobile ? '150px' : 'none'
                  }}
                >
                  {renderCell 
                    ? renderCell(column.key, row[column.key], row, index)
                    : row[column.key]
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const SimpleTable: React.FC<SimpleTableProps> = ({
  columns,
  data,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
            {columns.map((column) => (
              <th 
                key={column.key}
                style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px', 
                  fontWeight: 500 
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
              {columns.map((column) => (
                <td 
                  key={column.key}
                  style={{ padding: '12px 16px' }}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
};

export const TeamMemberTable: React.FC<TeamMemberTableProps> = ({
  members,
  onManageClick,
  responsive = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const shouldBeMobile = responsive && isMobile;

  const getRoleBadgeStyles = (role: string) => {
    switch (role) {
      case 'Owner':
        return { bgcolor: 'rgba(0,74,173,0.1)', color: '#004aad' };
      case 'Admin':
        return { bgcolor: 'rgba(76,175,80,0.1)', color: '#4caf50' };
      default:
        return { bgcolor: 'rgba(255,152,0,0.1)', color: '#ff9800' };
    }
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: shouldBeMobile ? 1.5 : 2,
        flexDirection: shouldBeMobile ? 'column' : 'row',
        gap: shouldBeMobile ? 1 : 0
      }}>
        <Typography 
          variant="body1" 
          fontWeight={500}
          sx={{ fontSize: shouldBeMobile ? '0.875rem' : '1rem' }}
        >
          Team Members
        </Typography>
        {onManageClick && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={onManageClick}
            fullWidth={shouldBeMobile}
            sx={{
              borderColor: '#004aad',
              color: '#004aad',
              '&:hover': { borderColor: '#003a87', bgcolor: 'rgba(0,74,173,0.04)' },
              fontSize: shouldBeMobile ? '0.75rem' : '0.875rem'
            }}
          >
            Manage Members
          </Button>
        )}
      </Box>
      
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <th style={{ 
                textAlign: 'left', 
                padding: shouldBeMobile ? '6px 12px' : '8px 16px', 
                fontWeight: 500, 
                fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' 
              }}>
                Name
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: shouldBeMobile ? '6px 12px' : '8px 16px', 
                fontWeight: 500, 
                fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' 
              }}>
                Email
              </th>
              <th style={{ 
                textAlign: 'left', 
                padding: shouldBeMobile ? '6px 12px' : '8px 16px', 
                fontWeight: 500, 
                fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' 
              }}>
                Role
              </th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ 
                  padding: shouldBeMobile ? '6px 12px' : '8px 16px', 
                  fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' 
                }}>
                  {member.name}
                </td>
                <td style={{ 
                  padding: shouldBeMobile ? '6px 12px' : '8px 16px', 
                  fontSize: shouldBeMobile ? '0.75rem' : '0.875rem',
                  wordBreak: 'break-all'
                }}>
                  {member.email}
                </td>
                <td style={{ 
                  padding: shouldBeMobile ? '6px 12px' : '8px 16px', 
                  fontSize: shouldBeMobile ? '0.75rem' : '0.875rem' 
                }}>
                  <Box sx={{ 
                    display: 'inline-block', 
                    px: shouldBeMobile ? 1 : 1.5, 
                    py: 0.25, 
                    borderRadius: 1,
                    fontSize: shouldBeMobile ? '0.625rem' : '0.75rem',
                    fontWeight: 500,
                    ...getRoleBadgeStyles(member.role)
                  }}>
                    {member.role}
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}; 