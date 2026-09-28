import CallReceivedIcon from '@mui/icons-material/CallReceived'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import NotesIcon from '@mui/icons-material/Notes'
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useState, type ReactNode } from 'react'
import { InfoCard } from './InfoCard'
import { ShimmerAlert } from './ShimmerAlert'

const activities: {
  title: string
  subheader: string
  icon: ReactNode
  body: string
}[] = [
  {
    title: 'Inbound call',
    subheader: 'Today · 10:14',
    icon: <CallReceivedIcon fontSize="small" color="action" />,
    body: 'Spoke about the address change. Customer confirmed the new street and house number.',
  },
  {
    title: 'SMS',
    subheader: 'Today · 09:40',
    icon: <SmsOutlinedIcon fontSize="small" color="action" />,
    body: 'Confirmation code sent to +44 7700 900123. Delivery reported as successful.',
  },
  {
    title: 'Email',
    subheader: 'Yesterday · 16:05',
    icon: <EmailOutlinedIcon fontSize="small" color="action" />,
    body: 'Request received from jane.doe@example.com with a scanned proof of address attached.',
  },
  {
    title: 'Case note',
    subheader: '22 Sep · 11:20',
    icon: <NotesIcon fontSize="small" color="action" />,
    body: 'Waiting on an updated utility bill before the address can be confirmed.',
  },
]

export function ActivityPanel() {
  const [showInfoAlert, setShowInfoAlert] = useState(true)

  return (
    <>
      {showInfoAlert ? (
        <ShimmerAlert onGotIt={() => setShowInfoAlert(false)}>
          This is an informational notice.
        </ShimmerAlert>
      ) : null}

      {activities.map((activity) => (
        <InfoCard key={activity.title} title={activity.title} subheader={activity.subheader}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {activity.icon}
            <Typography variant="body2" color="text.secondary">
              {activity.body}
            </Typography>
          </Box>
        </InfoCard>
      ))}
    </>
  )
}
