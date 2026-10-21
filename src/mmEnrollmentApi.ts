export const mmEnrollmentQueryKey = ['mm-enrollment'] as const

export const mmEnrollmentStatuses = ['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELED'] as const

export type MmEnrollmentStatus = (typeof mmEnrollmentStatuses)[number]

export type MmEnrollment = {
  enrollmentId: string
  programName: string
  mNumber: string
  email: string
  status: MmEnrollmentStatus
  mNumberLocked: boolean
}

export type PatchMmEnrollmentPayload = {
  programName: string
  mNumber: string
  email: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

let enrollment: MmEnrollment = {
  enrollmentId: 'enr-4821',
  programName: 'Address change',
  mNumber: '104829',
  email: 'jane.doe@example.com',
  status: 'IN_PROGRESS',
  mNumberLocked: false,
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function cloneEnrollment(): MmEnrollment {
  return { ...enrollment }
}

export function isMmEnrollmentEditable(status: MmEnrollmentStatus) {
  return status === 'NEW' || status === 'IN_PROGRESS'
}

/** GET /MM-enrollments */
export async function getMmEnrollment(): Promise<MmEnrollment> {
  await delay(200)
  return cloneEnrollment()
}

/** Updates the mocked enrollment status returned by GET /MM-enrollments. */
export function setMockMmEnrollmentStatus(status: MmEnrollmentStatus): MmEnrollment {
  enrollment = { ...enrollment, status }
  return cloneEnrollment()
}

/** PATCH /MM-enrollments/{enrollmentId} */
export async function patchMmEnrollment(
  enrollmentId: string,
  payload: PatchMmEnrollmentPayload,
): Promise<MmEnrollment> {
  await delay(200)
  if (enrollment.enrollmentId !== enrollmentId) {
    throw new Error('Enrollment not found')
  }
  if (!isMmEnrollmentEditable(enrollment.status)) {
    throw new Error('Enrollment can no longer be edited')
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
    mNumber: enrollment.mNumberLocked ? enrollment.mNumber : payload.mNumber,
    email: payload.email,
    mNumberLocked: true,
  }
  return cloneEnrollment()
}

/** POST /mm-enrollments/resend */
export async function resendMmEnrollment(enrollmentId: string): Promise<void> {
  await delay(200)
  if (enrollment.enrollmentId !== enrollmentId) {
    throw new Error('Enrollment not found')
  }
}
