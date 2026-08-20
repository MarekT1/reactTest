import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

export function PickerActionBar({
  className,
  onClear,
  onCancel,
  onAccept,
  acceptDisabled = false,
}: {
  className?: string
  onClear: () => void
  onCancel: () => void
  onAccept: () => void
  acceptDisabled?: boolean
}) {
  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1,
        py: 0.75,
      }}
    >
      <Button size="small" onClick={onClear}>
        Clear
      </Button>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Button size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="small" onClick={onAccept} disabled={acceptDisabled}>
          OK
        </Button>
      </Box>
    </Box>
  )
}
