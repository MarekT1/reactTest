import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchContact, updateContactEmail } from '../api/contact.ts'
import { formatUpdatedAt } from '../formatUpdatedAt.ts'
import { emailSchema, type Contact } from '../schemas/contact.ts'

const editEmailSx = {
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E6B325 !important',
    borderWidth: 2,
  },
  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E6B325 !important',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#E6B325 !important',
    borderWidth: 2,
  },
} as const

export function ContactScreen() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [emailDraft, setEmailDraft] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  const contactQuery = useQuery({
    queryKey: ['contact'],
    queryFn: fetchContact,
  })

  const saveMutation = useMutation({
    mutationFn: updateContactEmail,
    onSuccess: (contact) => {
      queryClient.setQueryData(['contact'], contact)
      setMode('view')
      setExpanded(true)
      setEmailError(null)
    },
  })

  function openEdit(contact: Contact) {
    setEmailDraft(contact.email)
    setEmailError(null)
    saveMutation.reset()
    setMode('edit')
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = emailSchema.safeParse(emailDraft.trim())
    if (!parsed.success) {
      setEmailError(t('contact.invalidEmail'))
      return
    }
    setEmailError(null)
    saveMutation.mutate(parsed.data)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: { xs: 0, sm: 4 },
      }}
    >
      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: 420,
          minHeight: { xs: '100vh', sm: 760 },
          bgcolor: 'background.paper',
          borderRadius: { xs: 0, sm: 5 },
          boxShadow: { sm: '0 18px 50px rgba(11, 58, 74, 0.18)' },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            pt: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            color: 'text.secondary',
          }}
        >
          <Typography variant="caption" component="p">
            {format(new Date(), 'HH:mm')}
          </Typography>
          <Typography variant="caption" component="p">
            myTest
          </Typography>
        </Box>

        <Box sx={{ px: 2.5, pt: 1, pb: 2 }}>
          <Typography variant="h5" component="h1">
            {mode === 'edit' ? t('contact.editTitle') : t('app.title')}
          </Typography>
        </Box>

        <Box sx={{ px: 2, pb: 3, flex: 1 }}>
          {contactQuery.isPending ? (
            <Stack spacing={1.5} sx={{ alignItems: 'center', py: 6 }}>
              <CircularProgress size={28} />
              <Typography color="text.secondary">
                {t('contact.loading')}
              </Typography>
            </Stack>
          ) : null}

          {contactQuery.isError ? (
            <Stack spacing={1.5}>
              <Alert severity="error">{t('contact.loadError')}</Alert>
              <Button variant="outlined" onClick={() => contactQuery.refetch()}>
                {t('contact.retry')}
              </Button>
            </Stack>
          ) : null}

          {contactQuery.data && mode === 'view' ? (
            <Accordion
              expanded={expanded}
              onChange={(_, next) => setExpanded(next)}
              disableGutters
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'transparent',
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  minHeight: 56,
                  borderRadius: 2,
                  '& .MuiAccordionSummary-content': { my: 1.5 },
                  '& .MuiAccordionSummary-expandIconWrapper': {
                    color: 'inherit',
                  },
                  '&.Mui-expanded': {
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                  },
                }}
              >
                <Typography component="span" sx={{ fontWeight: 650 }}>
                  {t('contact.group')}
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  bgcolor: '#fff',
                  border: 1,
                  borderTop: 0,
                  borderColor: 'divider',
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                  px: 2,
                  py: 2,
                }}
              >
                <Stack spacing={2}>
                  <DataLine
                    icon={<PhoneIphoneIcon fontSize="small" />}
                    label={t('contact.phone')}
                    value={contactQuery.data.phone}
                    testId="contact-phone"
                  />
                  <DataLine
                    icon={<EmailOutlinedIcon fontSize="small" />}
                    label={t('contact.email')}
                    value={contactQuery.data.email}
                    testId="contact-email"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {t('contact.updated', {
                      date: formatUpdatedAt(contactQuery.data.updatedAt),
                    })}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => openEdit(contactQuery.data)}
                  >
                    {t('contact.edit')}
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ) : null}

          {contactQuery.data && mode === 'edit' ? (
            <Box component="form" onSubmit={save} noValidate>
              <Stack spacing={2}>
                <Button
                  type="button"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setMode('view')}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {t('contact.cancel')}
                </Button>
                <TextField
                  label={t('contact.phone')}
                  value={contactQuery.data.phone}
                  disabled
                  fullWidth
                  helperText={t('contact.phoneLocked')}
                />
                <TextField
                  label={t('contact.email')}
                  value={emailDraft}
                  onChange={(event) => {
                    setEmailDraft(event.target.value)
                    if (emailError) setEmailError(null)
                  }}
                  fullWidth
                  autoFocus
                  autoComplete="email"
                  sx={editEmailSx}
                />
                {emailError ? (
                  <Typography color="error" variant="body2" role="alert">
                    {emailError}
                  </Typography>
                ) : null}
                {saveMutation.isError ? (
                  <Alert severity="error">{t('contact.saveError')}</Alert>
                ) : null}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending
                    ? t('contact.saving')
                    : t('contact.save')}
                </Button>
              </Stack>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}

function DataLine({
  icon,
  label,
  value,
  testId,
}: {
  icon: ReactNode
  label: string
  value: string
  testId: string
}) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography data-testid={testId} sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  )
}
