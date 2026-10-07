import Box from '@mui/material/Box'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { ActivityPanel } from './ActivityPanel'
import { CommunicatorLayout, type CommunicatorView } from './CommunicatorLayout'
import { CustomerPanel } from './CustomerPanel'
import { DashboardPanel } from './DashboardPanel'
import { SystemPanel } from './SystemPanel'

function App() {
  const [view, setView] = useState<CommunicatorView>('details')

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box
        component="header"
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="h1">
            Conversation with Jane Doe
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Address change · Case 4821
          </Typography>
        </Box>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={view}
          onChange={(_event, nextView: CommunicatorView | null) => {
            if (nextView) {
              setView(nextView)
            }
          }}
          aria-label="Layout"
        >
          <ToggleButton value="details">Details</ToggleButton>
          <ToggleButton value="dashboard">Dashboard</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <CommunicatorLayout
        view={view}
        left={<SystemPanel />}
        middle={<CustomerPanel />}
        right={<ActivityPanel />}
        dashboard={<DashboardPanel />}
      />
    </Box>
  )
}

export default App
