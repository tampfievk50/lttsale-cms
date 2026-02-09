import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material'
import { useCategoriesStore } from '@/store'
import type { Product } from '@/types'

interface ProductFormModalProps {
  open: boolean
  product: Product | null
  onClose: () => void
  onSubmit: (data: Omit<Product, 'id'> & { id?: string }) => void
}

const getInitialFormData = (product: Product | null) => ({
  name: product?.name || '',
  description: product?.description || '',
  price: product?.price?.toString() || '',
  category: product?.category || '',
  image: product?.image || '',
  isPublished: product?.isPublished ?? true,
})

export const ProductFormModal = ({ open, product, onClose, onSubmit }: ProductFormModalProps) => {
  const categories = useCategoriesStore((state) => state.categories)

  const [formData, setFormData] = useState(() => getInitialFormData(product))

  const handleEntered = useCallback(() => {
    setFormData(getInitialFormData(product))
  }, [product])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSubmit({
      id: product?.id,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image || undefined,
      isPublished: formData.isPublished,
    })
    onClose()
  }

  const isValid = formData.name && formData.description && formData.price && formData.category

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEntered: handleEntered }}
    >
      <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="product-name"
                name="name"
                fullWidth
                required
                label="Product Name"
                value={formData.name}
                onChange={handleChange('name')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="product-category"
                name="category"
                fullWidth
                select
                required
                label="Category"
                value={formData.category}
                onChange={handleChange('category')}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                id="product-description"
                name="description"
                fullWidth
                required
                multiline
                rows={2}
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="product-price"
                name="price"
                fullWidth
                required
                type="number"
                label="Price"
                value={formData.price}
                onChange={handleChange('price')}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="product-image"
                name="image"
                fullWidth
                label="Image URL"
                value={formData.image}
                onChange={handleChange('image')}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    id="product-is-published"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleChange('isPublished')}
                  />
                }
                label="Published"
                slotProps={{ typography: { variant: 'body2' } }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid}>
          {product ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
