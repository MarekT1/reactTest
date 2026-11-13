import { contactSchema, emailSchema, type Contact } from '../schemas/contact.ts'

export async function fetchContact(): Promise<Contact> {
  const response = await fetch('/api/contact')
  if (!response.ok) {
    throw new Error('Failed to load contact')
  }
  return contactSchema.parse(await response.json())
}

export async function updateContactEmail(email: string): Promise<Contact> {
  const parsed = emailSchema.parse(email)
  const response = await fetch('/api/contact', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: parsed }),
  })
  if (!response.ok) {
    throw new Error('Failed to save contact')
  }
  return contactSchema.parse(await response.json())
}
