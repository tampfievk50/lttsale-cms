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
import type { Building } from '@/types'

const BuildingsPage = () => {
  const buildings = useBuildingsStore((state) => state.buildings)
  const fetchBuildings = useBuildingsStore((state) => state.fetchBuildings)
  const addBuilding = useBuildingsStore((state) => state.addBuilding)
  const updateBuilding = useBuildingsStore((state) => state.updateBuilding)
  const deleteBuilding = useBuildingsStore((state) => state.deleteBuilding)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [buildingToDelete, setBuildingToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '' })

  const handleOpenDialog = (building?: Building) => {
    if (building) {
      setEditingBuilding(building)
      setFormData({ name: building.name })
    } else {
      setEditingBuilding(null)
      setFormData({ name: '' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingBuilding(null)
    setFormData({ name: '' })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return

    if (editingBuilding) {
      await updateBuilding(editingBuilding.id, { name: formData.name })
    } else {
      await addBuilding({ name: formData.name })
    }
    handleCloseDialog()
  }

  const handleDeleteClick = (id: string) => {
    setBuildingToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (buildingToDelete) {
      await deleteBuilding(buildingToDelete)
    }
    setDeleteDialogOpen(false)
    setBuildingToDelete(null)
  }

  const columns: Column<Building>[] = [
    {
      id: 'name',
      label: 'Building Name',
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
        title="Buildings"
        subtitle="Manage building locations"
        breadcrumbs={[
          { label: 'Settings', path: '/settings/categories' },
          { label: 'Buildings' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={() => handleOpenDialog()}
          >
            Add Building
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={buildings}
        searchPlaceholder="Search buildings..."
        onSearch={(search) => fetchBuildings(search)}
        onRowClick={(row) => handleOpenDialog(row)}
        emptyMessage="No buildings found"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBuilding ? 'Edit Building' : 'Add Building'}
        </DialogTitle>
        <DialogContent>
          <TextField
            id="building-name"
            name="name"
            fullWidth
            label="Building Name"
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
            {editingBuilding ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Building"
        message="Are you sure you want to delete this building? Customers in this building may be affected."
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default BuildingsPage
