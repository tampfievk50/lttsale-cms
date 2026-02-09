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
import { useCategoriesStore } from '@/store'
import type { ProductCategory } from '@/types'

const CategoriesPage = () => {
  const categories = useCategoriesStore((state) => state.categories)
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories)
  const addCategory = useCategoriesStore((state) => state.addCategory)
  const updateCategory = useCategoriesStore((state) => state.updateCategory)
  const deleteCategory = useCategoriesStore((state) => state.deleteCategory)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '' })

  const handleOpenDialog = (category?: ProductCategory) => {
    if (category) {
      setEditingCategory(category)
      setFormData({ name: category.name })
    } else {
      setEditingCategory(null)
      setFormData({ name: '' })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCategory(null)
    setFormData({ name: '' })
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) return

    if (editingCategory) {
      await updateCategory(editingCategory.id, { name: formData.name })
    } else {
      await addCategory({ name: formData.name })
    }
    handleCloseDialog()
  }

  const handleDeleteClick = (id: string) => {
    setCategoryToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete)
    }
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  const columns: Column<ProductCategory>[] = [
    {
      id: 'name',
      label: 'Category Name',
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
        title="Categories"
        subtitle="Manage product categories"
        breadcrumbs={[
          { label: 'Settings', path: '/settings/categories' },
          { label: 'Categories' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="Search categories..."
        onSearch={(search) => fetchCategories(search)}
        onRowClick={(row) => handleOpenDialog(row)}
        emptyMessage="No categories found"
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add Category'}
        </DialogTitle>
        <DialogContent>
          <TextField
            id="category-name"
            name="name"
            fullWidth
            label="Category Name"
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
            {editingCategory ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products in this category may be affected."
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default CategoriesPage
