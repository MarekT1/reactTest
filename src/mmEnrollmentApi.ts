export const mmInfoQueryKey = ['mm-info'] as const

export const mmEnrollmentStatuses = ['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] as const

export const mockMNumberSample = '104829'

export type MmEnrollmentStatus = (typeof mmEnrollmentStatuses)[number]

export type MmInfo = {
  enrollmentId: string
  programName: string
  mNumber: string
  email: string
  status: MmEnrollmentStatus
}

export type PatchMmEnrollmentPayload = {
  programName: string
  mNumber: string
  email: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let enrollment: MmInfo = {
  enrollmentId: 'enr-4821',
  programName: 'Address change',
  mNumber: '',
  email: 'jane.doe@example.com',
  status: 'IN_PROGRESS',
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function cloneEnrollment(): MmInfo {
  return { ...enrollment }
}

export function isMmEnrollmentEditable(status: MmEnrollmentStatus) {
  return status === 'NEW' || status === 'IN_PROGRESS'
}

/** GET /info */
export async function getMmInfo(): Promise<MmInfo> {
  await delay(200)
  return cloneEnrollment()
}

/** Updates the mocked status returned by GET /info. */
export function setMockMmEnrollmentStatus(status: MmEnrollmentStatus) {
  enrollment = { ...enrollment, status }
}

/** Updates the mocked M Number returned by GET /info. An empty string clears it. */
export function setMockMNumber(mNumber: string) {
  enrollment = { ...enrollment, mNumber }
}

/** PATCH /MM-enrollments/{enrollmentId} */
export async function patchMmEnrollment(
  enrollmentId: string,
  payload: PatchMmEnrollmentPayload,
): Promise<void> {
  await delay(200)
  if (enrollment.enrollmentId !== enrollmentId) {
    throw new Error('Enrollment not found')
  }
  if (enrollment.mNumber.trim() !== '') {
    throw new Error('M Number cannot be edited after it is set')
  }
  if (!/^\d+$/.test(payload.mNumber)) {
    throw new Error('M Number must be a number')
  }
  if (!emailPattern.test(payload.email)) {
    throw new Error('Email must be valid')
  }

  enrollment = {
    ...enrollment,
    programName: payload.programName,
    mNumber: payload.mNumber,
    email: payload.email,
  }
}

/** POST /mm-enrollments/resend */
export async function resendMmEnrollment(enrollmentId: string): Promise<void> {
  await delay(200)
  if (enrollment.enrollmentId !== enrollmentId) {
    throw new Error('Enrollment not found')
  }
  if (enrollment.mNumber.trim() !== '' || !isMmEnrollmentEditable(enrollment.status)) {
    throw new Error('Mail cannot be sent')
  }
}
