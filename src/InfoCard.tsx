import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export type InfoCardProps = {
  title: string
  subheader?: string
  children: ReactNode
}

export function InfoCard({ title, subheader, children }: InfoCardProps) {
  return (
    <Card variant="outlined">
      <CardHeader
        title={title}
        subheader={subheader}
        slotProps={{
          title: { variant: 'subtitle2' },
          subheader: { variant: 'caption' },
        }}
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ pt: 1 }}>
        {typeof children === 'string' ? (
          <Typography variant="body2" color="text.secondary">
            {children}
          </Typography>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
