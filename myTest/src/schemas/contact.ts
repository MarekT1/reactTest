import { z } from 'zod'

export const emailSchema = z.email()

export const contactSchema = z.object({
  phone: z.string().min(1),
  email: emailSchema,
  updatedAt: z.string().min(1),
})

export type Contact = z.infer<typeof contactSchema>
