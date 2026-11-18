import { forwardRef, type ReactNode } from 'react'
import { useFormContext, type FieldValues, type Path } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './form'
import { UiInput, type InputProps } from './input'

export type FormInputProps = Omit<InputProps, 'name'> & {
  name: Path<FieldValues>
  label?: ReactNode
  error?: string
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(function FormInput(
  { type = 'text', label, error, name, onBlur, ...props },
  ref,
) {
  const { control } = useFormContext()

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const { ref: fieldRef, onBlur: fieldOnBlur, ...fieldProps } = field
        return (
          <FormItem>
            {label ? <FormLabel>{label}</FormLabel> : null}
            <FormControl>
              <UiInput
                {...props}
                {...fieldProps}
                type={type}
                ref={(node) => {
                  fieldRef(node)
                  if (typeof ref === 'function') {
                    ref(node)
                  } else if (ref) {
                    ref.current = node
                  }
                }}
                onBlur={(event) => {
                  fieldOnBlur()
                  onBlur?.(event)
                }}
              />
            </FormControl>
            <FormMessage>{error}</FormMessage>
          </FormItem>
        )
      }}
    />
  )
})
