import { describe, expect, it } from 'vitest'
import { formatUpdatedAt } from '../formatUpdatedAt.ts'
import { emailSchema } from '../schemas/contact.ts'

describe('emailSchema', () => {
  it('accepts a normal address', () => {
    expect(emailSchema.safeParse('ada@example.com').success).toBe(true)
  })

  it('rejects an address without a domain', () => {
    expect(emailSchema.safeParse('ada@').success).toBe(false)
  })
})

describe('formatUpdatedAt', () => {
  it('formats an ISO timestamp with a date and a clock time', () => {
    const formatted = formatUpdatedAt('2026-11-13T14:05:00.000Z')
    expect(formatted).toMatch(/2026/)
    expect(formatted).toMatch(/\d{2}:\d{2}/)
  })
})
