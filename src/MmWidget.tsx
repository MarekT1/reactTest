import CancelIcon from '@mui/icons-material/Cancel'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useState, type FocusEvent, type ReactNode } from 'react'
import { useForm, type RegisterOptions, type UseFormRegisterReturn } from 'react-hook-form'
import { InfoCard } from './InfoCard'
import {
  getMmEnrollment,
  isMmEnrollmentEditable,
  mmEnrollmentQueryKey,
  mmEnrollmentStatuses,
  patchMmEnrollment,
  resendMmEnrollment,
  setMockMmEnrollmentStatus,
  type MmEnrollment,
  type MmEnrollmentStatus,
} from './mmEnrollmentApi'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type MmFormValues = {
  mNumber: string
  email: string
}

const mNumberRules: RegisterOptions<MmFormValues, 'mNumber'> = {
  validate: (value) => {
    const mNumber = value.trim()
    if (mNumber === '') {
      return 'M Number is required'
    }
    if (!/^\d+$/.test(mNumber)) {
      return 'M Number must be a number'
    }
    return true
  },
}

const emailRules: RegisterOptions<MmFormValues, 'email'> = {
  validate: (value) => {
    const email = value.trim()
    if (email === '') {
      return 'Enrollment email is required'
    }
    if (!emailPattern.test(email)) {
      return 'Enter a valid email'
    }
    return true
  },
}

const statusLabels: Record<MmEnrollmentStatus, string> = {
  NEW: 'New enrollment',
  IN_PROGRESS: 'Processing new change',
  COMPLETED: 'Completed',
  CANCELED: 'Canceled',
}

function StatusIcon({ status }: { status: MmEnrollmentStatus }) {
  switch (status) {
    case 'NEW':
      return <InfoOutlinedIcon sx={{ fontSize: 16 }} color="info" />
    case 'IN_PROGRESS':
      return <CircularProgress size={14} />
    case 'COMPLETED':
      return <CheckCircleOutlineIcon sx={{ fontSize: 16 }} color="success" />
    case 'CANCELED':
      return <CancelOutlinedIcon sx={{ fontSize: 16 }} color="error" />
  }
}

function StatusLine({ status }: { status: MmEnrollmentStatus }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      <Box sx={{ display: 'flex', flexShrink: 0 }} aria-hidden>
        <StatusIcon status={status} />
      </Box>
      <Typography variant="caption" color="text.secondary">
        {statusLabels[status]}
      </Typography>
    </Box>
  )
}

const fieldLabelSx = {
  display: 'block',
  mb: 0.5,
  fontSize: '0.8125rem',
  lineHeight: '18px',
  color: 'text.secondary',
} as const

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <Typography component="label" htmlFor={htmlFor} sx={fieldLabelSx}>
      {children}
    </Typography>
  )
}

