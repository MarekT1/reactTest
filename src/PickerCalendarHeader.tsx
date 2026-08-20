import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Paper from '@mui/material/Paper'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo, useRef, useState } from 'react'
import { HeaderStepper } from './DatePickerHeaderStepper'

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

function isMonthAfterToday(date: Dayjs): boolean {
  const today = dayjs().startOf('month')
  return date.startOf('month').isAfter(today)
}

function clampLeftmostMonth(leftmost: Dayjs, calendars: number): Dayjs {
  const todayMonth = dayjs().startOf('month')
  const maxLeftmost = todayMonth.subtract(calendars - 1, 'month')
  return leftmost.isAfter(maxLeftmost) ? maxLeftmost : leftmost
}

export function PickerCalendarHeader({
  month,
  monthIndex = 0,
  calendars = 1,
  currentMonth,
  onMonthChange,
  className,
  labelId,
  disableFuture = false,
}: {
  month: Dayjs
  monthIndex?: number
  calendars?: number
  currentMonth: Dayjs
  onMonthChange: (date: Dayjs, direction: 'left' | 'right') => void
  className?: string
  labelId?: string
  disableFuture?: boolean
}) {
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
