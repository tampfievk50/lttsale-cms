import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Checkbox,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconShield,
  IconUserCheck,
  IconUserOff,
} from '@tabler/icons-react'
import { PageHeader, DataTable, type Column, ConfirmDialog } from '@/components'
import { useUsersManagementStore } from '@/store'
import type { SsoUser, Role } from '@/types'

const getInitialFormData = (user: SsoUser | null) => ({
  username: user?.username || '',
  email: user?.email || '',
  password: '',
  first_name: user?.first_name || '',
  last_name: user?.last_name || '',
  gender: user?.gender ?? 0,
  is_active: user?.is_active ?? true,
  is_supper: user?.is_supper ?? false,
})

const UsersPage = () => {
  const users = useUsersManagementStore((s) => s.users)
  const roles = useUsersManagementStore((s) => s.roles)
  const loading = useUsersManagementStore((s) => s.loading)
  const fetchUsers = useUsersManagementStore((s) => s.fetchUsers)
  const fetchRoles = useUsersManagementStore((s) => s.fetchRoles)
  const createUser = useUsersManagementStore((s) => s.createUser)
  const updateUser = useUsersManagementStore((s) => s.updateUser)
  const deleteUser = useUsersManagementStore((s) => s.deleteUser)
  const getUserRoles = useUsersManagementStore((s) => s.getUserRoles)
  const assignRoles = useUsersManagementStore((s) => s.assignRoles)
  const removeRole = useUsersManagementStore((s) => s.removeRole)

  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SsoUser | null>(null)
  const [formData, setFormData] = useState(getInitialFormData(null))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<number | null>(null)

  // Role assignment dialog
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false)
  const [rolesDialogUser, setRolesDialogUser] = useState<SsoUser | null>(null)
  const [userRoleIds, setUserRoleIds] = useState<number[]>([])

  // Track assigned roles per user for display
  const [userRolesMap, setUserRolesMap] = useState<Record<number, Role[]>>({})

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [fetchUsers, fetchRoles])

  // Fetch roles for all users whenever user list changes
  useEffect(() => {
    if (users.length === 0) return
    const loadAllUserRoles = async () => {
      const entries = await Promise.all(
        users.map(async (u) => {
          const r = await getUserRoles(u.id)
          return [u.id, r] as const
        }),
      )
      setUserRolesMap(Object.fromEntries(entries))
    }
    loadAllUserRoles()
  }, [users, getUserRoles])

  const handleOpenForm = (user?: SsoUser) => {
    setEditingUser(user || null)
    setFormData(getInitialFormData(user || null))
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingUser(null)
  }

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (editingUser) {
      await updateUser(editingUser.id, {
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        gender: formData.gender || undefined,
        is_active: formData.is_active,
      })
    } else {
      await createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        gender: formData.gender || undefined,
        is_active: formData.is_active,
        is_supper: formData.is_supper,
      })
    }
    handleCloseForm()
  }

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete !== null) await deleteUser(userToDelete)
    setDeleteDialogOpen(false)
    setUserToDelete(null)
  }

  const handleOpenRoles = useCallback(async (user: SsoUser) => {
    setRolesDialogUser(user)
    const currentRoles = await getUserRoles(user.id)
    setUserRoleIds(currentRoles.map((r) => r.id))
    setRolesDialogOpen(true)
  }, [getUserRoles])

  const handleToggleRole = (roleId: number) => {
    setUserRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
  }

  const handleSaveRoles = async () => {
    if (!rolesDialogUser) return
    const currentRoles = await getUserRoles(rolesDialogUser.id)
    const currentIds = currentRoles.map((r) => r.id)

    // Roles to add
    const toAdd = userRoleIds.filter((id) => !currentIds.includes(id))
    // Roles to remove
    const toRemove = currentIds.filter((id) => !userRoleIds.includes(id))

    if (toAdd.length > 0) {
      await assignRoles(rolesDialogUser.id, toAdd, 0)
    }
    for (const roleId of toRemove) {
      await removeRole(rolesDialogUser.id, roleId, 0)
    }

    // Refresh this user's roles in the map
    const updatedRoles = await getUserRoles(rolesDialogUser.id)
    setUserRolesMap((prev) => ({ ...prev, [rolesDialogUser.id]: updatedRoles }))

    setRolesDialogOpen(false)
    setRolesDialogUser(null)
  }

  const handleToggleActive = async (user: SsoUser) => {
    await updateUser(user.id, { is_active: !user.is_active })
  }

  const isValid = editingUser
    ? true
    : formData.username && formData.email && formData.password

  const columns: Column<SsoUser & { id: string }>[] = [
    {
      id: 'username',
      label: 'Username',
      minWidth: 150,
      format: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>{row.username}</Typography>
          <Typography variant="caption" color="text.secondary">{row.email}</Typography>
        </Box>
      ),
    },
    {
      id: 'name',
      label: 'Name',
      minWidth: 150,
      format: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || '-',
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      minWidth: 100,
      format: (row) => (
        <Chip
          label={row.is_active ? 'Active' : 'Inactive'}
          color={row.is_active ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      id: 'role',
      label: 'Roles',
      align: 'center',
      minWidth: 150,
      format: (row) => {
        const user = row as unknown as SsoUser
        const assignedRoles = userRolesMap[user.id] || []
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
            {user.is_supper && <Chip label="Super Admin" color="error" size="small" />}
            {assignedRoles.map((r) => (
              <Chip key={r.id} label={r.name} color="primary" size="small" variant="outlined" />
            ))}
            {!user.is_supper && assignedRoles.length === 0 && (
              <Chip label="No roles" color="default" size="small" variant="outlined" sx={{ opacity: 0.5 }} />
            )}
          </Box>
        )
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      minWidth: 150,
      format: (row) => {
        const user = row as unknown as SsoUser
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
            <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
              <IconButton
                size="small"
                color={user.is_active ? 'warning' : 'success'}
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleActive(user)
                }}
              >
                {user.is_active ? <IconUserOff size={18} /> : <IconUserCheck size={18} />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Manage Roles">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenRoles(user)
                }}
              >
                <IconShield size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenForm(user)
                }}
              >
                <IconEdit size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClick(user.id)
                }}
              >
                <IconTrash size={18} />
              </IconButton>
            </Tooltip>
          </Box>
        )
      },
    },
  ]

  // Map SsoUser to have string id for DataTable
  const mappedUsers = users.map((u) => ({ ...u, id: String(u.id) }))

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Manage SSO user accounts"
        breadcrumbs={[
          { label: 'Administration', path: '/settings/users' },
          { label: 'Users' },
        ]}
        action={
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => handleOpenForm()}>
            Add User
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={mappedUsers}
        loading={loading}
        searchPlaceholder="Search users..."
        onSearch={(s) => fetchUsers(s)}
        emptyMessage="No users found"
      />

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              {!editingUser && (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required label="Username" value={formData.username} onChange={handleChange('username')} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required label="Email" type="email" value={formData.email} onChange={handleChange('email')} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField fullWidth required label="Password" type="password" value={formData.password} onChange={handleChange('password')} />
                  </Grid>
                </>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="First Name" value={formData.first_name} onChange={handleChange('first_name')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth label="Last Name" value={formData.last_name} onChange={handleChange('last_name')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField fullWidth select label="Gender" value={formData.gender} onChange={handleChange('gender')}>
                  <MenuItem value={0}>Not specified</MenuItem>
                  <MenuItem value={1}>Male</MenuItem>
                  <MenuItem value={2}>Female</MenuItem>
                  <MenuItem value={3}>Other</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControlLabel
                  control={<Switch checked={formData.is_active} onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))} />}
                  label="Active"
                />
              </Grid>
              {!editingUser && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={<Switch checked={formData.is_supper} onChange={(e) => setFormData((prev) => ({ ...prev, is_supper: e.target.checked }))} />}
                    label="Super Admin"
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!isValid}>
            {editingUser ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Role Assignment Dialog */}
      <Dialog open={rolesDialogOpen} onClose={() => setRolesDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Manage Roles - {rolesDialogUser?.username}</DialogTitle>
        <DialogContent>
          <List dense>
            {roles.map((role) => (
              <ListItem key={role.id} disablePadding>
                <Checkbox
                  checked={userRoleIds.includes(role.id)}
                  onChange={() => handleToggleRole(role.id)}
                />
                <ListItemText primary={role.name} secondary={role.description} />
              </ListItem>
            ))}
            {roles.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No roles available. Create roles first.
              </Typography>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRolesDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveRoles}>Save</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default UsersPage
