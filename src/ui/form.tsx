import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  cloneElement,
  createContext,
  useContext,
  useId,
  type ReactElement,
  type ReactNode,
} from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

export const Form = FormProvider

type FormFieldContextValue = {
  name: string
}

type FormItemContextValue = {
  id: string
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null)
const FormItemContext = createContext<FormItemContextValue | null>(null)

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

export function FormItem({ children }: { children: ReactNode }) {
  const id = useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>{children}</Box>
    </FormItemContext.Provider>
  )
}

function useFormField() {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  if (!fieldContext) {
    throw new Error('Form components must be used within FormField')
  }
  if (!itemContext) {
    throw new Error('Form components must be used within FormItem')
  }

  const fieldState = getFieldState(fieldContext.name, formState)
  return {
    id: itemContext.id,
    formItemId: `${itemContext.id}-form-item`,
    formMessageId: `${itemContext.id}-form-item-message`,
    error: fieldState.error,
  }
}

export function FormLabel({ children }: { children: ReactNode }) {
  const { error, formItemId } = useFormField()
  return (
    <Typography
      component="label"
      htmlFor={formItemId}
      sx={{
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '16px',
        color: error ? 'error.main' : 'text.primary',
      }}
    >
      {children}
    </Typography>
  )
}

type FormControlChildProps = {
  id?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

export function FormControl({ children }: { children: ReactElement<FormControlChildProps> }) {
  const { error, formItemId, formMessageId } = useFormField()
  return cloneElement(children, {
    id: formItemId,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? formMessageId : undefined,
  })
}

export function FormMessage({ children }: { children?: ReactNode }) {
  const { error, formMessageId } = useFormField()
  const body = children ?? error?.message
  if (!body) {
    return null
  }
  return (
    <Typography id={formMessageId} role="alert" sx={{ fontSize: 12, lineHeight: '16px', color: 'error.main' }}>
      {body}
    </Typography>
  )
}
