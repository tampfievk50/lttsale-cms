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
  Box,
} from '@mui/material'
import { useBuildingsStore } from '@/store'
import type { Customer } from '@/types'

interface CustomerFormModalProps {
  open: boolean
  customer: Customer | null
  onClose: () => void
  onSubmit: (data: Omit<Customer, 'id'> & { id?: string }) => void
}

const getInitialFormData = (customer: Customer | null) => ({
  name: customer?.name || '',
  address: customer?.address || '',
  building: customer?.building || '',
  phoneNumber: customer?.phoneNumber || '',
  image: customer?.image || '',
})

export const CustomerFormModal = ({ open, customer, onClose, onSubmit }: CustomerFormModalProps) => {
  const buildings = useBuildingsStore((state) => state.buildings)

  const [formData, setFormData] = useState(() => getInitialFormData(customer))

  const handleEntered = useCallback(() => {
    setFormData(getInitialFormData(customer))
  }, [customer])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = () => {
    onSubmit({
      id: customer?.id,
      name: formData.name,
      address: formData.address,
      building: formData.building,
      phoneNumber: formData.phoneNumber || undefined,
      image: formData.image || undefined,
    })
    onClose()
  }

  const isValid = formData.name && formData.address && formData.building

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{ onEntered: handleEntered }}
    >
      <DialogTitle>{customer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="customer-name"
                name="name"
                fullWidth
                required
                label="Customer Name"
                value={formData.name}
                onChange={handleChange('name')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="customer-phone"
                name="phoneNumber"
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                placeholder="+1 234 567 8900"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                id="customer-address"
                name="address"
                fullWidth
                required
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="customer-building"
                name="building"
                fullWidth
                select
                required
                label="Building"
                value={formData.building}
                onChange={handleChange('building')}
              >
                {buildings.map((building) => (
                  <MenuItem key={building.id} value={building.id}>
                    {building.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                id="customer-image"
                name="image"
                fullWidth
                label="Image URL"
                value={formData.image}
                onChange={handleChange('image')}
                placeholder="https://example.com/image.jpg"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid}>
          {customer ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
