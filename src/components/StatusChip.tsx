import { Chip } from '@mui/material'

interface StatusChipProps {
  status: boolean
  trueLabel?: string
  falseLabel?: string
  trueColor?: 'success' | 'primary' | 'info'
  falseColor?: 'error' | 'warning' | 'secondary'
  size?: 'small' | 'medium'
}

export const StatusChip = ({
  status,
  trueLabel = 'Yes',
  falseLabel = 'No',
  trueColor = 'success',
  falseColor = 'error',
  size = 'small',
}: StatusChipProps) => {
  return (
    <Chip
      label={status ? trueLabel : falseLabel}
      color={status ? trueColor : falseColor}
      size={size}
      sx={{ fontWeight: 500 }}
    />
  )
}
