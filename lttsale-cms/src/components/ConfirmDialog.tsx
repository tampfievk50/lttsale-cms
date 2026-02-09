import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
