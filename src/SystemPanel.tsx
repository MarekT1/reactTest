import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined'
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import SyncIcon from '@mui/icons-material/Sync'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { InfoCard } from './InfoCard'
import { MemosWidget } from './MemosWidget'

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, py: 0.25 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  )
}

export function SystemPanel() {
  return (
    <>
      <InfoCard title="Environment" subheader="Production">
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <DnsOutlinedIcon fontSize="small" color="action" />
          <Typography variant="body2">Queue: Address changes</Typography>
        </Box>
        <MetaRow label="Region" value="eu-central-1" />
        <MetaRow label="Build" value="2026.9.22" />
      </InfoCard>

      <InfoCard title="Last sync" subheader="2 minutes ago">
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <SyncIcon fontSize="small" color="action" />
          <Typography variant="body2">Source: CRM</Typography>
        </Box>
        <MetaRow label="Records" value="1,284" />
        <MetaRow label="Next run" value="in 13 min" />
      </InfoCard>

      <InfoCard title="Session" subheader="Agent">
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <PersonOutlineIcon fontSize="small" color="action" />
          <Typography variant="body2">Alex Novak</Typography>
        </Box>
        <MetaRow label="Team" value="Customer ops" />
        <MetaRow label="Extension" value="4412" />
      </InfoCard>

      <InfoCard title="Connection" subheader="Online">
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <CloudDoneOutlinedIcon fontSize="small" color="action" />
          <Typography variant="body2">Channel: Secure</Typography>
        </Box>
        <MetaRow label="Latency" value="42 ms" />
        <MetaRow label="Voice" value="Ready" />
      </InfoCard>
      <MemosWidget />
    </>
  )
}
