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
import {
  getEnrollments,
  isMmEnrollmentEditable,
  isMmProductCode,
  mmEnrollmentsQueryKey,
  mmEnrollmentStatuses,
  mockLoyaltyNumberSample,
  patchMmEnrollment,
  resendMmEnrollment,
  sampleAccountId,
  sampleProductCode,
  setMockEnrollmentStatus,
  setMockLoyaltyNumber,
  type MmEnrollment,
  type MmEnrollmentStatus,
} from './mmEnrollmentApi'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type MmWidgetProps = {
  accountId?: string
  productCode?: string
}

type MmFormValues = {
  loyaltyNumber: string
  email: string
}

const loyaltyNumberRules: RegisterOptions<MmFormValues, 'loyaltyNumber'> = {
  validate: (value) => {
    const loyaltyNumber = value.trim()
    if (loyaltyNumber === '') {
      return 'M Number is required'
    }
    if (!/^\d+$/.test(loyaltyNumber)) {
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
  CANCELLED: 'Cancelled',
}

const fieldLabelSx = {
  display: 'block',
  mb: 0.5,
  fontWeight: 600,
  fontSize: '12px',
  lineHeight: '16px',
  color: 'text.primary',
} as const

const editableFieldSx = {
  '& .MuiOutlinedInput-root': {
    height: 40,
    fontSize: '14px',
    fontWeight: 500,
  },
  '& .MuiOutlinedInput-input': {
    height: '100%',
    boxSizing: 'border-box',
    padding: '0 8px',
    fontSize: '14px',
    fontWeight: 500,
  },
} as const

function StatusIcon({ status }: { status: MmEnrollmentStatus }) {
  switch (status) {
    case 'NEW':
      return <InfoOutlinedIcon sx={{ fontSize: 16 }} color="info" />
    case 'IN_PROGRESS':
      return <CircularProgress size={14} />
    case 'COMPLETED':
      return <CheckCircleOutlineIcon sx={{ fontSize: 16 }} color="success" />
    case 'CANCELLED':
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

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <Typography component="label" htmlFor={htmlFor} sx={fieldLabelSx}>
      {children}
    </Typography>
  )
}

function ReadOnlyValue({ label, value }: { label: string; value: string }) {
  return (
    <>
      <FieldLabel>{label}</FieldLabel>
      <Box
        sx={{
          height: 40,
          display: 'flex',
          alignItems: 'center',
          boxSizing: 'border-box',
          pl: '8px',
          pr: '8px',
          bgcolor: '#F9F9F9',
          color: '#999999',
          fontWeight: 500,
          fontSize: '14px',
          lineHeight: '40px',
          borderRadius: '4px',
          userSelect: 'none',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </Box>
    </>
  )
}

function ClearableField({
  id,
  label,
  errorText,
  registration,
  showClear,
  onClear,
  onFocus,
  onBlurField,
  inputMode,
}: {
  id: string
  label: string
  errorText?: string
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
        error={Boolean(errorText)}
        sx={editableFieldSx}
        slotProps={{
          input: {
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

function FieldMessage({ children }: { children?: string }) {
  return (
    <Box sx={{ height: 24, display: 'flex', alignItems: 'center' }}>
      {children ? (
        <Typography sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '16px', color: 'error.main' }}>
          {children}
        </Typography>
      ) : null}
    </Box>
  )
}

function MNumberNote() {
  return (
    <Box
      role="note"
      sx={{
        mt: 0,
        height: 24,
        width: 'fit-content',
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        boxSizing: 'border-box',
        gap: 0.5,
        px: '8px',
        border: 'none',
        borderTop: 'none',
        borderRadius: '4px',
        bgcolor: '#FFE0B2',
        color: '#E65100',
      }}
    >
      <WarningAmberIcon sx={{ fontSize: 14, color: '#F9A825' }} />
      <Typography sx={{ fontSize: '12px', fontWeight: 400, lineHeight: '16px' }}>
        This number cannot be edited after saving
      </Typography>
    </Box>
  )
}

function isChanged(values: MmFormValues, current: MmEnrollment) {
  return (
    values.loyaltyNumber.trim() !== current.loyaltyNumber || values.email.trim() !== current.mmEmail
  )
}

function withCurrent(choices: string[], current: string) {
  if (current !== '' && !choices.includes(current)) {
    return [...choices, current]
  }
  return choices
}

function loyaltyNumberChoices(current: string) {
  return withCurrent(['', mockLoyaltyNumberSample], current)
}

function enrollmentFormValues(enrollment: MmEnrollment): MmFormValues {
  return { loyaltyNumber: enrollment.loyaltyNumber, email: enrollment.mmEmail }
}

export function MmWidget({
  accountId: initialAccountId = sampleAccountId,
  productCode: initialProductCode = sampleProductCode,
}: MmWidgetProps) {
  const queryClient = useQueryClient()
  const [accountId, setAccountId] = useState(initialAccountId)
  const [productCode, setProductCode] = useState(initialProductCode)
  const isMmAccount = isMmProductCode(productCode)
  const enrollmentsQuery = useQuery({
    queryKey: [...mmEnrollmentsQueryKey, accountId],
    queryFn: () => getEnrollments(accountId),
    enabled: isMmAccount,
  })
  const enrollment = isMmAccount ? enrollmentsQuery.data : undefined
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
    defaultValues: { loyaltyNumber: '', email: '' },
    mode: 'onChange',
  })
  const loyaltyNumberValue = watch('loyaltyNumber')
  const emailValue = watch('email')

  const refreshEnrollment = () =>
    queryClient.invalidateQueries({ queryKey: [...mmEnrollmentsQueryKey, accountId] })

  useLayoutEffect(() => {
    if (!enrollment || editing) {
      return
    }
    reset(enrollmentFormValues(enrollment))
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
      payload: { loyaltyNumber: string; email: string }
    }) => patchMmEnrollment(enrollmentId, payload),
    onSuccess: async () => {
      setSaveError(null)
      setFocusedField(null)
      setEditing(false)
      await refreshEnrollment()
    },
  })

  const resendMutation = useMutation({
    mutationFn: resendMmEnrollment,
    onSuccess: async () => {
      setMailError(null)
      setMailMessage('Enrollment email sent.')
      await refreshEnrollment()
    },
  })

  const loyaltyNumberEmpty = enrollment ? enrollment.loyaltyNumber.trim() === '' : false
  const canSendMail = Boolean(
    enrollment && loyaltyNumberEmpty && isMmEnrollmentEditable(enrollment.status),
  )
  const changed = enrollment
    ? isChanged({ loyaltyNumber: loyaltyNumberValue, email: emailValue }, enrollment)
    : false
  const hasFieldErrors = Boolean(errors.loyaltyNumber || errors.email)
  const saveDisabled = !changed || hasFieldErrors || patchMutation.isPending

  const handleAccountId = (nextAccountId: string) => {
    setSaveError(null)
    setFocusedField(null)
    setEditing(false)
    setAccountId(nextAccountId)
  }

  const handleProductCode = (nextProductCode: string) => {
    setSaveError(null)
    setFocusedField(null)
    setEditing(false)
    setProductCode(nextProductCode)
  }

  const handlePreviewStatus = (status: MmEnrollmentStatus) => {
    setMockEnrollmentStatus(accountId, status)
    void refreshEnrollment()
  }

  const handlePreviewLoyaltyNumber = (loyaltyNumber: string) => {
    setMockLoyaltyNumber(accountId, loyaltyNumber)
    if (loyaltyNumber.trim() !== '') {
      setSaveError(null)
      setFocusedField(null)
      setEditing(false)
    }
    void refreshEnrollment()
  }

  const handleCancel = () => {
    if (!enrollment) {
      return
    }
    setSaveError(null)
    setFocusedField(null)
    reset(enrollmentFormValues(enrollment))
    setEditing(false)
  }

  const revertField = (field: keyof MmFormValues) => {
    if (!enrollment) {
      return
    }
    const value = field === 'email' ? enrollment.mmEmail : enrollment.loyaltyNumber
    setValue(field, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    })
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!enrollment || !isChanged(values, enrollment) || patchMutation.isPending) {
      return
    }
    setSaveError(null)
    try {
      await patchMutation.mutateAsync({
        enrollmentId: enrollment.id,
        payload: {
          loyaltyNumber: values.loyaltyNumber.trim(),
          email: values.email.trim(),
        },
      })
    } catch {
      setSaveError('Could not save the enrollment.')
    }
  })

  const handleSendMail = async () => {
    if (!enrollment || !canSendMail) {
      return
    }
    setMailMessage(null)
    setMailError(null)
    try {
      await resendMutation.mutateAsync(enrollment.id)
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
  } else if (enrollment && loyaltyNumberEmpty) {
    headerAction = (
      <Button type="button" variant="outlined" size="small" onClick={() => setEditing(true)}>
        Edit
      </Button>
    )
  }

  return (
    <Box sx={{ p: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" component="span">
            MM widget
          </Typography>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="mm-account-id-label" shrink>
              Account
            </InputLabel>
            <Select
              labelId="mm-account-id-label"
              label="Account"
              value={accountId}
              displayEmpty
              notched
              renderValue={(value) => (value === '' ? 'Empty' : value)}
              onChange={(event: SelectChangeEvent) => handleAccountId(event.target.value)}
            >
              {withCurrent(['', sampleAccountId], accountId).map((value) => (
                <MenuItem key={value || 'empty-account'} value={value}>
                  {value === '' ? 'Empty' : value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="mm-product-code-label" shrink>
              Product
            </InputLabel>
            <Select
              labelId="mm-product-code-label"
              label="Product"
              value={productCode}
              displayEmpty
              notched
              renderValue={(value) => (value === '' ? 'Empty' : value)}
              onChange={(event: SelectChangeEvent) => handleProductCode(event.target.value)}
            >
              {withCurrent(['', sampleProductCode], productCode).map((value) => (
                <MenuItem key={value || 'empty-product'} value={value}>
                  {value === '' ? 'Empty' : value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {enrollment ? (
            <>
              <FormControl size="small" sx={{ minWidth: 150 }}>
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
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="mm-test-m-number-label" shrink>
                  Test M Number
                </InputLabel>
                <Select
                  labelId="mm-test-m-number-label"
                  label="Test M Number"
                  value={enrollment.loyaltyNumber}
                  displayEmpty
                  notched
                  renderValue={(value) => (value === '' ? 'Empty' : value)}
                  onChange={(event: SelectChangeEvent) => handlePreviewLoyaltyNumber(event.target.value)}
                  disabled={patchMutation.isPending}
                >
                  {loyaltyNumberChoices(enrollment.loyaltyNumber).map((loyaltyNumber) => (
                    <MenuItem key={loyaltyNumber || 'empty'} value={loyaltyNumber}>
                      {loyaltyNumber === '' ? 'Empty' : loyaltyNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : null}
        </Box>
      </Box>
      {!isMmAccount ? (
        <Typography variant="body2">Account is not MM account</Typography>
      ) : null}
      {isMmAccount && enrollmentsQuery.isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <CircularProgress size={20} />
        </Box>
      ) : null}
      {isMmAccount && enrollmentsQuery.isError ? (
        <Typography variant="body2" color="error">
          Could not load the MM enrollment.
        </Typography>
      ) : null}
      {isMmAccount && enrollmentsQuery.isSuccess && !enrollment ? (
        <Typography variant="body2">No enrollment for this account.</Typography>
      ) : null}
      {enrollment ? (
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              mb: 2,
            }}
          >
            <StatusLine status={enrollment.status} />
            {headerAction}
          </Box>
          <Box component="form" id="mm-enrollment-form" noValidate onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid size={6} sx={{ minWidth: 0 }}>
                {editing ? (
                  <ClearableField
                    id="mm-m-number"
                    label="M Number"
                    errorText={errors.loyaltyNumber?.message}
                    registration={register('loyaltyNumber', loyaltyNumberRules)}
                    showClear={focusedField === 'loyaltyNumber'}
                    onClear={() => revertField('loyaltyNumber')}
                    onFocus={() => setFocusedField('loyaltyNumber')}
                    onBlurField={() =>
                      setFocusedField((current) => (current === 'loyaltyNumber' ? null : current))
                    }
                    inputMode="numeric"
                  />
                ) : (
                  <ReadOnlyValue label="M Number" value={enrollment.loyaltyNumber} />
                )}
                {editing && !errors.loyaltyNumber?.message ? (
                  <MNumberNote />
                ) : (
                  <FieldMessage>{editing ? errors.loyaltyNumber?.message : undefined}</FieldMessage>
                )}
              </Grid>
              <Grid size={8} sx={{ minWidth: 0 }}>
                {editing ? (
                  <ClearableField
                    id="mm-enrollment-email"
                    label="Enrollment email"
                    errorText={errors.email?.message}
                    registration={register('email', emailRules)}
                    showClear={focusedField === 'email'}
                    onClear={() => revertField('email')}
                    onFocus={() => setFocusedField('email')}
                    onBlurField={() =>
                      setFocusedField((current) => (current === 'email' ? null : current))
                    }
                  />
                ) : (
                  <ReadOnlyValue label="Enrollment email" value={enrollment.mmEmail} />
                )}
                <FieldMessage>{editing ? errors.email?.message : undefined}</FieldMessage>
              </Grid>
              <Grid size={4} sx={{ minWidth: 0 }}>
                <Box aria-hidden sx={{ ...fieldLabelSx, visibility: 'hidden' }}>
                  &nbsp;
                </Box>
                <Button
                  type="button"
                  variant="contained"
                  fullWidth
                  onClick={handleSendMail}
                  disabled={!canSendMail || resendMutation.isPending}
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
    </Box>
  )
}
