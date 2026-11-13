import { http, HttpResponse } from 'msw'
import { emailSchema } from '../schemas/contact.ts'
import { getContact, resetContact, saveContactEmail } from './store.ts'

export { resetContact }

export const handlers = [
  http.get('/api/contact', () => HttpResponse.json(getContact())),
  http.put('/api/contact', async ({ request }) => {
    const body: unknown = await request.json()
    const email =
      typeof body === 'object' && body !== null && 'email' in body
        ? body.email
        : undefined
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) {
      return HttpResponse.json({ message: 'Invalid email' }, { status: 400 })
    }
    return HttpResponse.json(saveContactEmail(parsed.data))
  }),
]
