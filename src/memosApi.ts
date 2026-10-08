export const janeDoeCustomerId = '1048291'

export const accountMembershipQueryKey = ['account-membership', janeDoeCustomerId] as const

export const memoryMessagesQueryKey = ['memory-messages'] as const

export type AccountMembership = {
  accountId: string
  productName: string
  status: string
}

export type AccountMembershipResponse = {
  accounts: AccountMembership[]
}

export type MemoRecord = {
  message: string
  operatorId: string
  date: string
  tag: string
  accountId: string
}

type GetMemoryMessagesRequest = {
  accountIds: readonly string[]
}

type PostMemoMessagesRequest =
  | { accountId: string; memoryMessage: string }
  | { accountIds: readonly string[]; memoryMessage: string }

type DeleteMemoMessageRequest = {
  accountId: string
}

const membershipByCustomer = new Map<string, AccountMembership[]>([
  [
    janeDoeCustomerId,
    [
      { accountId: '24018', productName: 'Personal current account', status: 'Active' },
      { accountId: '24019', productName: 'Cash ISA', status: 'Active' },
      { accountId: '24020', productName: 'Instant access saver', status: 'Active' },
    ],
  ],
])

const messages = new Map<string, MemoRecord>([
  [
    '24018',
    {
      message: 'Asked to keep the old address on file until 1 November.',
      operatorId: 'alex.novak',
      date: '2026-10-06T09:15:00',
      tag: 'address',
      accountId: '24018',
    },
  ],
  [
    '24019',
    {
      message: 'Prefers the ISA interest paid away to the current account.',
      operatorId: 'alex.novak',
      date: '2026-10-07T14:40:00',
      tag: 'savings',
      accountId: '24019',
    },
  ],
])

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function knownAccountIds(customerId = janeDoeCustomerId) {
  return new Set((membershipByCustomer.get(customerId) ?? []).map((account) => account.accountId))
}

function writeMessage(accountId: string, memoryMessage: string) {
  const current = messages.get(accountId)
  messages.set(accountId, {
    message: memoryMessage,
    operatorId: 'alex.novak',
    date: new Date().toISOString(),
    tag: current?.tag ?? '',
    accountId,
  })
}

export async function getAccountMembership(customerId: string): Promise<AccountMembershipResponse> {
  await delay(200)
  return { accounts: (membershipByCustomer.get(customerId) ?? []).map((account) => ({ ...account })) }
}

export async function getMemoryMessages({ accountIds }: GetMemoryMessagesRequest): Promise<MemoRecord[]> {
  await delay(200)
  return accountIds.flatMap((accountId) => {
    const memo = messages.get(accountId)
    if (!memo || memo.message.trim() === '') {
      return []
    }
    return [{ ...memo }]
  })
}

export async function postMemoMessages(payload: PostMemoMessagesRequest): Promise<void> {
  await delay(200)
  const accounts = knownAccountIds()
  const targets = 'accountIds' in payload ? payload.accountIds : [payload.accountId]
  for (const accountId of targets) {
    if (!accounts.has(accountId)) {
      throw new Error(`Unknown account ${accountId}`)
    }
    writeMessage(accountId, payload.memoryMessage)
  }
}

export async function deleteMemoMessage({ accountId }: DeleteMemoMessageRequest): Promise<void> {
  await delay(200)
  if (!knownAccountIds().has(accountId)) {
    throw new Error(`Unknown account ${accountId}`)
  }
  messages.delete(accountId)
}
