import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const theme = createTheme()
const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
