import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ActivityPanel } from './ActivityPanel'
import { CommunicatorLayout } from './CommunicatorLayout'
import { CustomerPanel } from './CustomerPanel'
import { SystemPanel } from './SystemPanel'

function App() {
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
        }}
      >
        <Typography variant="h5" component="h1">
          Conversation with Jane Doe
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Address change · Case 4821
        </Typography>
      </Box>
      <CommunicatorLayout
        left={<SystemPanel />}
        middle={<CustomerPanel />}
        right={<ActivityPanel />}
      />
    </Box>
  )
}

export default App
