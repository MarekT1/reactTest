import { faker } from '@faker-js/faker'
import type { Contact } from '../schemas/contact.ts'

function createContact(): Contact {
  return {
    phone: faker.phone.number({ style: 'international' }),
    email: faker.internet.email({ provider: 'example.com' }).toLowerCase(),
    updatedAt: new Date().toISOString(),
  }
}

let contact = createContact()

export function getContact(): Contact {
  return contact
}

export function saveContactEmail(email: string): Contact {
  contact = {
    ...contact,
    email,
    updatedAt: new Date().toISOString(),
  }
  return contact
}

export function resetContact(): void {
  contact = createContact()
}