function ClearableField({
  id,
  label,
  readOnly,
  errorText,
  showError,
  registration,
  showClear,
  onClear,
  onFocus,
  onBlurField,
  inputMode,
}: {
  id: string
  label: string
  readOnly: boolean
  errorText?: string
  showError: boolean
  registration: UseFormRegisterReturn
  showClear: boolean
  onClear: () => void
  onFocus: () => void
  onBlurField: () => void
  inputMode?: 'numeric'
}) {
  const { onBlur, ref, ...field } = registration
  return (
    <>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <TextField
        {...field}
        id={id}
        inputRef={ref}
        size="small"
        fullWidth
        error={showError && Boolean(errorText)}
        helperText={showError ? errorText : undefined}
        slotProps={{
          input: {
            readOnly,
            endAdornment: showClear ? (
              <InputAdornment position="end">
                <IconButton
                  type="button"
                  aria-label={`Cancel ${label} edit`}
                  size="small"
                  edge="end"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onClear}
                >
                  <CancelIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
          htmlInput: {
            inputMode,
            onFocus,
            onBlur: (event: FocusEvent<HTMLInputElement>) => {
              void onBlur(event)
              onBlurField()
            },
          },
        }}
      />
    </>
  )
}

function MNumberNote() {
  return (
    <Box
      role="note"
      sx={{
        mt: 1,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.75,
        px: 1,
        py: 0.75,
        borderRadius: 1,
        bgcolor: '#FFE0B2',
        color: '#E65100',
      }}
    >
      <WarningAmberIcon sx={{ fontSize: 18, color: '#F9A825', mt: '1px' }} />
      <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
        This number cannot be edited after saving
      </Typography>
    </Box>
  )
}

function isChanged(values: MmFormValues, current: MmEnrollment) {
  const mNumberChanged = !current.mNumberLocked && values.mNumber.trim() !== current.mNumber
  const emailChanged = values.email.trim() !== current.email
  return mNumberChanged || emailChanged
}

export function MmWidget() {
  const queryClient = useQueryClient()
  const enrollmentQuery = useQuery({
    queryKey: mmEnrollmentQueryKey,
    queryFn: getMmEnrollment,
  })
  const enrollment = enrollmentQuery.data
  const [editing, setEditing] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [mailMessage, setMailMessage] = useState<string | null>(null)
  const [mailError, setMailError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<keyof MmFormValues | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MmFormValues>({
    defaultValues: { mNumber: '', email: '' },
    mode: 'onChange',
  })
  const mNumberValue = watch('mNumber')
  const emailValue = watch('email')

  useLayoutEffect(() => {
    if (!enrollment || editing) {
      return
    }
    reset({ mNumber: enrollment.mNumber, email: enrollment.email })
  }, [enrollment, editing, reset])

  useEffect(() => {
    if (!mailMessage) {
      return
    }
    const timer = window.setTimeout(() => setMailMessage(null), 3000)
    return () => window.clearTimeout(timer)
  }, [mailMessage])

  const patchMutation = useMutation({
    mutationFn: ({
      enrollmentId,
      payload,
    }: {
      enrollmentId: string
      payload: { programName: string; mNumber: string; email: string }
    }) => patchMmEnrollment(enrollmentId, payload),
    onSuccess: (next) => {
      queryClient.setQueryData(mmEnrollmentQueryKey, next)
      setSaveError(null)
      setEditing(false)
    },
  })

  const resendMutation = useMutation({
    mutationFn: resendMmEnrollment,
    onSuccess: () => {
      setMailError(null)
      setMailMessage('Enrollment email sent.')
    },
  })

  const canEdit = enrollment ? isMmEnrollmentEditable(enrollment.status) : false
  const mNumberReadOnly = !editing || Boolean(enrollment?.mNumberLocked)
  const emailReadOnly = !editing
  const changed = enrollment
    ? isChanged({ mNumber: mNumberValue, email: emailValue }, enrollment)
    : false
  const hasFieldErrors = Boolean(errors.mNumber || errors.email)
  const saveDisabled = !changed || hasFieldErrors || patchMutation.isPending

  const handlePreviewStatus = (status: MmEnrollmentStatus) => {
    const next = setMockMmEnrollmentStatus(status)
    queryClient.setQueryData(mmEnrollmentQueryKey, next)
    if (!isMmEnrollmentEditable(status)) {
      setSaveError(null)
      setEditing(false)
      reset({ mNumber: next.mNumber, email: next.email })
    }
  }

  const handleCancel = () => {
    if (!enrollment) {
      return
    }
    setSaveError(null)
    setFocusedField(null)
    reset({ mNumber: enrollment.mNumber, email: enrollment.email })
    setEditing(false)
  }

  const revertField = (field: keyof MmFormValues) => {
    if (!enrollment) {
      return
    }
    setValue(field, enrollment[field], { shouldValidate: true, shouldDirty: true, shouldTouch: true })
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!enrollment || !isChanged(values, enrollment) || patchMutation.isPending) {
      return
    }
    setSaveError(null)
    try {
      await patchMutation.mutateAsync({
        enrollmentId: enrollment.enrollmentId,
        payload: {
          programName: enrollment.programName,
          mNumber: enrollment.mNumberLocked ? enrollment.mNumber : values.mNumber.trim(),
          email: values.email.trim(),
        },
      })
    } catch {
      setSaveError('Could not save the enrollment.')
    }
  })

  const handleSendMail = async () => {
    if (!enrollment) {
      return
    }
    setMailMessage(null)
    setMailError(null)
    try {
      await resendMutation.mutateAsync(enrollment.enrollmentId)
    } catch {
      setMailError('Could not send the enrollment email.')
    }
  }

  let headerAction: ReactNode = null
  if (enrollment && editing) {
    headerAction = (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          type="button"
          variant="outlined"
          size="small"
          onClick={handleCancel}
          disabled={patchMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="mm-enrollment-form"
          variant="contained"
          color="success"
          size="small"
          disabled={saveDisabled}
        >
          Save
        </Button>
      </Box>
    )
  } else if (enrollment && canEdit) {
    headerAction = (
      <Button type="button" variant="outlined" size="small" onClick={() => setEditing(true)}>
        Edit
      </Button>
    )
  }

  const title = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexWrap: 'wrap' }}>
      <Typography variant="subtitle2" component="span">
        MM widget
      </Typography>
      {enrollment ? (
        <FormControl size="small" sx={{ minWidth: 150, mt: 0.5 }}>
          <InputLabel id="mm-test-status-label">Test status</InputLabel>
          <Select
            labelId="mm-test-status-label"
            label="Test status"
            value={enrollment.status}
            onChange={(event: SelectChangeEvent) =>
              handlePreviewStatus(event.target.value as MmEnrollmentStatus)
            }
            disabled={patchMutation.isPending}
          >
            {mmEnrollmentStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
    </Box>
  )

  return (
    <InfoCard title={title} action={headerAction}>
      {enrollmentQuery.isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <CircularProgress size={20} />
        </Box>
      ) : null}
      {enrollmentQuery.isError ? (
        <Typography variant="body2" color="error">
          Could not load the MM enrollment.
        </Typography>
      ) : null}
      {enrollment ? (
        <Box>
          <Box sx={{ mb: 2 }}>
            <StatusLine status={enrollment.status} />
          </Box>
          <Box component="form" id="mm-enrollment-form" noValidate onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid size={6} sx={{ minWidth: 0 }}>
                <FieldLabel htmlFor="mm-program-name">Program name</FieldLabel>
                <TextField
                  id="mm-program-name"
                  value={enrollment.programName}
                  size="small"
                  fullWidth
                  slotProps={{
                    input: { readOnly: true },
                  }}
                />
              </Grid>
              <Grid size={6} sx={{ minWidth: 0 }}>
                <ClearableField
                  id="mm-m-number"
                  label="M Number"
                  readOnly={mNumberReadOnly}
                  errorText={errors.mNumber?.message}
                  showError={editing && !mNumberReadOnly}
                  registration={register('mNumber', mNumberRules)}
                  showClear={editing && !mNumberReadOnly && focusedField === 'mNumber'}
                  onClear={() => revertField('mNumber')}
                  onFocus={() => setFocusedField('mNumber')}
                  onBlurField={() =>
                    setFocusedField((current) => (current === 'mNumber' ? null : current))
                  }
                  inputMode="numeric"
                />
                <MNumberNote />
              </Grid>
              <Grid size={8} sx={{ minWidth: 0 }}>
                <ClearableField
                  id="mm-enrollment-email"
                  label="Enrollment email"
                  readOnly={emailReadOnly}
                  errorText={errors.email?.message}
                  showError={editing}
                  registration={register('email', emailRules)}
                  showClear={editing && focusedField === 'email'}
                  onClear={() => revertField('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlurField={() =>
                    setFocusedField((current) => (current === 'email' ? null : current))
                  }
                />
              </Grid>
              <Grid size={4} sx={{ minWidth: 0 }}>
                <Typography aria-hidden sx={{ ...fieldLabelSx, visibility: 'hidden' }}>
                  &nbsp;
                </Typography>
                <Button
                  type="button"
                  variant="contained"
                  fullWidth
                  onClick={handleSendMail}
                  disabled={resendMutation.isPending}
                  sx={{ height: 40, whiteSpace: 'nowrap', px: 1 }}
                >
                  {resendMutation.isPending ? 'Sending…' : 'Send mail'}
                </Button>
              </Grid>
            </Grid>
          </Box>
          {saveError ? (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              {saveError}
            </Typography>
          ) : null}
          {mailError ? (
            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
              {mailError}
            </Typography>
          ) : null}
          {mailMessage ? (
            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
              {mailMessage}
            </Typography>
          ) : null}
        </Box>
      ) : null}
    </InfoCard>
  )
}
