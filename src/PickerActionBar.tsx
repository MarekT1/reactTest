import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

export function PickerActionBar({
  className,
  onClear,
  onCancel,
  onAccept,
  acceptDisabled = false,
  clearUnderEndPanel = false,
}: {
  className?: string
  onClear: () => void
  onCancel: () => void
  onAccept: () => void
  acceptDisabled?: boolean
  /** Place Clear at the left edge of the right-hand calendar panel. */
  clearUnderEndPanel?: boolean
}) {
  const buttons = (
    <>
      <Button size="small" onClick={onClear}>
        Clear
      </Button>
      <Box sx={{ display: 'flex', gap: 0.5, ml: clearUnderEndPanel ? 'auto' : 0 }}>
        <Button size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="small" onClick={onAccept} disabled={acceptDisabled}>
          OK
        </Button>
      </Box>
    </>
  )

  if (clearUnderEndPanel) {
    return (
      <Box
        className={className}
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          alignItems: 'center',
          px: 1,
          py: 0.75,
        }}
      >
        <span />
        <Box sx={{ display: 'flex', alignItems: 'center', pl: '20px' }}>{buttons}</Box>
      </Box>
    )
  }

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
      {buttons}
    </Box>
  )
}
