import Box from '@mui/material/Box'
import type { ReactNode } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'

const PANEL_MIN_PX = 300
const LEFT_COLUMN_PX = 300

export type CommunicatorView = 'details' | 'dashboard'

export type CommunicatorLayoutProps = {
  left: ReactNode
  view: CommunicatorView
  middle: ReactNode
  right: ReactNode
  dashboard: ReactNode
}

function Column({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxSizing: 'border-box',
        minWidth: 0,
      }}
    >
      {children}
    </Box>
  )
}

export function CommunicatorLayout({
  left,
  view,
  middle,
  right,
  dashboard,
}: CommunicatorLayoutProps) {
  return (
    <Box sx={{ flex: 1, minHeight: 0, overflowX: 'auto' }}>
      <Group
        key={view}
        orientation="horizontal"
        style={{ height: '100%', minWidth: view === 'details' ? 916 : 608 }}
      >
        <Panel
          id="system"
          defaultSize={LEFT_COLUMN_PX}
          minSize={LEFT_COLUMN_PX}
          maxSize={LEFT_COLUMN_PX}
          disabled
          groupResizeBehavior="preserve-pixel-size"
          style={{ overflow: 'auto' }}
        >
          <Column>{left}</Column>
        </Panel>
        <Separator disabled className="communicator-column-divider" />
        {view === 'details' ? (
          <>
            <Panel id="customer" minSize={PANEL_MIN_PX} defaultSize="40%" style={{ overflow: 'auto' }}>
              <Column>{middle}</Column>
            </Panel>
            <Separator className="communicator-resize-handle" />
            <Panel id="activity" minSize={PANEL_MIN_PX} defaultSize="30%" style={{ overflow: 'auto' }}>
              <Column>{right}</Column>
            </Panel>
          </>
        ) : (
          <Panel id="dashboard" minSize={PANEL_MIN_PX} style={{ overflow: 'auto' }}>
            <Column>{dashboard}</Column>
          </Panel>
        )}
      </Group>
    </Box>
  )
}
