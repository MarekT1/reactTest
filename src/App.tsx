import EditIcon from '@mui/icons-material/Edit'
import EventIcon from '@mui/icons-material/Event'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Select from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { DateRangePicker } from './DateRangePicker'
import { PastToTodayDatePicker } from './PastToTodayDatePicker'
import { getDefaultDateRange } from './dateRange'

function defaultFromDate(): Date {
  return getDefaultDateRange()[0]
}

const now = new Date()

const createdDate = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
  .format(now)
  .replaceAll('/', '.')

const createdTime = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
}).format(now)

const rejectReasons = ['reason 1', 'Reason 2'] as const

function App() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() =>
    getDefaultDateRange(),
  )
  const [fromDate, setFromDate] = useState<Date | null>(() => defaultFromDate())
  const [rejectAnchorEl, setRejectAnchorEl] = useState<HTMLButtonElement | null>(
    null,
  )
  const [rejectReason, setRejectReason] = useState<string>('')

  const rejectPopoverOpen = Boolean(rejectAnchorEl)

  const handleRejectConfirm = () => {
    setRejectAnchorEl(null)
    setRejectReason('')
  }

  return (
    <Box sx={{ width: '100%', px: 2, py: 1.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EditIcon fontSize="small" />
          <Typography sx={{ fontSize: '17px' }}>Address Ch.</Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '11px',
            lineHeight: '11px',
          }}
        >
          <EventIcon sx={{ fontSize: 11, width: 11, height: 11, mt: '1px' }} />
          <Box component="span" sx={{ mt: '1px' }}>
            Created
          </Box>
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              border: '1px solid #000',
              boxSizing: 'border-box',
              px: 1,
              pt: '1px',
              pb: '2px',
              fontSize: '11px',
              lineHeight: '11px',
              whiteSpace: 'nowrap',
              '@supports (text-box-trim: trim-both)': {
                textBoxTrim: 'trim-both',
                textBoxEdge: 'cap alphabetic',
                pb: '1px',
              },
            }}
          >
            {createdDate}
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 3,
                height: 3,
                borderRadius: '50%',
                bgcolor: '#000',
                mx: 0.75,
                verticalAlign: 'middle',
              }}
            />
            {createdTime}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1,
          mt: 2,
        }}
      >
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          useToday
          disableFuture
        />
        <PastToTodayDatePicker value={fromDate} onChange={setFromDate} />
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={(e) => setRejectAnchorEl(e.currentTarget)}
        >
          Reject changes
        </Button>
        <Button variant="contained" color="primary" size="small">
          Confirm changes
        </Button>
      </Box>

      <Popover
        open={rejectPopoverOpen}
        anchorEl={rejectAnchorEl}
        onClose={() => setRejectAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { p: 2, width: 280 },
          },
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Reject changes sdfjasdf jas;lkdfj aslkdfjasldkfjasdlkfj
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel id="reject-reason-label">Reason</InputLabel>
          <Select
            labelId="reject-reason-label"
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          >
            {rejectReasons.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleRejectConfirm}
            disabled={!rejectReason}
          >
            Confirm
          </Button>
        </Box>
      </Popover>
    </Box>
  )
}

export default App
