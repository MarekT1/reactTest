import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import type { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar'
import { usePickerContext, useSplitFieldProps } from '@mui/x-date-pickers/hooks'
import type { DateRangePickerFieldProps } from '@mui/x-date-pickers-pro/DateRangePicker'
import { DesktopDateRangePicker } from '@mui/x-date-pickers-pro/DesktopDateRangePicker'
import type { PickersRangeCalendarHeaderProps } from '@mui/x-date-pickers-pro/PickersRangeCalendarHeader'
import type { DateRange } from '@mui/x-date-pickers-pro/models'
import { LicenseInfo } from '@mui/x-license'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/en-gb'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HeaderStepper } from './DatePickerHeaderStepper'
import { getDefaultDateRange } from './dateRange'

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const
const MONTH_SHORT_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const
const YEAR_RANGE = 100

const licenseKey = import.meta.env.VITE_MUI_X_LICENSE_KEY
if (typeof licenseKey === 'string' && licenseKey.length > 0) {
  LicenseInfo.setLicenseKey(licenseKey)
}

export type DateRangeSelection = [Date | null, Date | null]

type PastDateRangePickerProps = {
  value: DateRangeSelection
  onChange: (value: DateRangeSelection) => void
}

function getDefaultDayjsRange(): DateRange<Dayjs> {
  const [from, to] = getDefaultDateRange()
  return [dayjs(from), dayjs(to)]
}

function toDayjsRange(value: DateRangeSelection): DateRange<Dayjs> {
  return [value[0] ? dayjs(value[0]) : null, value[1] ? dayjs(value[1]) : null]
}

function toDateRange(value: DateRange<Dayjs>): DateRangeSelection {
  return [value[0] ? value[0].toDate() : null, value[1] ? value[1].toDate() : null]
}

function formatDotDate(date: Dayjs): string {
  return date.format('DD.MM.YYYY')
}

function formatRangeLabel(start: Dayjs | null, end: Dayjs | null): string {
  if (!start) {
    return ''
  }
  const startText = formatDotDate(start)
  if (!end) {
    return startText
  }
  if (end.isSame(dayjs().startOf('day'), 'day')) {
    return `${startText} - Today`
  }
  return `${startText} - ${formatDotDate(end)}`
}

function isMonthAfterToday(date: Dayjs): boolean {
  const today = dayjs().startOf('month')
  return date.startOf('month').isAfter(today)
}

function clampLeftmostMonth(leftmost: Dayjs, calendars: number): Dayjs {
  const todayMonth = dayjs().startOf('month')
  const maxLeftmost = todayMonth.subtract(calendars - 1, 'month')
  return leftmost.isAfter(maxLeftmost) ? maxLeftmost : leftmost
}

function RangeCalendarHeader(props: PickersRangeCalendarHeaderProps) {
  const { month, monthIndex, calendars, currentMonth, onMonthChange, className, labelId } =
    props
  const monthDate = dayjs(month)
  const current = dayjs(currentMonth)
  const [list, setList] = useState<'month' | 'year' | null>(null)
  const monthButtonRef = useRef<HTMLButtonElement>(null)
  const yearButtonRef = useRef<HTMLButtonElement>(null)
  const selectedYearRef = useRef<HTMLButtonElement>(null)
  const todayYear = dayjs().year()
  const years = useMemo(
    () => Array.from({ length: YEAR_RANGE + 1 }, (_, index) => todayYear - YEAR_RANGE + index),
    [todayYear],
  )

  const shiftWindow = (amount: number, unit: 'month' | 'year') => {
    const next = unit === 'month' ? current.add(amount, 'month') : current.add(amount, 'year')
    onMonthChange(clampLeftmostMonth(next.startOf('month'), calendars))
  }

  const goToThisCalendarMonth = (target: Dayjs) => {
    const leftmost = target.startOf('month').subtract(monthIndex, 'month')
    onMonthChange(clampLeftmostMonth(leftmost, calendars))
    setList(null)
  }

  const nextMonthDisabled = isMonthAfterToday(current.add(1, 'month'))
  const nextYearDisabled = isMonthAfterToday(current.add(1, 'year'))
  const yearListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (list !== 'year') {
      return
    }
    const selected = selectedYearRef.current
    const container = yearListRef.current
    if (!selected || !container) {
      return
    }
    const selectedRect = selected.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    container.scrollTop +=
      selectedRect.top - containerRect.top - container.clientHeight / 2 + selectedRect.height / 2
  }, [list, monthDate])

  return (
    <ClickAwayListener onClickAway={() => setList(null)}>
      <Box
        className={className}
        sx={{
          position: 'relative',
          zIndex: list != null ? 2 : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pl: '14px',
          pr: '14px',
          pt: '14px',
          pb: '10px',
          overflow: 'visible',
        }}
      >
        <HeaderStepper
          label={MONTH_LABELS[monthDate.month()]}
          listOpen={list === 'month'}
          nextDisabled={nextMonthDisabled}
          prevAriaLabel="Previous month"
          nextAriaLabel="Next month"
          labelRef={monthButtonRef}
          onPrev={() => shiftWindow(-1, 'month')}
          onNext={() => shiftWindow(1, 'month')}
          onToggleList={() => setList((currentList) => (currentList === 'month' ? null : 'month'))}
        />
        <HeaderStepper
          label={String(monthDate.year())}
          listOpen={list === 'year'}
          nextDisabled={nextYearDisabled}
          prevAriaLabel="Previous year"
          nextAriaLabel="Next year"
          labelRef={yearButtonRef}
          onPrev={() => shiftWindow(-1, 'year')}
          onNext={() => shiftWindow(1, 'year')}
          onToggleList={() => setList((currentList) => (currentList === 'year' ? null : 'year'))}
        />

        {list != null && (
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              top: '100%',
              left: 8,
              right: 8,
              zIndex: 3,
              bgcolor: 'background.paper',
              boxShadow: 3,
              p: 1,
              maxHeight: 280,
              overflowY: 'auto',
            }}
            ref={list === 'year' ? yearListRef : undefined}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 0.5,
              }}
            >
              {list === 'month' &&
                MONTH_SHORT_LABELS.map((label, monthIdx) => {
                  const candidate = monthDate.month(monthIdx)
                  const disabled = isMonthAfterToday(candidate)
                  const selected = monthDate.month() === monthIdx
                  return (
                    <Button
                      key={label}
                      disabled={disabled}
                      variant={selected ? 'contained' : 'text'}
                      onClick={() => goToThisCalendarMonth(candidate)}
                      sx={{ textTransform: 'none', borderRadius: 4, minWidth: 0 }}
                    >
                      {label}
                    </Button>
                  )
                })}
              {list === 'year' &&
                years.map((year) => {
                  const selected = monthDate.year() === year
                  const disabled = year > todayYear
                  return (
                    <Button
                      key={year}
                      ref={selected ? selectedYearRef : undefined}
                      disabled={disabled}
                      variant={selected ? 'contained' : 'text'}
                      onClick={() => goToThisCalendarMonth(monthDate.year(year))}
                      sx={{ textTransform: 'none', borderRadius: 4, minWidth: 0 }}
                    >
                      {year}
                    </Button>
                  )
                })}
            </Box>
          </Paper>
        )}
        <Box component="span" id={labelId} sx={{ display: 'none' }}>
          {monthDate.format('MMMM YYYY')}
        </Box>
      </Box>
    </ClickAwayListener>
  )
}

