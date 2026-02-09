import { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Avatar,
  Typography,
  Tooltip,
} from '@mui/material'
import {
  IconPlus,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'
import { PageHeader, DataTable, type Column, ConfirmDialog, CustomerFormModal } from '@/components'
import { useCustomersStore, useBuildingsStore } from '@/store'
import type { Customer } from '@/types'

const CustomersList = () => {
  const customers = useCustomersStore((state) => state.customers)
  const fetchCustomers = useCustomersStore((state) => state.fetchCustomers)
  const addCustomer = useCustomersStore((state) => state.addCustomer)
  const updateCustomer = useCustomersStore((state) => state.updateCustomer)
  const deleteCustomer = useCustomersStore((state) => state.deleteCustomer)
  const buildings = useBuildingsStore((state) => state.buildings)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const getBuildingName = (buildingId: string) => {
    const building = buildings.find((b) => b.id === buildingId)
    return building?.name || 'Unknown'
  }

  const handleOpenModal = (customer?: Customer) => {
    setEditingCustomer(customer || null)
    setFormModalOpen(true)
  }

  const handleCloseModal = () => {
    setFormModalOpen(false)
    setEditingCustomer(null)
  }

  const handleFormSubmit = async (data: Omit<Customer, 'id'> & { id?: string }) => {
    if (data.id) {
      await updateCustomer(data.id, data)
    } else {
      await addCustomer(data)
    }
  }

  const handleDeleteClick = (id: string) => {
    setCustomerToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      await deleteCustomer(customerToDelete)
    }
    setDeleteDialogOpen(false)
    setCustomerToDelete(null)
  }

  const columns: Column<Customer>[] = [
    {
      id: 'customer',
      label: 'Customer',
      minWidth: 200,
      format: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {row.image ? (
            <Avatar src={row.image} sx={{ width: 40, height: 40 }} />
          ) : (
            <Avatar sx={{ width: 40, height: 40 }}>
              {row.name.charAt(0)}
            </Avatar>
          )}
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.phoneNumber || 'No phone'}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'address',
      label: 'Address',
      minWidth: 200,
      format: (row) => (
        <Typography variant="body2">{row.address}</Typography>
      ),
    },
    {
      id: 'building',
      label: 'Building',
      minWidth: 150,
      format: (row) => getBuildingName(row.building),
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
                handleOpenModal(row)
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
        title="Customers"
        subtitle="Manage your customer database"
        breadcrumbs={[
          { label: 'Customers', path: '/customers/list' },
          { label: 'List' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={() => handleOpenModal()}
          >
            Add Customer
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customers..."
        onSearch={(search) => fetchCustomers(search)}
        onRowClick={(row) => handleOpenModal(row)}
        emptyMessage="No customers found"
      />

      <CustomerFormModal
        open={formModalOpen}
        customer={editingCustomer}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default CustomersList
