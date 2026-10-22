export const mmEnrollmentsQueryKey = ['mm-enrollments'] as const

export const mmEnrollmentStatuses = ['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const

export const mmProductCodes = ['MMPRODUCT1', 'MMPRODUCT2'] as const

export const sampleAccountId = '24018'

export const sampleProductCode = 'MMPRODUCT1'

export const mockLoyaltyNumberSample = '104829'

export type MmEnrollmentStatus = (typeof mmEnrollmentStatuses)[number]

export type MmEnrollment = {
  accountId: string
  id: string
  mmEmail: string
  status: MmEnrollmentStatus
  loyaltyNumber: string
}

export type PatchMmEnrollmentPayload = {
  loyaltyNumber: string
  email: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const enrollments = new Map<string, MmEnrollment>([
  [
    sampleAccountId,
    {
      accountId: sampleAccountId,
      id: 'enr-4821',
      mmEmail: 'jane.doe@example.com',
      status: 'IN_PROGRESS',
      loyaltyNumber: '',
    },
  ],
])

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function cloneEnrollment(enrollment: MmEnrollment): MmEnrollment {
  return { ...enrollment }
}

export function isMmProductCode(productCode: string) {
  return (mmProductCodes as readonly string[]).includes(productCode)
}

export function isMmEnrollmentEditable(status: MmEnrollmentStatus) {
  return status === 'NEW' || status === 'IN_PROGRESS'
}

/** GET /enrollments?accountId= */
export async function getEnrollments(accountId: string): Promise<MmEnrollment | null> {
  await delay(200)
  const enrollment = enrollments.get(accountId)
  return enrollment ? cloneEnrollment(enrollment) : null
}

/** Updates the mocked status returned by GET /enrollments for this account. */
export function setMockEnrollmentStatus(accountId: string, status: MmEnrollmentStatus) {
  const enrollment = enrollments.get(accountId)
  if (!enrollment) {
    return
  }
  enrollments.set(accountId, { ...enrollment, status })
}

/** Updates the mocked loyalty number returned by GET /enrollments. An empty string clears it. */
export function setMockLoyaltyNumber(accountId: string, loyaltyNumber: string) {
  const enrollment = enrollments.get(accountId)
  if (!enrollment) {
    return
  }
  enrollments.set(accountId, { ...enrollment, loyaltyNumber })
}

/** PATCH /MM-enrollments/{enrollmentId} */
export async function patchMmEnrollment(
  enrollmentId: string,
  payload: PatchMmEnrollmentPayload,
): Promise<void> {
  await delay(200)
  const current = [...enrollments.values()].find((enrollment) => enrollment.id === enrollmentId)
  if (!current) {
    throw new Error('Enrollment not found')
  }
  if (current.loyaltyNumber.trim() !== '') {
    throw new Error('Loyalty number cannot be edited after it is set')
  }
  if (!/^\d+$/.test(payload.loyaltyNumber)) {
    throw new Error('Loyalty number must be a number')
  }
  if (!emailPattern.test(payload.email)) {
    throw new Error('Email must be valid')
  }

  enrollments.set(current.accountId, {
    ...current,
    loyaltyNumber: payload.loyaltyNumber,
    mmEmail: payload.email,
  })
}

/** POST /mm-enrollments/resend */
export async function resendMmEnrollment(enrollmentId: string): Promise<void> {
  await delay(200)
  const current = [...enrollments.values()].find((enrollment) => enrollment.id === enrollmentId)
  if (!current) {
    throw new Error('Enrollment not found')
  }
  if (current.loyaltyNumber.trim() !== '' || !isMmEnrollmentEditable(current.status)) {
    throw new Error('Mail cannot be sent')
  }
}
