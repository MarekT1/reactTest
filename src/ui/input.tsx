import { forwardRef, type InputHTMLAttributes } from 'react'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const UiInput = forwardRef<HTMLInputElement, InputProps>(function UiInput(props, ref) {
  return <input {...props} ref={ref} />
})