function DateRangeField(props: DateRangePickerFieldProps) {
  const { forwardedProps } = useSplitFieldProps(props, 'date')
  const {
    value,
    setOpen,
    disabled,
    triggerRef,
    rootRef,
    rootClassName,
    rootSx,
    name,
    label,
  } = usePickerContext<DateRange<Dayjs>>()

  const [start, end] = value ?? [null, null]

  return (
    <TextField
      {...forwardedProps}
      ref={rootRef}
      name={name}
      label={label}
      className={rootClassName}
      size="small"
      value={formatRangeLabel(start, end)}
      placeholder="dd.mm.yyyy - Today"
      disabled={disabled}
      onClick={() => setOpen((isOpen) => !isOpen)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          setOpen((isOpen) => !isOpen)
        }
      }}
      slotProps={{
        input: {
          ref: triggerRef,
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start" sx={{ mr: 0.75 }}>
              <CalendarMonthIcon sx={{ fontSize: 20, color: 'action.active' }} />
            </InputAdornment>
          ),
        },
        htmlInput: {
          'aria-label': 'Date range',
        },
      }}
      sx={[
        {
          width: 250,
          '& .MuiInputBase-root': { cursor: 'pointer' },
        },
        ...(Array.isArray(rootSx) ? rootSx : rootSx ? [rootSx] : []),
      ]}
    />
  )
}

DateRangeField.fieldType = 'single-input' as const

function DateRangeActionBar(props: PickersActionBarProps) {
  const { className } = props
  const { value, setValue, acceptValueChanges, cancelValueChanges } =
    usePickerContext<DateRange<Dayjs>>()
  const [start, end] = value ?? [null, null]
  const incomplete = start == null || end == null

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
      <Button
        size="small"
        onClick={() =>
          setValue(getDefaultDayjsRange(), { changeImportance: 'set', source: 'view' })
        }
      >
        Clear
      </Button>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Button size="small" onClick={cancelValueChanges}>
          Cancel
        </Button>
        <Button size="small" onClick={acceptValueChanges} disabled={incomplete}>
          OK
        </Button>
      </Box>
    </Box>
  )
}

export function PastDateRangePicker({ value, onChange }: PastDateRangePickerProps) {
  const pickerValue = useMemo(() => toDayjsRange(value), [value])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <DesktopDateRangePicker
        value={pickerValue}
        onChange={(nextValue) => onChange(toDateRange(nextValue))}
        calendars={2}
        disableFuture
        closeOnSelect={false}
        showDaysOutsideCurrentMonth
        fixedWeekNumber={6}
        format="DD.MM.YYYY"
        enableAccessibleFieldDOMStructure={false}
        slots={{
          field: DateRangeField,
          actionBar: DateRangeActionBar,
          calendarHeader: RangeCalendarHeader,
        }}
        slotProps={{
          popper: {
            placement: 'bottom-start',
          },
        }}
        sx={{
          '& .MuiDateRangeCalendar-monthContainer': {
            overflow: 'visible',
            position: 'relative',
          },
          '& .MuiDayCalendar-header': {
            mt: 0,
            pt: 0,
          },
        }}
      />
    </LocalizationProvider>
  )
}
