import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { useForm } from 'react-hook-form'
import { customerEmailQueryKey, getCustomerEmail, janeDoeCustomerId, putCustomerEmail } from './emailApi'
import { InfoCard } from './InfoCard'
import { Form } from './ui/form'
import { FormInput } from './ui/FormInput'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type EmailFormValues = {
  email: string
}

export type EmailGadgetProps = {
  customerId?: string
}

function keepFieldFocused(event: MouseEvent<HTMLButtonElement>) {
  event.preventDefault()
}

function EmailForm({ customerId, email }: { customerId: string; email: string }) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const fieldAnchorRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [iconFrame, setIconFrame] = useState<{ top: number; height: number } | null>(null)
  const form = useForm<EmailFormValues>({ defaultValues: { email } })
  const draft = form.watch('email')
  const saveMutation = useMutation({
    mutationFn: (nextEmail: string) => putCustomerEmail(customerId, nextEmail),
    onSuccess: (saved) => {
      queryClient.setQueryData(customerEmailQueryKey(customerId), saved)
    },
  })

  useEffect(() => {
    form.clearErrors('email')
  }, [draft, form])

  useLayoutEffect(() => {
    const input = inputRef.current
    const anchor = fieldAnchorRef.current
    if (!focused || !input || !anchor) {
      return
    }
    const inputRect = input.getBoundingClientRect()
    const anchorRect = anchor.getBoundingClientRect()
    const top = inputRect.top - anchorRect.top
    const height = inputRect.height
    setIconFrame((current) =>
      current?.top === top && current.height === height ? current : { top, height },
    )
  }, [focused, draft, saveMutation.isPending])

  const cancel = () => {
    form.reset({ email })
    setFocused(false)
    inputRef.current?.blur()
  }

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextEmail = form.getValues('email').trim()
    if (!emailPattern.test(nextEmail)) {
      form.setError('email', { type: 'validate', message: 'Enter a valid email' })
      return
    }
    form.clearErrors('email')
    try {
      const saved = await saveMutation.mutateAsync(nextEmail)
      form.reset({ email: saved.email })
      setFocused(false)
      inputRef.current?.blur()
    } catch {
      form.setError('email', { type: 'server', message: 'Could not save the email.' })
    }
  }

  return (
    <Form {...form}>
      <Box component="form" noValidate onSubmit={send}>
        <Box ref={fieldAnchorRef} sx={{ position: 'relative' }}>
          <FormInput
            ref={inputRef}
            name="email"
            label="Email"
            type="email"
            autoComplete="email"
            disabled={saveMutation.isPending}
            onMouseDown={() => setFocused(true)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              height: 40,
              padding: focused ? '0 72px 0 8px' : '0 8px',
              border: '1px solid',
              borderColor: form.formState.errors.email ? '#d32f2f' : 'rgba(0, 0, 0, 0.23)',
              borderRadius: 4,
              font: 'inherit',
              fontSize: 14,
            }}
          />
          {focused && iconFrame ? (
            <Box
              sx={{
                position: 'absolute',
                top: iconFrame.top,
                right: 4,
                height: iconFrame.height,
                display: 'flex',
                alignItems: 'center',
                zIndex: 1,
              }}
            >
              <IconButton
                type="button"
                size="small"
                aria-label="Cancel email edit"
                disabled={saveMutation.isPending}
                onMouseDown={keepFieldFocused}
                onClick={cancel}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton
                type="submit"
                size="small"
                aria-label="Send email"
                disabled={saveMutation.isPending}
                onMouseDown={keepFieldFocused}
                sx={{ p: 0.25 }}
              >
                {saveMutation.isPending ? (
                  <CircularProgress size={18} />
                ) : (
                  <CheckCircleIcon color="primary" sx={{ fontSize: 22 }} />
                )}
              </IconButton>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Form>
  )
}

export function EmailGadget({ customerId = janeDoeCustomerId }: EmailGadgetProps) {
  const emailQuery = useQuery({
    queryKey: customerEmailQueryKey(customerId),
    queryFn: () => getCustomerEmail(customerId),
  })

  return (
    <InfoCard title="Email" subheader="Customer contact">
      {emailQuery.isPending ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
          <CircularProgress size={20} />
        </Box>
      ) : null}
      {emailQuery.isError ? (
        <Typography variant="body2" color="error">
          Could not load the email.
        </Typography>
      ) : null}
      {emailQuery.data ? <EmailForm customerId={customerId} email={emailQuery.data.email} /> : null}
    </InfoCard>
  )
}
