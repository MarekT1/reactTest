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

export function createPickerTheme(outerTheme: Theme) {
  const {
    colorSchemes: _colorSchemes,
    vars: _vars,
    cssVariables: _cssVariables,
    ...outer
  } = outerTheme as ThemeWithVars
  const next = createTheme(outer, {
    palette: {
      primary: PICKER_PRIMARY,
    },
  }) as ThemeWithVars
  const { colorSchemes: _nextSchemes, vars: _nextVars, ...rest } = next
  return { ...rest, vars: null }
}

export function PickerTheme({ children }: { children: ReactNode }) {
  const outerTheme = useTheme()
  const theme = useMemo(() => createPickerTheme(outerTheme), [outerTheme])
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
