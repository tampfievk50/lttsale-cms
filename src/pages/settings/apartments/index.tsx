import { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material'
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react'
import { PageHeader, DataTable, type Column, ConfirmDialog } from '@/components'
import { useBuildingsStore } from '@/store'
import type { Apartment } from '@/types'

const ApartmentsPage = () => {
  const apartments = useBuildingsStore((state) => state.apartments)
  const fetchApartments = useBuildingsStore((state) => state.fetchApartments)
  const addApartment = useBuildingsStore((state) => state.addApartment)
  const updateApartment = useBuildingsStore((state) => state.updateApartment)
  const deleteApartment = useBuildingsStore((state) => state.deleteApartment)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingApartment, setEditingApartment] = useState<Apartment | null>(null)
  const [apartmentToDelete, setApartmentToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '' })

  const handleOpenDialog = (apartment?: Apartment) => {
    if (apartment) {
      setEditingApartment(apartment)
      setFormData({ name: apartment.name })
    } else {
      setEditingApartment(null)
      setFormData({ name: '' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingApartment(null)
    setFormData({ name: '' })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return

    if (editingApartment) {
      await updateApartment(editingApartment.id, { name: formData.name })
    } else {
      await addApartment({ name: formData.name })
    }
    handleCloseDialog()
  }

  const handleDeleteClick = (id: string) => {
    setApartmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (apartmentToDelete) {
      await deleteApartment(apartmentToDelete)
    }
    setDeleteDialogOpen(false)
    setApartmentToDelete(null)
  }

  const columns: Column<Apartment>[] = [
    {
      id: 'name',
      label: 'Apartment Name',
      minWidth: 300,
      format: (row) => (
        <Typography variant="body2" fontWeight={500}>
          {row.name}
        </Typography>
      ),
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
                handleOpenDialog(row)
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

  return (
    <Box>
      <PageHeader
        title="Apartments"
        subtitle="Manage apartment units"
        breadcrumbs={[
          { label: 'Settings', path: '/settings/categories' },
          { label: 'Apartments' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={() => handleOpenDialog()}
          >
            Add Apartment
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={apartments}
        searchPlaceholder="Search apartments..."
        onSearch={(search) => fetchApartments(search)}
        onRowClick={(row) => handleOpenDialog(row)}
        emptyMessage="No apartments found"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingApartment ? 'Edit Apartment' : 'Add Apartment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            id="apartment-name"
            name="name"
            fullWidth
            label="Apartment Name"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            sx={{ mt: 1 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name.trim()}
          >
            {editingApartment ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Apartment"
        message="Are you sure you want to delete this apartment?"
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default ApartmentsPage
