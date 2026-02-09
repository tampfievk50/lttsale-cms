import { useState, useEffect } from 'react'
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
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
} from '@mui/material'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconShieldCheck,
} from '@tabler/icons-react'
import { PageHeader, DataTable, type Column, ConfirmDialog } from '@/components'
import { useRolesManagementStore } from '@/store'
import type { Role, Policy, Permission } from '@/types'

const RolesPage = () => {
  const roles = useRolesManagementStore((s) => s.roles)
  const permissions = useRolesManagementStore((s) => s.permissions)
  const loading = useRolesManagementStore((s) => s.loading)
  const fetchRoles = useRolesManagementStore((s) => s.fetchRoles)
  const createRole = useRolesManagementStore((s) => s.createRole)
  const updateRole = useRolesManagementStore((s) => s.updateRole)
  const deleteRole = useRolesManagementStore((s) => s.deleteRole)
  const fetchPermissions = useRolesManagementStore((s) => s.fetchPermissions)
  const fetchRolePolicies = useRolesManagementStore((s) => s.fetchRolePolicies)
  const addPolicy = useRolesManagementStore((s) => s.addPolicy)
  const removePolicy = useRolesManagementStore((s) => s.removePolicy)

  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null)

  // Policy panel
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [rolePolicies, setRolePolicies] = useState<Policy[]>([])
  const [addPolicyOpen, setAddPolicyOpen] = useState(false)
  const [policyForm, setPolicyForm] = useState({ permission_id: 0, domain_id: '0', access: 'allow' })

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [fetchRoles, fetchPermissions])

  const handleOpenForm = (role?: Role) => {
    setEditingRole(role || null)
    setFormData({
      name: role?.name || '',
      description: role?.description || '',
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (editingRole) {
      await updateRole(editingRole.id, formData)
    } else {
      await createRole(formData)
    }
    setFormOpen(false)
    setEditingRole(null)
  }

  const handleDeleteClick = (id: number) => {
    setRoleToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (roleToDelete !== null) await deleteRole(roleToDelete)
    setDeleteDialogOpen(false)
    setRoleToDelete(null)
  }

  const handleSelectRole = async (role: Role) => {
    setSelectedRole(role)
    const policies = await fetchRolePolicies(role.id)
    setRolePolicies(policies)
  }

  const handleAddPolicy = async () => {
    if (!selectedRole || !policyForm.permission_id) return
    const perm = permissions.find((p) => p.id === policyForm.permission_id)
    if (!perm) return

    await addPolicy({
      roles: [selectedRole.id],
      domain_id: Number(policyForm.domain_id) || 0,
      path: perm.path,
      action: perm.action,
      access: policyForm.access,
    })

    // Refresh policies
    const policies = await fetchRolePolicies(selectedRole.id)
    setRolePolicies(policies)
    setAddPolicyOpen(false)
    setPolicyForm({ permission_id: 0, domain_id: '0', access: 'allow' })
  }

  const handleRemovePolicy = async (policy: Policy) => {
    await removePolicy({
      role_id: policy.role_id,
      domain_id: policy.domain_id,
      path: policy.path,
      action: policy.action,
    })

    if (selectedRole) {
      const policies = await fetchRolePolicies(selectedRole.id)
      setRolePolicies(policies)
    }
  }

  const columns: Column<Role & { id: string }>[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 150,
      format: (row) => (
        <Typography variant="body2" fontWeight={500}>{row.name}</Typography>
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 250,
      format: (row) => row.description || '-',
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      minWidth: 150,
      format: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          <Tooltip title="Manage Policies">
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation()
                handleSelectRole(row as unknown as Role)
              }}
            >
              <IconShieldCheck size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenForm(row as unknown as Role)
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
                handleDeleteClick((row as unknown as Role).id)
              }}
            >
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  const filteredRoles = roles.filter((r) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return r.name.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)
  })
  const mappedRoles = filteredRoles.map((r) => ({ ...r, id: String(r.id) }))

  return (
    <Box>
      <PageHeader
        title="Roles"
        subtitle="Manage roles and their permissions"
        breadcrumbs={[
          { label: 'Administration', path: '/settings/users' },
          { label: 'Roles' },
        ]}
        action={
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => handleOpenForm()}>
            Add Role
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: selectedRole ? 6 : 12 }}>
          <DataTable
            columns={columns}
            data={mappedRoles}
            loading={loading}
            searchPlaceholder="Search roles..."
            onSearch={setSearchQuery}
            emptyMessage="No roles found"
          />
        </Grid>

        {selectedRole && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Policies: {selectedRole.name}
                  </Typography>
                  <Button size="small" startIcon={<IconPlus size={16} />} onClick={() => setAddPolicyOpen(true)}>
                    Add
                  </Button>
                </Box>

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Path</TableCell>
                        <TableCell>Action</TableCell>
                        <TableCell>Effect</TableCell>
                        <TableCell align="center">Remove</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rolePolicies.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell>{p.path}</TableCell>
                          <TableCell>
                            <Chip label={p.action} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={p.effect || 'allow'}
                              color={p.effect === 'deny' ? 'error' : 'success'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => handleRemovePolicy(p)}>
                              <IconTrash size={16} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {rolePolicies.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                              No policies assigned
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Role Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.name}>
            {editingRole ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Policy Dialog */}
      <Dialog open={addPolicyOpen} onClose={() => setAddPolicyOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Policy to {selectedRole?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  select
                  label="Permission"
                  value={policyForm.permission_id}
                  onChange={(e) => setPolicyForm((prev) => ({ ...prev, permission_id: Number(e.target.value) }))}
                >
                  <MenuItem value={0}>Select a permission</MenuItem>
                  {permissions.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name} ({p.action} {p.path})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Domain ID"
                  value={policyForm.domain_id}
                  onChange={(e) => setPolicyForm((prev) => ({ ...prev, domain_id: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Effect"
                  value={policyForm.access}
                  onChange={(e) => setPolicyForm((prev) => ({ ...prev, access: e.target.value }))}
                >
                  <MenuItem value="allow">Allow</MenuItem>
                  <MenuItem value="deny">Deny</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddPolicyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPolicy} disabled={!policyForm.permission_id}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Role"
        message="Are you sure you want to delete this role? All associated policies will be affected."
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default RolesPage
