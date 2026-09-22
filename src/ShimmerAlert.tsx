import CloseIcon from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import './ShimmerAlert.css'

const ALERT_BG = '#ECF3FB'
const ALERT_TEXT = '#055ecc'

export type ShimmerAlertProps = {
  children: ReactNode
  onGotIt?: () => void
  sx?: SxProps<Theme>
}

export function ShimmerAlert({ children, onGotIt, sx }: ShimmerAlertProps) {
  return (
    <Box className="shimmer-alert" sx={sx}>
      <Alert
        severity="info"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={onGotIt}
            startIcon={<CloseIcon fontSize="small" />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              minWidth: 'auto',
              whiteSpace: 'nowrap',
              color: ALERT_TEXT,
            }}
          >
            Got it
          </Button>
        }
        sx={{
          bgcolor: ALERT_BG,
          color: ALERT_TEXT,
          '& .MuiAlert-icon': {
            color: ALERT_TEXT,
          },
          '& .MuiAlert-message': {
            color: ALERT_TEXT,
          },
        }}
      >
        {children}
      </Alert>
      <Box className="shimmer-alert__gloss" aria-hidden />
    </Box>
  )
}
