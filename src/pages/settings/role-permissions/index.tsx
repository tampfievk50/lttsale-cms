import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  InputAdornment,
  Paper,
} from '@mui/material'
import { IconSearch } from '@tabler/icons-react'
import { PageHeader } from '@/components'
import { useRolesManagementStore } from '@/store'
import type { Permission, Policy } from '@/types'
import { ssoApi } from '@/api'

interface Resource {
  id: number
  name: string
  description: string
}

const RolePermissionsPage = () => {
  const roles = useRolesManagementStore((s) => s.roles)
  const permissions = useRolesManagementStore((s) => s.permissions)
  const loading = useRolesManagementStore((s) => s.loading)
  const error = useRolesManagementStore((s) => s.error)
  const fetchRoles = useRolesManagementStore((s) => s.fetchRoles)
  const fetchPermissions = useRolesManagementStore((s) => s.fetchPermissions)
  const fetchRolePolicies = useRolesManagementStore((s) => s.fetchRolePolicies)
  const addPolicy = useRolesManagementStore((s) => s.addPolicy)
  const removePolicy = useRolesManagementStore((s) => s.removePolicy)

  const [selectedRoleId, setSelectedRoleId] = useState<number | ''>('')
  const [selectedDomainId, setSelectedDomainId] = useState<number>(0)
  const [resources, setResources] = useState<Resource[]>([])
  const [rolePolicies, setRolePolicies] = useState<Policy[]>([])
  const [policiesLoading, setPoliciesLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
    ssoApi.getResources().then((res) => setResources(Array.isArray(res) ? res : [])).catch(() => {})
  }, [fetchRoles, fetchPermissions])

  // Default to Administrator role once roles are loaded
  useEffect(() => {
    if (roles.length > 0 && selectedRoleId === '') {
      const admin = roles.find((r) => r.name === 'Administrator')
      if (admin) setSelectedRoleId(admin.id)
    }
  }, [roles, selectedRoleId])

  useEffect(() => {
    if (selectedRoleId === '') {
      setRolePolicies([])
      return
    }
    const loadPolicies = async () => {
      setPoliciesLoading(true)
      const policies = await fetchRolePolicies(selectedRoleId)
      setRolePolicies(policies)
      setPoliciesLoading(false)
    }
    loadPolicies()
  }, [selectedRoleId, fetchRolePolicies])

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || null

  const domainStr = String(selectedDomainId)

  const isPolicyAssigned = (perm: Permission): boolean => {
    return rolePolicies.some((p) => p.path === perm.path && p.action === perm.action && p.domain_id === domainStr)
  }

  const getPolicy = (perm: Permission): Policy | undefined => {
    return rolePolicies.find((p) => p.path === perm.path && p.action === perm.action && p.domain_id === domainStr)
  }

  const handleToggle = async (perm: Permission) => {
    if (!selectedRole) return
    const existing = getPolicy(perm)
    if (existing) {
      await removePolicy({
        role_id: existing.role_id,
        domain_id: existing.domain_id,
        path: existing.path,
        action: existing.action,
      })
    } else {
      await addPolicy({
        roles: [selectedRole.id],
        domain_id: selectedDomainId,
        path: perm.path,
        action: perm.action,
        access: 'allow',
      })
    }
    const policies = await fetchRolePolicies(selectedRole.id)
    setRolePolicies(policies)
  }

  const handleToggleEffect = async (e: React.MouseEvent, perm: Permission) => {
    e.stopPropagation()
    if (!selectedRole) return
    const existing = getPolicy(perm)
    if (!existing) return
    const newEffect = (existing.effect || 'allow') === 'allow' ? 'deny' : 'allow'
    await removePolicy({
      role_id: existing.role_id,
      domain_id: existing.domain_id,
      path: existing.path,
      action: existing.action,
    })
    await addPolicy({
      roles: [selectedRole.id],
      domain_id: selectedDomainId,
      path: perm.path,
      action: perm.action,
      access: newEffect,
    })
    const policies = await fetchRolePolicies(selectedRole.id)
    setRolePolicies(policies)
  }

  const filteredPermissions = useMemo(() => {
    if (!search) return permissions
    const q = search.toLowerCase()
    return permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q) ||
        p.action.toLowerCase().includes(q),
    )
  }, [permissions, search])

  return (
    <Box>
      <PageHeader
        title="Role Permissions"
        subtitle="Assign permissions to roles via Casbin policies"
        breadcrumbs={[{ label: 'Administration', path: '/settings/users' }, { label: 'Role Permissions' }]}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

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
          id="role-permissions-role"
          name="role"
          select
          label="Select Role"
          size="small"
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value as number | '')}
          sx={{ width: { xs: '100%', sm: 200 } }}
        >
          {roles.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="role-permissions-domain"
          name="domain"
          select
          label="Domain"
          size="small"
          value={selectedDomainId}
          onChange={(e) => setSelectedDomainId(Number(e.target.value))}
          sx={{ width: { xs: '100%', sm: 200 } }}
        >
          <MenuItem value={0}>Global (all domains)</MenuItem>
          {resources.map((r) => (
            <MenuItem key={r.id} value={r.id}>
              {r.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="role-permissions-search"
          name="search"
          placeholder="Filter permissions..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 250 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            ),
          }}
        />
        {selectedRole && (
          <Chip
            label={`${rolePolicies.length} assigned`}
            color="primary"
            size="small"
          />
        )}
      </Box>

      {selectedRole ? (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          {policiesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Assigned</TableCell>
                    <TableCell>Permission</TableCell>
                    <TableCell>Path</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Effect</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPermissions.map((perm) => {
                    const assigned = isPolicyAssigned(perm)
                    const policy = getPolicy(perm)
                    return (
                      <TableRow
                        key={perm.id}
                        hover
                        onClick={() => handleToggle(perm)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={assigned && (policy?.effect || 'allow') === 'allow'}
                            indeterminate={assigned && policy?.effect === 'deny'}
                            disabled={loading}
                            tabIndex={-1}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {perm.name}
                          </Typography>
                          {perm.description && (
                            <Typography variant="caption" color="text.secondary">
                              {perm.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontSize={13}>
                            {perm.path}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={perm.action} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          {assigned ? (
                            <Chip
                              label={policy?.effect || 'allow'}
                              color={(policy?.effect || 'allow') === 'deny' ? 'error' : 'success'}
                              size="small"
                              onClick={(e) => handleToggleEffect(e, perm)}
                              sx={{ cursor: 'pointer' }}
                            />
                          ) : (
                            <Chip
                              label="allow"
                              size="small"
                              variant="outlined"
                              sx={{ opacity: 0.4 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredPermissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                          No permissions found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
          Select a role to manage its permissions
        </Typography>
      )}
    </Box>
  )
}

export default RolePermissionsPage
