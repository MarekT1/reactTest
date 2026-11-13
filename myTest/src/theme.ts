import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#0b3a4a' },
    background: { default: '#d5e0e4', paper: '#f7f4ef' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
})
