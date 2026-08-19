import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import type { Ref } from 'react'

export function HeaderStepper({
  label,
  listOpen,
  prevDisabled,
  nextDisabled,
  prevAriaLabel,
  nextAriaLabel,
  labelRef,
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
  labelRef?: Ref<HTMLButtonElement>
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
        ref={labelRef}
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
