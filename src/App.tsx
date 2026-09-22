import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import EditIcon from '@mui/icons-material/Edit'
import EventIcon from '@mui/icons-material/Event'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DesktopDateRangePicker } from '@mui/x-date-pickers-pro/DesktopDateRangePicker'
import type { DateRange } from '@mui/x-date-pickers-pro/models'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/en-gb'
import { useState } from 'react'
import { DatePicker } from './DatePicker'
import { DateRangePicker } from './DateRangePicker'
import { getDefaultDateRange } from './dateRange'
import { ShimmerAlert } from './ShimmerAlert'

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

const typeOptions = [
  {
    value: 'contact',
    label: 'Contact',
    secondary: 'Call, SMS, Document',
    icon: PersonOutlineIcon,
  },
  {
    value: 'case',
    label: 'Case',
    icon: FolderOutlinedIcon,
  },
  {
    value: 'reference',
    label: 'Reference',
    icon: BookmarkBorderIcon,
  },
] as const

type TypeOptionValue = (typeof typeOptions)[number]['value']

function App() {
  const [defaultDateRange, setDefaultDateRange] = useState<DateRange<Dayjs>>(
    () => {
      const [from, to] = getDefaultDateRange()
      return [dayjs(from), dayjs(to)]
    },
  )
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>(() =>
    getDefaultDateRange(),
  )
  const [fromDate, setFromDate] = useState<Date | null>(() => defaultFromDate())
  const [rejectAnchorEl, setRejectAnchorEl] = useState<HTMLButtonElement | null>(
    null,
  )
  const [rejectReason, setRejectReason] = useState<string>('')
  const [simpleType, setSimpleType] = useState<TypeOptionValue | ''>('')
  const [richType, setRichType] = useState<TypeOptionValue | ''>('')
  const [showInfoAlert, setShowInfoAlert] = useState(true)

  const selectedRichOption = typeOptions.find((option) => option.value === richType)

  const rejectPopoverOpen = Boolean(rejectAnchorEl)

  const handleRejectConfirm = () => {
    setRejectAnchorEl(null)
    setRejectReason('')
  }

  return (
    <Box sx={{ width: '100%', px: 2, py: 1.5 }}>
      {showInfoAlert ? (
        <ShimmerAlert sx={{ mb: 2 }} onGotIt={() => setShowInfoAlert(false)}>
          This is an informational notice.
        </ShimmerAlert>
      ) : null}

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
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
          <DesktopDateRangePicker
            value={defaultDateRange}
            onChange={(nextValue) => setDefaultDateRange(nextValue)}
            slotProps={{
              textField: { size: 'small' },
            }}
          />
        </LocalizationProvider>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          useToday
          disableFuture
        />
        <DatePicker value={fromDate} onChange={setFromDate} />
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

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          mt: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="simple-type-label">Type</InputLabel>
          <Select
            labelId="simple-type-label"
            label="Type"
            value={simpleType}
            onChange={(event: SelectChangeEvent<TypeOptionValue | ''>) =>
              setSimpleType(event.target.value as TypeOptionValue | '')
            }
          >
            {typeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="rich-type-label">Type</InputLabel>
          <Select
            labelId="rich-type-label"
            label="Type"
            value={richType}
            onChange={(event: SelectChangeEvent<TypeOptionValue | ''>) =>
              setRichType(event.target.value as TypeOptionValue | '')
            }
            renderValue={() => {
              if (!selectedRichOption) {
                return ''
              }
              const Icon = selectedRichOption.icon
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon fontSize="small" />
                  {selectedRichOption.label}
                </Box>
              )
            }}
            MenuProps={{
              slotProps: {
                paper: {
                  sx: { minWidth: 240 },
                },
              },
            }}
          >
            {typeOptions.map((option) => {
              const Icon = option.icon
              return (
                <MenuItem key={option.value} value={option.value} sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={option.label}
                    secondary={'secondary' in option ? option.secondary : undefined}
                    slotProps={{
                      primary: { sx: { fontSize: 14, lineHeight: 1.3 } },
                      secondary: { sx: { fontSize: 11, lineHeight: 1.3 } },
                    }}
                  />
                </MenuItem>
              )
            })}
          </Select>
        </FormControl>
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
