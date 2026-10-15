'use client';

import {
  useMemo,
  useState,
} from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import AppShell from '@/components/AppShell';

type UserRole =
  | 'Admin'
  | 'Manager'
  | 'Employee'
  | 'Viewer';

type UserStatus =
  | 'Active'
  | 'Inactive';

type AppUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
};

const roles: UserRole[] = [
  'Admin',
  'Manager',
  'Employee',
  'Viewer',
];

const initialUsers: AppUser[] = [
  {
    id: 1,
    name: 'Jorge',
    email: 'jorge@example.com',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Today',
  },
];

export default function UsersPage() {
  const [users, setUsers] =
    useState<AppUser[]>(
      initialUsers
    );

  const [open, setOpen] =
    useState(false);

  const [
    editingUser,
    setEditingUser,
  ] = useState<AppUser | null>(
    null
  );

  const [
    deleteDialogOpen,
    setDeleteDialogOpen,
  ] = useState(false);

  const [
    userToDelete,
    setUserToDelete,
  ] = useState<AppUser | null>(
    null
  );

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [
    emailError,
    setEmailError,
  ] = useState('');

  const [role, setRole] =
    useState<UserRole>(
      'Employee'
    );

  const [active, setActive] =
    useState(true);

  const activeUserCount =
    useMemo(() => {
      return users.filter(
        (user) =>
          user.status ===
          'Active'
      ).length;
    }, [users]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setEmailError('');
    setRole('Employee');
    setActive(true);
    setEditingUser(null);
  };

  const handleAdd = () => {
    resetForm();
    setOpen(true);
  };

  const handleEdit = (
    user: AppUser
  ) => {
    setEditingUser(user);

    setName(user.name);
    setEmail(user.email);
    setEmailError('');
    setRole(user.role);

    setActive(
      user.status ===
        'Active'
    );

    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const emailExists = (
    emailToCheck: string
  ) => {
    const normalizedEmail =
      emailToCheck
        .trim()
        .toLowerCase();

    return users.some(
      (user) =>
        user.email
          .trim()
          .toLowerCase() ===
          normalizedEmail &&
        user.id !==
          editingUser?.id
    );
  };

  const handleSave = () => {
    const cleanName =
      name.trim();

    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    setEmailError('');

    if (
      !cleanName ||
      !cleanEmail
    ) {
      return;
    }

    if (
      emailExists(cleanEmail)
    ) {
      setEmailError(
        'This email address is already associated with another user.'
      );

      return;
    }

    if (editingUser) {
      setUsers(
        (currentUsers) =>
          currentUsers.map(
            (user) =>
              user.id ===
              editingUser.id
                ? {
                    ...user,

                    name:
                      cleanName,

                    email:
                      cleanEmail,

                    role,

                    status:
                      active
                        ? 'Active'
                        : 'Inactive',
                  }
                : user
          )
      );
    } else {
      const newUser: AppUser =
        {
          id: Date.now(),

          name:
            cleanName,

          email:
            cleanEmail,

          role,

          status:
            active
              ? 'Active'
              : 'Inactive',

          lastActive:
            'Never',
        };

      setUsers(
        (
          currentUsers
        ) => [
          newUser,
          ...currentUsers,
        ]
      );
    }

    setOpen(false);
    resetForm();
  };

  const handleDeleteRequest =
    (
      user: AppUser
    ) => {
      setUserToDelete(
        user
      );

      setDeleteDialogOpen(
        true
      );
    };

  const handleDeleteCancel =
    () => {
      setDeleteDialogOpen(
        false
      );

      setUserToDelete(
        null
      );
    };

  const handleDeleteConfirm =
    () => {
      if (!userToDelete) {
        return;
      }

      setUsers(
        (
          currentUsers
        ) =>
          currentUsers.filter(
            (user) =>
              user.id !==
              userToDelete.id
          )
      );

      setDeleteDialogOpen(
        false
      );

      setUserToDelete(
        null
      );
    };

  const getRoleDescription =
    (
      selectedRole: UserRole
    ) => {
      switch (
        selectedRole
      ) {
        case 'Admin':
          return 'Full access to all business data, settings, and users.';

        case 'Manager':
          return 'Can manage sales, expenses, products, and reports.';

        case 'Employee':
          return 'Can add sales and expenses with limited management access.';

        case 'Viewer':
          return 'Read-only access to business information.';

        default:
          return '';
      }
    };

  return (
    <AppShell>
      <Stack spacing={4}>
        {/* HEADER */}
        <Stack
          spacing={2}
          sx={{
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },

            justifyContent:
              'space-between',

            alignItems: {
              xs: 'stretch',
              sm: 'center',
            },
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                color:
                  'primary.main',

                fontWeight:
                  700,
              }}
            >
              Users
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mt: 0.5,

                color:
                  'text.secondary',
              }}
            >
              Manage who can
              access the Milo +
              Marley Business
              Manager.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={
              <AddIcon />
            }
            onClick={
              handleAdd
            }
          >
            Add User
          </Button>
        </Stack>

        {/* SUMMARY */}
        <Box
          sx={{
            display: 'grid',

            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },

            gap: 2,
          }}
        >
          <Card>
            <CardContent>
              <Typography
                variant="body2"
                sx={{
                  color:
                    'text.secondary',
                }}
              >
                Total Users
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,

                  color:
                    'primary.main',

                  fontWeight:
                    700,
                }}
              >
                {users.length}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography
                variant="body2"
                sx={{
                  color:
                    'text.secondary',
                }}
              >
                Active Users
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,

                  color:
                    'primary.main',

                  fontWeight:
                    700,
                }}
              >
                {
                  activeUserCount
                }
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* USERS TABLE */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 2,

                fontWeight:
                  600,
              }}
            >
              Team members
            </Typography>

            {users.length ===
            0 ? (
              <Box
                sx={{
                  py: 6,

                  textAlign:
                    'center',
                }}
              >
                <Typography
                  sx={{
                    color:
                      'text.secondary',
                  }}
                >
                  No users have
                  been added yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Name
                      </TableCell>

                      <TableCell>
                        Email
                      </TableCell>

                      <TableCell>
                        Role
                      </TableCell>

                      <TableCell>
                        Status
                      </TableCell>

                      <TableCell>
                        Last Active
                      </TableCell>

                      <TableCell
                        align="right"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {users.map(
                      (user) => (
                        <TableRow
                          key={
                            user.id
                          }
                        >
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  600,
                              }}
                            >
                              {
                                user.name
                              }
                            </Typography>
                          </TableCell>

                          <TableCell>
                            {
                              user.email
                            }
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={
                                user.role
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={
                                user.status
                              }
                              size="small"
                              color={
                                user.status ===
                                'Active'
                                  ? 'success'
                                  : 'default'
                              }
                              variant={
                                user.status ===
                                'Active'
                                  ? 'filled'
                                  : 'outlined'
                              }
                            />
                          </TableCell>

                          <TableCell>
                            {
                              user.lastActive
                            }
                          </TableCell>

                          <TableCell
                            align="right"
                          >
                            <IconButton
                              aria-label={`Edit ${user.name}`}
                              onClick={() =>
                                handleEdit(
                                  user
                                )
                              }
                            >
                              <EditIcon />
                            </IconButton>

                            <IconButton
                              aria-label={`Delete ${user.name}`}
                              color="error"
                              onClick={() =>
                                handleDeleteRequest(
                                  user
                                )
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* ADD / EDIT USER */}
      <Dialog
        open={open}
        onClose={
          handleClose
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingUser
            ? 'Edit User'
            : 'Add User'}
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={3}
            sx={{
              mt: 1,
            }}
          >
            <TextField
              label="Name"
              value={name}
              onChange={(
                event
              ) =>
                setName(
                  event.target
                    .value
                )
              }
              fullWidth
              required
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(
                event
              ) => {
                setEmail(
                  event.target
                    .value
                );

                if (
                  emailError
                ) {
                  setEmailError(
                    ''
                  );
                }
              }}
              fullWidth
              required
              error={
                Boolean(
                  emailError
                )
              }
              helperText={
                emailError
              }
            />

            <TextField
              select
              label="Role"
              value={role}
              onChange={(
                event
              ) =>
                setRole(
                  event.target
                    .value as UserRole
                )
              }
              fullWidth
              required
            >
              {roles.map(
                (
                  userRole
                ) => (
                  <MenuItem
                    key={
                      userRole
                    }
                    value={
                      userRole
                    }
                  >
                    {
                      userRole
                    }
                  </MenuItem>
                )
              )}
            </TextField>

            {/* ROLE DESCRIPTION */}
            <Box
              sx={{
                p: 2,

                border:
                  '1px solid',

                borderColor:
                  'divider',

                borderRadius:
                  2,

                backgroundColor:
                  'background.default',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight:
                    600,

                  color:
                    'primary.main',
                }}
              >
                {role}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,

                  color:
                    'text.secondary',
                }}
              >
                {
                  getRoleDescription(
                    role
                  )
                }
              </Typography>
            </Box>

            {/* ACTIVE / INACTIVE */}
            <Box
              sx={{
                p: 2,

                border:
                  '1px solid',

                borderColor:
                  'divider',

                borderRadius:
                  2,
              }}
            >
              <Stack
                sx={{
                  flexDirection:
                    'row',

                  alignItems:
                    'center',

                  justifyContent:
                    'space-between',

                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight:
                        500,
                    }}
                  >
                    Active user
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        'text.secondary',
                    }}
                  >
                    Inactive users
                    will not be
                    allowed to access
                    the Business
                    Manager.
                  </Typography>
                </Box>

                <Switch
                  checked={
                    active
                  }
                  onChange={(
                    event
                  ) =>
                    setActive(
                      event.target
                        .checked
                    )
                  }
                />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={
              handleClose
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSave
            }
            disabled={
              !name.trim() ||
              !email.trim()
            }
          >
            {editingUser
              ? 'Save Changes'
              : 'Add User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <Dialog
        open={
          deleteDialogOpen
        }
        onClose={
          handleDeleteCancel
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Delete User?
        </DialogTitle>

        <DialogContent>
          <Typography>
            You are about to
            delete{' '}
            <strong>
              {
                userToDelete?.name
              }
            </strong>
            .
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 1.5,

              color:
                'text.secondary',
            }}
          >
            This user will be
            removed from Milo +
            Marley Business Manager.
            This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={
              handleDeleteCancel
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={
              handleDeleteConfirm
            }
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}