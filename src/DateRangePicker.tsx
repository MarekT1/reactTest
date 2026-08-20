import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import InputAdornment from '@mui/material/InputAdornment'
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
  useMemo,
  type ForwardRefExoticComponent,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react'
import { PickerActionBar } from './PickerActionBar'
import { PickerCalendarHeader } from './PickerCalendarHeader'
import { getDefaultDateRange } from './dateRange'

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

function RangeCalendarHeader(props: PickersRangeCalendarHeaderProps<Dayjs>) {
  return (
    <PickerCalendarHeader
      month={dayjs(props.month)}
      monthIndex={props.monthIndex}
      calendars={props.calendars}
      currentMonth={dayjs(props.currentMonth)}
      onMonthChange={props.onMonthChange}
      className={props.className}
      labelId={props.labelId}
      disableFuture={props.disableFuture}
    />
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
    <PickerActionBar
      className={className}
      onClear={onResetToDefault}
      onCancel={onCancel}
      onAccept={onAccept}
      acceptDisabled={incomplete}
    />
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
