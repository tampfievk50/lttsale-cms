import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  IconButton,
  Avatar,
  Typography,
  TextField,
  MenuItem,
  Tooltip,
  InputAdornment,
} from '@mui/material'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconSearch,
} from '@tabler/icons-react'
import { PageHeader, DataTable, type Column, StatusChip, ConfirmDialog, ProductFormModal } from '@/components'
import { useProductsStore, useCategoriesStore } from '@/store'
import type { Product } from '@/types'
import { formatVND } from '@/utils'

const ProductsList = () => {
  const products = useProductsStore((state) => state.products)
  const fetchProducts = useProductsStore((state) => state.fetchProducts)
  const addProduct = useProductsStore((state) => state.addProduct)
  const updateProduct = useProductsStore((state) => state.updateProduct)
  const deleteProduct = useProductsStore((state) => state.deleteProduct)
  const togglePublished = useProductsStore((state) => state.togglePublished)
  const categories = useCategoriesStore((state) => state.categories)

  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchProducts(search)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, fetchProducts])

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (categoryFilter && product.category !== categoryFilter) return false
      if (statusFilter !== '') {
        const isPublished = statusFilter === 'true'
        if (product.isPublished !== isPublished) return false
      }
      return true
    })
  }, [products, categoryFilter, statusFilter])

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category?.name || 'Unknown'
  }

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product || null)
    setFormModalOpen(true)
  }

  const handleCloseModal = () => {
    setFormModalOpen(false)
    setEditingProduct(null)
  }

  const handleFormSubmit = async (data: Omit<Product, 'id'> & { id?: string }) => {
    if (data.id) {
      await updateProduct(data.id, data)
    } else {
      await addProduct(data)
    }
  }

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete)
    }
    setDeleteDialogOpen(false)
    setProductToDelete(null)
  }

  const columns: Column<Product>[] = [
    {
      id: 'image',
      label: 'Image',
      minWidth: 80,
      format: (row) =>
        row.image ? (
          <Avatar src={row.image} variant="rounded" sx={{ width: 48, height: 48 }} />
        ) : (
          <Avatar variant="rounded" sx={{ width: 48, height: 48 }}>
            {row.name.charAt(0)}
          </Avatar>
        ),
    },
    {
      id: 'product',
      label: 'Product',
      minWidth: 200,
      format: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {row.description}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 150,
      format: (row) => getCategoryName(row.category),
    },
    {
      id: 'price',
      label: 'Price',
      align: 'right',
      minWidth: 120,
      format: (row) => (
        <Typography fontWeight={500}>{formatVND(row.price)}</Typography>
      ),
    },
    {
      id: 'isPublished',
      label: 'Status',
      align: 'center',
      minWidth: 100,
      format: (row) => (
        <StatusChip
          status={row.isPublished}
          trueLabel="Published"
          falseLabel="Draft"
          trueColor="success"
          falseColor="secondary"
        />
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      minWidth: 130,
      format: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          <Tooltip title={row.isPublished ? 'Unpublish' : 'Publish'}>
            <IconButton
              size="small"
              color={row.isPublished ? 'success' : 'default'}
              onClick={(e) => {
                e.stopPropagation()
                togglePublished(row.id)
              }}
            >
              {row.isPublished ? <IconEye size={18} /> : <IconEyeOff size={18} />}
            </IconButton>
          </Tooltip>
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
        title="Products"
        subtitle="Manage your product catalog"
        breadcrumbs={[
          { label: 'Products', path: '/products/list' },
          { label: 'List' },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={() => handleOpenModal()}
          >
            Add Product
          </Button>
        }
      />

      {/* Filters & Search */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          mb: 1,
        }}
      >
        <TextField
          id="products-search"
          name="search"
          placeholder="Search products..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 220 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="products-category-filter"
          name="categoryFilter"
          select
          label="Category"
          size="small"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ width: { xs: '100%', sm: 200 } }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="products-status-filter"
          name="statusFilter"
          select
          label="Status"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: { xs: '100%', sm: 170 } }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="true">Published</MenuItem>
          <MenuItem value="false">Draft</MenuItem>
        </TextField>
      </Box>

      <DataTable
        columns={columns}
        data={filteredProducts}
        onRowClick={(row) => handleOpenModal(row)}
        emptyMessage="No products found"
      />

      <ProductFormModal
        open={formModalOpen}
        product={editingProduct}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default ProductsList
