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
import {
  DesktopDateRangePicker,
  type DesktopDateRangePickerSlots,
} from '@mui/x-date-pickers-pro/DesktopDateRangePicker'
import type { PickersRangeCalendarHeaderProps } from '@mui/x-date-pickers-pro/PickersRangeCalendarHeader'
import type { DateRange } from '@mui/x-date-pickers-pro/models'
import useForkRef from '@mui/utils/useForkRef'
import { LicenseInfo } from '@mui/x-license'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/en-gb'
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ForwardRefExoticComponent,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react'
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

export type DateRangePickerProps = {
  value: DateRangeSelection
  onChange: (value: DateRangeSelection) => void
  /** Show "Today" in the field when the end date is today. */
  useToday?: boolean
  /** Block dates after today and stop month/year navigation in the future. */
  disableFuture?: boolean
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

function formatRangeLabel(
  start: Dayjs | null,
  end: Dayjs | null,
  useToday: boolean,
): string {
  if (!start) {
    return ''
  }
  const startText = formatDotDate(start)
  if (!end) {
    return startText
  }
  if (useToday && end.isSame(dayjs().startOf('day'), 'day')) {
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

function RangeCalendarHeader(props: PickersRangeCalendarHeaderProps<Dayjs>) {
  const {
    month,
    monthIndex,
    calendars,
    currentMonth,
    onMonthChange,
    className,
    labelId,
    disableFuture = false,
  } = props
  const monthDate = dayjs(month)
  const current = dayjs(currentMonth)
  const [list, setList] = useState<'month' | 'year' | null>(null)
  const monthButtonRef = useRef<HTMLButtonElement>(null)
  const yearButtonRef = useRef<HTMLButtonElement>(null)
  const selectedYearRef = useRef<HTMLButtonElement>(null)
  const todayYear = dayjs().year()
  const years = useMemo(() => {
    const startYear = todayYear - YEAR_RANGE
    const endYear = disableFuture ? todayYear : todayYear + YEAR_RANGE
    return Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index)
  }, [todayYear, disableFuture])

  const changeLeftmostMonth = (next: Dayjs) => {
    const target = next.startOf('month')
    const clamped = disableFuture ? clampLeftmostMonth(target, calendars) : target
    onMonthChange(clamped, clamped.isAfter(current) ? 'left' : 'right')
  }

  const shiftWindow = (amount: number, unit: 'month' | 'year') => {
    const next = unit === 'month' ? current.add(amount, 'month') : current.add(amount, 'year')
    changeLeftmostMonth(next)
  }

  const goToThisCalendarMonth = (target: Dayjs) => {
    changeLeftmostMonth(target.startOf('month').subtract(monthIndex, 'month'))
    setList(null)
  }

  const nextMonthDisabled = disableFuture && isMonthAfterToday(current.add(1, 'month'))
  const nextYearDisabled = disableFuture && isMonthAfterToday(current.add(1, 'year'))
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
                  const disabled = disableFuture && isMonthAfterToday(candidate)
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
                  const disabled = disableFuture && year > todayYear
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

type DateRangeFieldProps = {
  value?: DateRange<Dayjs>
  disabled?: boolean
  InputProps?: { ref?: Ref<HTMLDivElement> }
  id?: string
  name?: string
  label?: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLElement>
  onKeyDown?: KeyboardEventHandler<HTMLElement>
  useToday?: boolean
}

type DateRangeFieldComponent = ForwardRefExoticComponent<
  DateRangeFieldProps & RefAttributes<HTMLDivElement>
> & { fieldType: 'single-input' }

const DateRangeField = forwardRef<HTMLDivElement, DateRangeFieldProps>(
  function DateRangeField(props, ref) {
    const {
      value,
      disabled,
      InputProps,
      id,
      name,
      label,
      className,
      onClick,
      onKeyDown,
      useToday = false,
    } = props
    const [start, end] = value ?? [null, null]
    const handleRef = useForkRef(ref, InputProps?.ref)

    return (
      <TextField
        ref={handleRef}
        id={id}
        name={name}
        label={label}
        className={className}
        size="small"
        value={formatRangeLabel(start, end, useToday)}
        placeholder={useToday ? 'dd.mm.yyyy - Today' : 'dd.mm.yyyy - dd.mm.yyyy'}
        disabled={disabled}
        onClick={onClick}
        onKeyDown={onKeyDown}
        slotProps={{
          input: {
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
        sx={{
          width: 250,
          '& .MuiInputBase-root': { cursor: 'pointer' },
        }}
      />
    )
  },
) as DateRangeFieldComponent

DateRangeField.fieldType = 'single-input'

type DateRangeActionBarProps = PickersActionBarProps & {
  onResetToDefault: () => void
  incomplete: boolean
}

function DateRangeActionBar(props: DateRangeActionBarProps) {
  const { className, onAccept, onCancel, onResetToDefault, incomplete } = props

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
      <Button size="small" onClick={onResetToDefault}>
        Clear
      </Button>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Button size="small" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="small" onClick={onAccept} disabled={incomplete}>
          OK
        </Button>
      </Box>
    </Box>
  )
}

export function DateRangePicker({
  value,
  onChange,
  useToday = false,
  disableFuture = false,
}: DateRangePickerProps) {
  const pickerValue = useMemo(() => toDayjsRange(value), [value])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <DesktopDateRangePicker
        value={pickerValue}
        onChange={(nextValue) => onChange(toDateRange(nextValue))}
        calendars={2}
        disableFuture={disableFuture}
        closeOnSelect={false}
        showDaysOutsideCurrentMonth
        fixedWeekNumber={6}
        format="DD.MM.YYYY"
        enableAccessibleFieldDOMStructure={false}
        slots={{
          field: DateRangeField as DesktopDateRangePickerSlots<Dayjs>['field'],
          actionBar: DateRangeActionBar as DesktopDateRangePickerSlots<Dayjs>['actionBar'],
          calendarHeader: RangeCalendarHeader,
        }}
        slotProps={{
          field: {
            useToday,
          } as DateRangeFieldProps,
          actionBar: {
            actions: ['clear', 'cancel', 'accept'],
            onResetToDefault: () =>
              onChange(useToday ? toDateRange(getDefaultDayjsRange()) : [null, null]),
            incomplete: pickerValue[0] == null || pickerValue[1] == null,
          } as DateRangeActionBarProps,
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
