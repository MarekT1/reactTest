import { janeDoeCustomerId } from './memosApi'

export { janeDoeCustomerId }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type CustomerEmail = {
  email: string
}

const emails = new Map<string, string>([[janeDoeCustomerId, 'jane.doe@example.com']])

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export function customerEmailQueryKey(customerId: string) {
  return ['customer-email', customerId] as const
}

/** GET /customers/{customerId}/email */
export async function getCustomerEmail(customerId: string): Promise<CustomerEmail> {
  await delay(200)
  const email = emails.get(customerId)
  if (!email) {
    throw new Error('Customer not found')
  }
  return { email }
}

/** PUT /customers/{customerId}/email */
export async function putCustomerEmail(customerId: string, email: string): Promise<CustomerEmail> {
  await delay(200)
  if (!emails.has(customerId)) {
    throw new Error('Customer not found')
  }
  const next = email.trim()
  if (!emailPattern.test(next)) {
    throw new Error('Enter a valid email')
  }
  emails.set(customerId, next)
  return { email: next }
}
