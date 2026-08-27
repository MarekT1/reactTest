import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import type { InputBaseComponentProps } from '@mui/material/InputBase'
import TextField from '@mui/material/TextField'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import type { PickersActionBarProps } from '@mui/x-date-pickers/PickersActionBar'
import {
  DesktopDateRangePicker,
  type DesktopDateRangePickerSlots,
} from '@mui/x-date-pickers-pro/DesktopDateRangePicker'
import type { PickersRangeCalendarHeaderProps } from '@mui/x-date-pickers-pro/PickersRangeCalendarHeader'
import type { DateRange, RangePosition } from '@mui/x-date-pickers-pro/models'
import useForkRef from '@mui/utils/useForkRef'
import { LicenseInfo } from '@mui/x-license'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/en-gb'
import {
  forwardRef,
  useLayoutEffect,
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
import { PickerActionBar } from './PickerActionBar'
import { PickerCalendarHeader } from './PickerCalendarHeader'
import { getDefaultDateRange } from './dateRange'
import { PickerTheme, pickerPrimaryCssVars } from './pickerTheme'

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

function getRangeFieldParts(
  start: Dayjs | null,
  end: Dayjs | null,
  useToday: boolean,
) {
  const startText = start ? formatDotDate(start) : 'dd.mm.yyyy'
  const endText = end
    ? useToday && end.isSame(dayjs().startOf('day'), 'day')
      ? 'Today'
      : formatDotDate(end)
    : useToday
      ? 'Today'
      : 'dd.mm.yyyy'
  return {
    startText,
    endText,
    startEmpty: start == null,
    endEmpty: end == null,
  }
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
  focused?: boolean
  useToday?: boolean
  open?: boolean
  rangePosition?: RangePosition
  onRangePositionChange?: (position: RangePosition) => void
}

type DateRangeFieldComponent = ForwardRefExoticComponent<
  DateRangeFieldProps & RefAttributes<HTMLDivElement>
> & { fieldType: 'single-input' }

type RangeFieldInputExtraProps = {
  startText: string
  endText: string
  startEmpty: boolean
  endEmpty: boolean
  onRangePositionChange?: (position: RangePosition) => void
  startSpanRef: Ref<HTMLSpanElement>
  endSpanRef: Ref<HTMLSpanElement>
}

const RangeFieldInput = forwardRef<HTMLInputElement, InputBaseComponentProps>(
  function RangeFieldInputComponent(props, ref) {
    const {
      startText,
      endText,
      startEmpty,
      endEmpty,
      onRangePositionChange,
      startSpanRef,
      endSpanRef,
      className,
      ...other
    } = props as InputBaseComponentProps & RangeFieldInputExtraProps & {
      ownerState?: unknown
    }
    const inputProps = { ...other }
    delete inputProps.ownerState

    return (
      <Box
        className={className}
        sx={{
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          position: 'relative',
        }}
      >
        <Box
          component="span"
          ref={startSpanRef}
          onClick={() => onRangePositionChange?.('start')}
          sx={{ color: startEmpty ? 'text.disabled' : 'inherit' }}
        >
          {startText}
        </Box>
        <Box component="span" sx={{ px: 0.5 }}>
          -
        </Box>
        <Box
          component="span"
          ref={endSpanRef}
          onClick={() => onRangePositionChange?.('end')}
          sx={{ color: endEmpty ? 'text.disabled' : 'inherit' }}
        >
          {endText}
        </Box>
        <Box
          component="input"
          ref={ref}
          {...inputProps}
          aria-hidden
          tabIndex={-1}
          sx={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        />
      </Box>
    )
  },
)

const DateRangeField = forwardRef<HTMLDivElement, DateRangeFieldProps>(
  function DateRangeFieldComponent(props, ref) {
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
      focused,
      useToday = false,
      open = false,
      rangePosition = 'start',
      onRangePositionChange,
    } = props
    const [start, end] = value ?? [null, null]
    const { startText, endText, startEmpty, endEmpty } = getRangeFieldParts(
      start,
      end,
      useToday,
    )
    const inputBaseRef = useRef<HTMLDivElement>(null)
    const startRef = useRef<HTMLSpanElement>(null)
    const endRef = useRef<HTMLSpanElement>(null)
    const [activeBar, setActiveBar] = useState({ left: 0, width: 0 })
    const handleInputRef = useForkRef(InputProps?.ref, inputBaseRef)

    useLayoutEffect(() => {
      if (!open) {
        setActiveBar({ left: 0, width: 0 })
        return
      }
      const root = inputBaseRef.current
      const segment = rangePosition === 'start' ? startRef.current : endRef.current
      if (!root || !segment) {
        return
      }
      const rootRect = root.getBoundingClientRect()
      const segmentRect = segment.getBoundingClientRect()
      setActiveBar({
        left: segmentRect.left - rootRect.left,
        width: segmentRect.width,
      })
    }, [open, rangePosition, startText, endText])

    return (
      <TextField
        ref={ref}
        id={id}
        name={name}
        label={label}
        className={className}
        size="small"
        value={formatRangeLabel(start, end, useToday)}
        disabled={disabled}
        focused={focused}
        onClick={onClick}
        onKeyDown={onKeyDown}
        slotProps={{
          input: {
            ref: handleInputRef,
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: 0.75 }}>
                <CalendarMonthIcon sx={{ fontSize: 20, color: 'action.active' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <Box
                aria-hidden
                sx={{
                  display: open && activeBar.width > 0 ? 'block' : 'none',
                  position: 'absolute',
                  left: `${activeBar.left}px`,
                  width: `${activeBar.width}px`,
                  height: '2px',
                  bottom: '2px',
                  borderTopLeftRadius: '2px',
                  borderTopRightRadius: '2px',
                  bgcolor: 'primary.main',
                  pointerEvents: 'none',
                  transition: (theme) =>
                    theme.transitions.create(['left', 'width'], {
                      duration: theme.transitions.duration.shortest,
                    }),
                }}
              />
            ),
            inputComponent: RangeFieldInput,
            inputProps: {
              startText,
              endText,
              startEmpty,
              endEmpty,
              onRangePositionChange,
              startSpanRef: startRef,
              endSpanRef: endRef,
              'aria-label': 'Date range',
            } as RangeFieldInputExtraProps & { 'aria-label': string },
          },
        }}
        sx={{
          width: 250,
          '& .MuiInputBase-root': { cursor: 'pointer', position: 'relative' },
          '& .MuiInputAdornment-positionEnd': {
            position: 'static',
            m: 0,
            maxHeight: 'none',
            pointerEvents: 'none',
          },
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
      clearUnderEndPanel
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
  const [open, setOpen] = useState(false)
  const [rangePosition, setRangePosition] = useState<RangePosition>('start')

  return (
    <PickerTheme>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        <DesktopDateRangePicker
          value={pickerValue}
          onChange={(nextValue) => onChange(toDateRange(nextValue))}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => {
            setOpen(false)
            setRangePosition('start')
          }}
          rangePosition={rangePosition}
          onRangePositionChange={setRangePosition}
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
              open,
              rangePosition,
              onRangePositionChange: setRangePosition,
            } as DateRangeFieldProps,
            actionBar: {
              actions: ['clear', 'cancel', 'accept'],
              onResetToDefault: () => {
                onChange(useToday ? toDateRange(getDefaultDayjsRange()) : [null, null])
                setRangePosition('start')
              },
              incomplete: pickerValue[0] == null || pickerValue[1] == null,
            } as DateRangeActionBarProps,
            popper: {
              placement: 'bottom-start',
              sx: pickerPrimaryCssVars,
            },
            desktopPaper: {
              elevation: 0,
              sx: {
                ...pickerPrimaryCssVars,
                borderRadius: '8px',
                border: '1px solid #ccc',
                boxShadow: '0px 5px 5px -3px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                '& .MuiDayCalendar-weekDayLabel': {
                  color: '#999999',
                  fontWeight: 500,
                },
                '& .MuiPickersDay-root:not(.Mui-selected):not(.Mui-disabled):not(.MuiPickersDay-dayOutsideMonth)':
                  {
                    color: '#333333',
                  },
              },
            },
          }}
          sx={{
            ...pickerPrimaryCssVars,
            '& .MuiDateRangeCalendar-monthContainer': {
              overflow: 'hidden',
              position: 'relative',
            },
            '& .MuiDayCalendar-header': {
              mt: 0,
              pt: 0,
            },
          }}
        />
      </LocalizationProvider>
    </PickerTheme>
  )
}
