import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Button,
  IconButton,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
} from '@mui/material'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import { PageHeader, DataTable, type Column, ConfirmDialog } from '@/components'
import { ssoApi } from '@/api'
import type { Resource } from '@/types'

const DomainsPage = () => {
  const [domains, setDomains] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [toDelete, setToDelete] = useState<number | null>(null)

  const fetchDomains = useCallback(async () => {
    setLoading(true)
    try {
      const data = await ssoApi.getResources()
      setDomains(Array.isArray(data) ? data : [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDomains()
  }, [fetchDomains])

  const handleOpenForm = (domain?: Resource) => {
    setEditing(domain || null)
    setFormData({
      name: domain?.name || '',
      description: domain?.description || '',
    })
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (editing) {
      await ssoApi.updateResource(editing.id, formData)
    } else {
      await ssoApi.createResource(formData)
    }
    setFormOpen(false)
    setEditing(null)
    await fetchDomains()
  }

  const handleDeleteClick = (id: number) => {
    setToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (toDelete !== null) {
      await ssoApi.deleteResource(toDelete)
      await fetchDomains()
    }
    setDeleteDialogOpen(false)
    setToDelete(null)
  }

  const columns: Column<Resource>[] = [
    {
      id: 'id',
      label: 'ID',
      minWidth: 60,
      format: (row) => (
        <Typography variant="body2" color="text.secondary">{row.id}</Typography>
      ),
    },
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
      minWidth: 120,
      format: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenForm(row)
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
                handleDeleteClick(row.id)
              }}
            >
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  const filtered = domains.filter((d) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return d.name.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q)
  })
  return (
    <Box>
      <PageHeader
        title="Domains"
        subtitle="Manage tenant domains / resources"
        breadcrumbs={[
          { label: 'Administration', path: '/settings/users' },
          { label: 'Domains' },
        ]}
        action={
          <Button variant="contained" startIcon={<IconPlus size={18} />} onClick={() => handleOpenForm()}>
            Add Domain
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        searchPlaceholder="Search domains..."
        onSearch={setSearchQuery}
        emptyMessage="No domains found"
      />

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editing ? 'Edit Domain' : 'Create Domain'}</DialogTitle>
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
            {editing ? 'Save' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Domain"
        message="Are you sure you want to delete this domain? Users assigned to this domain may lose access."
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default DomainsPage
