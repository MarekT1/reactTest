import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined'
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { InfoCard } from './InfoCard'

const items: {
  title: string
  subheader: string
  icon: ReactNode
  body: string
}[] = [
  {
    title: 'Recent customer message',
    subheader: 'Today · 10:22',
    icon: <EmailOutlinedIcon fontSize="small" color="action" />,
    body: 'Jane Doe wrote: “Please update my address to 14 Baker Street. I have attached a recent utility bill.”',
  },
  {
    title: 'SMS reply',
    subheader: 'Today · 09:41',
    icon: <SmsOutlinedIcon fontSize="small" color="action" />,
    body: 'Customer confirmed the verification code sent to +44 7700 900123.',
  },
  {
    title: 'Open case',
    subheader: 'Case 4821',
    icon: <FolderOutlinedIcon fontSize="small" color="action" />,
    body: 'Address change is waiting on a check of the uploaded utility bill before it can be confirmed.',
  },
]

export function DashboardPanel() {
  return (
    <>
      <Typography variant="h6" component="h2">
        Dashboard
      </Typography>
      {items.map((item) => (
        <InfoCard key={item.title} title={item.title} subheader={item.subheader}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {item.icon}
            <Typography variant="body2" color="text.secondary">
              {item.body}
            </Typography>
          </Box>
        </InfoCard>
      ))}
    </>
  )
}
