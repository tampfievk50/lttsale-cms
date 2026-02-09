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
  MenuItem,
} from '@mui/material'
import {
  IconPlus,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'
import { PageHeader, DataTable, type Column, ConfirmDialog } from '@/components'
import { useRolesManagementStore } from '@/store'
import type { Permission } from '@/types'

const actionColors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'default'> = {
  GET: 'info',
  POST: 'success',
  PUT: 'warning',
  PATCH: 'secondary',
  DELETE: 'error',
  '*': 'primary',
}

const PermissionsPage = () => {
  const permissions = useRolesManagementStore((s) => s.permissions)
  const loading = useRolesManagementStore((s) => s.loading)
  const fetchPermissions = useRolesManagementStore((s) => s.fetchPermissions)
  const createPermission = useRolesManagementStore((s) => s.createPermission)
  const updatePermission = useRolesManagementStore((s) => s.updatePermission)
  const deletePermission = useRolesManagementStore((s) => s.deletePermission)

  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '', path: '', action: 'GET' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [permToDelete, setPermToDelete] = useState<number | null>(null)

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const handleOpenForm = (perm?: Permission) => {
    setEditingPerm(perm || null)
    setFormData({
      name: perm?.name || '',
      description: perm?.description || '',
      path: perm?.path || '',
      action: perm?.action || 'GET',
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (editingPerm) {
      await updatePermission(editingPerm.id, formData)
    } else {
      await createPermission(formData)
    }
    setFormOpen(false)
    setEditingPerm(null)
  }

  const handleDeleteClick = (id: number) => {
    setPermToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (permToDelete !== null) await deletePermission(permToDelete)
    setDeleteDialogOpen(false)
    setPermToDelete(null)
  }

  const columns: Column<Permission & { id: string }>[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 180,
      format: (row) => (
        <Typography variant="body2" fontWeight={500}>{row.name}</Typography>
      ),
    },
    {
      id: 'path',
      label: 'Path',
      minWidth: 200,
      format: (row) => (
        <Typography variant="body2" fontFamily="monospace" fontSize={13}>
          {row.path}
        </Typography>
      ),
    },
    {
      id: 'action',
      label: 'Method',
      align: 'center',
      minWidth: 100,
      format: (row) => (
        <Chip
          label={row.action}
          color={actionColors[row.action] || 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200,
      format: (row) => row.description || '-',
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      minWidth: 100,
      format: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenForm(row as unknown as Permission)
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
                handleDeleteClick((row as unknown as Permission).id)
              }}
            >
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  const filteredPermissions = permissions.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return p.name.toLowerCase().includes(q) || p.path.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
  })
  const mappedPermissions = filteredPermissions.map((p) => ({ ...p, id: String(p.id) }))

  return (
    <Box>
      <PageHeader
        title="Permissions"
        subtitle="Manage available permissions for roles"
        breadcrumbs={[
          { label: 'Administration', path: '/settings/users' },
          { label: 'Permissions' },
        ]}
        action={
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => handleOpenForm()}>
            Add Permission
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={mappedPermissions}
        loading={loading}
        searchPlaceholder="Search permissions..."
        onSearch={setSearchQuery}
        emptyMessage="No permissions found"
      />

      {/* Create/Edit Permission Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPerm ? 'Edit Permission' : 'Create Permission'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  select
                  required
                  label="HTTP Method"
                  value={formData.action}
                  onChange={(e) => setFormData((prev) => ({ ...prev, action: e.target.value }))}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                  <MenuItem value="PATCH">PATCH</MenuItem>
                  <MenuItem value="*">* (All)</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Path"
                  value={formData.path}
                  onChange={(e) => setFormData((prev) => ({ ...prev, path: e.target.value }))}
                  placeholder="/api/resource"
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
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.name || !formData.path}>
            {editingPerm ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Permission"
        message="Are you sure you want to delete this permission?"
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default PermissionsPage
