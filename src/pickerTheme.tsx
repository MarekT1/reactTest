import { ThemeProvider, createTheme, useTheme, type Theme } from '@mui/material/styles'
import { useMemo, type ReactNode } from 'react'

/** Default MUI primary blue, so picker selection does not follow the app theme. */
export const PICKER_PRIMARY = {
  main: '#1976d2',
  dark: '#1565c0',
  light: '#42a5f5',
  contrastText: '#fff',
}

/** CSS variables for apps that enable `cssVariables` (portaled poppers). */
export const pickerPrimaryCssVars = {
  '--mui-palette-primary-main': PICKER_PRIMARY.main,
  '--mui-palette-primary-dark': PICKER_PRIMARY.dark,
  '--mui-palette-primary-light': PICKER_PRIMARY.light,
  '--mui-palette-primary-contrastText': PICKER_PRIMARY.contrastText,
  '--mui-palette-primary-mainChannel': '25 118 210',
  '--mui-palette-primary-darkChannel': '21 101 192',
  '--mui-palette-primary-lightChannel': '66 165 245',
} as const

type ThemeWithVars = Theme & {
  colorSchemes?: unknown
  vars?: unknown
  cssVariables?: unknown
}

function omitCssVarKeys(theme: ThemeWithVars) {
  const rest = { ...theme }
  delete rest.colorSchemes
  delete rest.vars
  delete rest.cssVariables
  return rest as Omit<ThemeWithVars, 'colorSchemes' | 'vars' | 'cssVariables'>
}

export function createPickerTheme(outerTheme: Theme) {
  const next = createTheme(omitCssVarKeys(outerTheme as ThemeWithVars), {
    palette: {
      primary: PICKER_PRIMARY,
    },
    components: {
      // Same as MUI X v9 PickerDay: caption typography, then override line-height.
      MuiPickersDay: {
        styleOverrides: {
          root: {
            lineHeight: 1,
            display: 'flex',
          },
        },
      },
    },
  }) as ThemeWithVars
  // `vars: null` stops CSS-variable themes from reading app primary off :root.
  return { ...omitCssVarKeys(next), vars: null }
}

export function PickerTheme({ children }: { children: ReactNode }) {
  const outerTheme = useTheme()
  const theme = useMemo(() => createPickerTheme(outerTheme), [outerTheme])
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
