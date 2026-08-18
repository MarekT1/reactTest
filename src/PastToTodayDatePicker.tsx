import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Grow from '@mui/material/Grow'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Popper from '@mui/material/Popper'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { useEffect, useMemo, useRef, useState } from 'react'

type PickerView = 'day' | 'month' | 'year'

type PastToTodayDatePickerProps = {
  value: Date | null
  onChange: (value: Date | null) => void
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const
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
const DAY_CELL_SIZE = 40
const DAY_BUTTON_SIZE = 36

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getToday(): Date {
  return startOfDay(new Date())
}

function formatDotDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  return `${dd}.${mm}.${date.getFullYear()}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function toDayNumber(date: Date): number {
  return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate()
}

function isAfterMonth(year: number, month: number, today: Date): boolean {
  return (
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth())
  )
}

function clampViewMonth(year: number, month: number, today: Date): Date {
  if (isAfterMonth(year, month, today)) {
    return new Date(today.getFullYear(), today.getMonth(), 1)
  }
  return new Date(year, month, 1)
}

function getMondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7
}

function getCalendarDays(viewDate: Date): Date[] {
  const firstOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const mondayOffset = getMondayFirstWeekday(firstOfMonth)
  const start = new Date(
    firstOfMonth.getFullYear(),
    firstOfMonth.getMonth(),
    1 - mondayOffset,
  )

  return Array.from({ length: 42 }, (_, index) => {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
  })
}

function HeaderStepper({
  label,
  listOpen,
  prevDisabled,
  nextDisabled,
  prevAriaLabel,
  nextAriaLabel,
  onPrev,
  onNext,
  onToggleList,
}: {
  label: string
  listOpen: boolean
  prevDisabled?: boolean
  nextDisabled?: boolean
  prevAriaLabel: string
  nextAriaLabel: string
  onPrev: () => void
  onNext: () => void
  onToggleList: () => void
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
      <IconButton
        size="small"
        aria-label={prevAriaLabel}
        onClick={onPrev}
        disabled={prevDisabled}
        sx={{ p: 0.25 }}
      >
        <ChevronLeftIcon fontSize="small" />
      </IconButton>
      <Button
        size="small"
        onClick={onToggleList}
        aria-haspopup="listbox"
        aria-expanded={listOpen}
        endIcon={
          <ArrowDropDownIcon
            sx={{
              ml: -0.5,
              fontSize: 20,
              transform: listOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 200ms',
            }}
          />
        }
        sx={{
          minWidth: 0,
          px: 0.5,
          textTransform: 'none',
          color: 'text.primary',
          fontWeight: 500,
          fontSize: 14,
          lineHeight: 1.2,
        }}
      >
        {label}
      </Button>
      <IconButton
        size="small"
        aria-label={nextAriaLabel}
        onClick={onNext}
        disabled={nextDisabled}
        sx={{ p: 0.25 }}
      >
        <ChevronRightIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}

export function PastToTodayDatePicker({ value, onChange }: PastToTodayDatePickerProps) {
  const theme = useTheme()
  const today = getToday()
  const anchorRef = useRef<HTMLDivElement>(null)
  const yearListRef = useRef<HTMLDivElement>(null)
  const selectedYearRef = useRef<HTMLButtonElement>(null)

  const [open, setOpen] = useState(false)
  const [pickerView, setPickerView] = useState<PickerView>('day')
  const [draftDate, setDraftDate] = useState<Date | null>(value)
  const [viewDate, setViewDate] = useState(() =>
    value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date(today.getFullYear(), today.getMonth(), 1),
  )

  const currentYear = today.getFullYear()
  const years = useMemo(
    () => Array.from({ length: YEAR_RANGE + 1 }, (_, index) => currentYear - YEAR_RANGE + index),
    [currentYear],
  )

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate])
  const rangeStart = draftDate ? startOfDay(draftDate) : null
  const highlightColor = alpha(theme.palette.primary.main, 0.12)

  useEffect(() => {
    if (pickerView !== 'year') {
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
  }, [pickerView, viewDate])

  useEffect(() => {
    if (!open) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        setPickerView('day')
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const openPicker = () => {
    setDraftDate(value)
    setViewDate(
      value
        ? new Date(value.getFullYear(), value.getMonth(), 1)
        : new Date(today.getFullYear(), today.getMonth(), 1),
    )
    setPickerView('day')
    setOpen(true)
  }

  const closeWithoutCommit = () => {
    setOpen(false)
    setPickerView('day')
  }

  const handleFieldClick = () => {
    if (open) {
      closeWithoutCommit()
      return
    }
    openPicker()
  }

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    if (anchorRef.current?.contains(event.target as Node)) {
      return
    }
    closeWithoutCommit()
  }

  const goToMonth = (year: number, month: number, nextView: PickerView = 'day') => {
    setViewDate(clampViewMonth(year, month, today))
    setPickerView(nextView)
  }

  const handlePrevMonth = () => {
    goToMonth(viewDate.getFullYear(), viewDate.getMonth() - 1)
  }

  const handleNextMonth = () => {
    goToMonth(viewDate.getFullYear(), viewDate.getMonth() + 1)
  }

  const handlePrevYear = () => {
    goToMonth(viewDate.getFullYear() - 1, viewDate.getMonth())
  }

  const handleNextYear = () => {
    goToMonth(viewDate.getFullYear() + 1, viewDate.getMonth())
  }

  const handleSelectDay = (date: Date) => {
    if (toDayNumber(date) > toDayNumber(today)) {
      return
    }
    const selected = startOfDay(date)
    setDraftDate(selected)
    setViewDate(new Date(selected.getFullYear(), selected.getMonth(), 1))
    setPickerView('day')
  }

  const handleClear = () => {
    setDraftDate(null)
    setPickerView('day')
  }

  const handleCancel = () => {
    closeWithoutCommit()
  }

  const handleOk = () => {
    onChange(draftDate)
    closeWithoutCommit()
  }

  const nextMonthDisabled = isAfterMonth(
    viewDate.getMonth() === 11 ? viewDate.getFullYear() + 1 : viewDate.getFullYear(),
    viewDate.getMonth() === 11 ? 0 : viewDate.getMonth() + 1,
    today,
  )
  const nextYearDisabled = viewDate.getFullYear() >= today.getFullYear()
  const fieldValue = value ? `${formatDotDate(value)} - Today` : ''

  return (
    <>
      <Box ref={anchorRef} sx={{ display: 'inline-flex' }}>
        <TextField
          size="small"
          value={fieldValue}
          placeholder="dd.mm.yyyy - Today"
          onClick={handleFieldClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleFieldClick()
            }
          }}
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
              'aria-label': 'Date range from selected date to today',
            },
          }}
          sx={{
            width: 230,
            '& .MuiInputBase-root': { cursor: 'pointer' },
          }}
        />
      </Box>

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        sx={{ zIndex: theme.zIndex.modal }}
        modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'top left' }}>
            <div>
              <ClickAwayListener onClickAway={handleClickAway}>
                <Paper elevation={8} sx={{ width: 328, overflow: 'hidden' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 0.5,
                  pt: 1,
                  pb: 0.5,
                }}
              >
                <HeaderStepper
                  label={MONTH_LABELS[viewDate.getMonth()]}
                  listOpen={pickerView === 'month'}
                  nextDisabled={nextMonthDisabled}
                  prevAriaLabel="Previous month"
                  nextAriaLabel="Next month"
                  onPrev={handlePrevMonth}
                  onNext={handleNextMonth}
                  onToggleList={() =>
                    setPickerView((current) => (current === 'month' ? 'day' : 'month'))
                  }
                />
                <HeaderStepper
                  label={String(viewDate.getFullYear())}
                  listOpen={pickerView === 'year'}
                  nextDisabled={nextYearDisabled}
                  prevAriaLabel="Previous year"
                  nextAriaLabel="Next year"
                  onPrev={handlePrevYear}
                  onNext={handleNextYear}
                  onToggleList={() =>
                    setPickerView((current) => (current === 'year' ? 'day' : 'year'))
                  }
                />
              </Box>

              {pickerView === 'day' && (
                <Box sx={{ px: 1.5, pb: 0.5 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      mb: 0.5,
                    }}
                  >
                    {WEEKDAY_LABELS.map((label) => (
                      <Typography
                        key={label}
                        variant="caption"
                        align="center"
                        sx={{
                          color: 'text.secondary',
                          fontWeight: 500,
                          lineHeight: `${DAY_CELL_SIZE}px`,
                          height: DAY_CELL_SIZE - 8,
                        }}
                      >
                        {label}
                      </Typography>
                    ))}
                  </Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                    }}
                  >
                    {calendarDays.map((date) => {
                      const inCurrentMonth = date.getMonth() === viewDate.getMonth()
                      const isFuture = toDayNumber(date) > toDayNumber(today)
                      const isStart = rangeStart != null && isSameDay(date, rangeStart)
                      const isEnd = rangeStart != null && isSameDay(date, today)
                      const inRange =
                        rangeStart != null &&
                        toDayNumber(date) >= toDayNumber(rangeStart) &&
                        toDayNumber(date) <= toDayNumber(today)
                      const isSingleDayRange = isStart && isEnd
                      const weekdayIndex = getMondayFirstWeekday(date)
                      const isMonday = weekdayIndex === 0
                      const isSunday = weekdayIndex === 6
                      const isTodayDate = isSameDay(date, today)

                      let highlightSx = {}
                      if (inRange && !isSingleDayRange) {
                        if (isStart) {
                          highlightSx = {
                            left: '50%',
                            right: 0,
                            borderRadius: isSunday ? '0 20px 20px 0' : 0,
                          }
                        } else if (isEnd) {
                          highlightSx = {
                            left: 0,
                            right: '50%',
                            borderRadius: isMonday ? '20px 0 0 20px' : 0,
                          }
                        } else {
                          highlightSx = {
                            left: 0,
                            right: 0,
                            borderTopLeftRadius: isMonday ? '20px' : 0,
                            borderBottomLeftRadius: isMonday ? '20px' : 0,
                            borderTopRightRadius: isSunday ? '20px' : 0,
                            borderBottomRightRadius: isSunday ? '20px' : 0,
                          }
                        }
                      }

                      return (
                        <Box
                          key={date.toISOString()}
                          sx={{
                            position: 'relative',
                            width: DAY_CELL_SIZE,
                            height: DAY_CELL_SIZE,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            justifySelf: 'center',
                          }}
                        >
                          {inRange && !isSingleDayRange && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 2,
                                bottom: 2,
                                bgcolor: highlightColor,
                                ...highlightSx,
                              }}
                            />
                          )}
                          <IconButton
                            size="small"
                            disabled={isFuture}
                            onClick={() => handleSelectDay(date)}
                            aria-label={formatDotDate(date)}
                            aria-pressed={isStart || isEnd}
                            sx={{
                              position: 'relative',
                              zIndex: 1,
                              width: DAY_BUTTON_SIZE,
                              height: DAY_BUTTON_SIZE,
                              fontSize: 14,
                              fontWeight: isStart || isEnd ? 600 : 400,
                              color: isStart || isEnd
                                ? 'primary.contrastText'
                                : isFuture
                                  ? 'text.disabled'
                                  : inCurrentMonth
                                    ? 'text.primary'
                                    : 'text.secondary',
                              bgcolor: isStart || isEnd ? 'primary.main' : 'transparent',
                              outline:
                                isTodayDate && !isStart && !isEnd
                                  ? `1px solid ${theme.palette.primary.main}`
                                  : 'none',
                              '&:hover': {
                                bgcolor:
                                  isStart || isEnd
                                    ? 'primary.dark'
                                    : alpha(theme.palette.primary.main, 0.08),
                              },
                              '&.Mui-disabled': {
                                color: 'text.disabled',
                              },
                            }}
                          >
                            {date.getDate()}
                          </IconButton>
                        </Box>
                      )
                    })}
                  </Box>
                </Box>
              )}

              {pickerView === 'month' && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    height: DAY_CELL_SIZE * 7,
                    boxSizing: 'border-box',
                  }}
                >
                  {MONTH_SHORT_LABELS.map((label, monthIndex) => {
                    const disabled = isAfterMonth(viewDate.getFullYear(), monthIndex, today)
                    const selected = viewDate.getMonth() === monthIndex
                    return (
                      <Button
                        key={label}
                        disabled={disabled}
                        variant={selected ? 'contained' : 'text'}
                        onClick={() => goToMonth(viewDate.getFullYear(), monthIndex)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 4,
                          height: 40,
                        }}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </Box>
              )}

              {pickerView === 'year' && (
                <Box
                  ref={yearListRef}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                    px: 2,
                    py: 1.5,
                    height: DAY_CELL_SIZE * 7,
                    boxSizing: 'border-box',
                    overflowY: 'auto',
                  }}
                >
                  {years.map((year) => {
                    const selected = viewDate.getFullYear() === year
                    return (
                      <Button
                        key={year}
                        ref={selected ? selectedYearRef : undefined}
                        variant={selected ? 'contained' : 'text'}
                        onClick={() => goToMonth(year, viewDate.getMonth())}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 4,
                          height: 40,
                          minWidth: 0,
                        }}
                      >
                        {year}
                      </Button>
                    )
                  })}
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1,
                  py: 0.75,
                }}
              >
                <Button size="small" onClick={handleClear}>
                  Clear
                </Button>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button size="small" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button size="small" onClick={handleOk}>
                    OK
                  </Button>
                </Box>
              </Box>
                </Paper>
              </ClickAwayListener>
            </div>
          </Grow>
        )}
      </Popper>
    </>
  )
}
