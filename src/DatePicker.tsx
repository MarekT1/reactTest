import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker'
import type { DesktopDatePickerSlots } from '@mui/x-date-pickers/DesktopDatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import type { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar'
import type { PickersCalendarHeaderProps } from '@mui/x-date-pickers/PickersCalendarHeader'
import useForkRef from '@mui/utils/useForkRef'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/en-gb'
import {
  forwardRef,
  useMemo,
  useState,
  type ForwardRefExoticComponent,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
  type RefAttributes,
} from 'react'
import { PickerActionBar } from './PickerActionBar'
import { PickerCalendarHeader } from './PickerCalendarHeader'

export type DatePickerProps = {
  value: Date | null
  onChange: (value: Date | null) => void
  /** Block dates after today and stop month/year navigation in the future. */
  disableFuture?: boolean
}

function DateCalendarHeader(props: PickersCalendarHeaderProps<Dayjs>) {
  const current = dayjs(props.currentMonth)
  return (
    <PickerCalendarHeader
      month={current}
      currentMonth={current}
      onMonthChange={props.onMonthChange}
      className={props.className}
      labelId={props.labelId}
      disableFuture={props.disableFuture}
    />
  )
}

type DateFieldProps = {
  value?: Dayjs | null
  disabled?: boolean
  InputProps?: { ref?: Ref<HTMLDivElement> }
  id?: string
  name?: string
  label?: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLElement>
  onKeyDown?: KeyboardEventHandler<HTMLElement>
}

type DateFieldComponent = ForwardRefExoticComponent<
  DateFieldProps & RefAttributes<HTMLDivElement>
>

const DateField = forwardRef<HTMLDivElement, DateFieldProps>(function DateField(props, ref) {
  const { value, disabled, InputProps, id, name, label, className, onClick, onKeyDown } = props
  const handleRef = useForkRef(ref, InputProps?.ref)

  return (
    <TextField
      ref={handleRef}
      id={id}
      name={name}
      label={label}
      className={className}
      size="small"
      value={value ? value.format('DD.MM.YYYY') : ''}
      placeholder="dd.mm.yyyy"
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
          'aria-label': 'Date',
        },
      }}
      sx={{
        width: 170,
        '& .MuiInputBase-root': { cursor: 'pointer' },
      }}
    />
  )
}) as DateFieldComponent

function DateActionBar(props: PickersActionBarProps) {
  const { className, onAccept, onCancel, onClear } = props
  return (
    <PickerActionBar
      className={className}
      onClear={onClear}
      onCancel={onCancel}
      onAccept={onAccept}
    />
  )
}

export function DatePicker({ value, onChange, disableFuture = false }: DatePickerProps) {
  const pickerValue = useMemo(() => (value ? dayjs(value) : null), [value])
  const [open, setOpen] = useState(false)

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <DesktopDatePicker
        value={pickerValue}
        onChange={(nextValue) => onChange(nextValue ? nextValue.toDate() : null)}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        disableOpenPicker
        disableFuture={disableFuture}
        closeOnSelect={false}
        showDaysOutsideCurrentMonth
        fixedWeekNumber={6}
        views={['day']}
        openTo="day"
        format="DD.MM.YYYY"
        enableAccessibleFieldDOMStructure={false}
        slots={{
          field: DateField as DesktopDatePickerSlots<Dayjs>['field'],
          actionBar: DateActionBar,
          calendarHeader: DateCalendarHeader,
        }}
        slotProps={{
          field: {
            onClick: () => setOpen((isOpen) => !isOpen),
          } as DateFieldProps,
          actionBar: {
            actions: ['clear', 'cancel', 'accept'],
          },
          popper: {
            placement: 'bottom-start',
          },
        }}
        sx={{
          '& .MuiDateCalendar-root': {
            overflow: 'visible',
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
