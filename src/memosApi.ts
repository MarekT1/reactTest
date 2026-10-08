export const janeDoeProductIds = ['24018', '24019'] as const

export const memosQueryKey = ['memos', janeDoeProductIds] as const

export type MemoRecord = {
  message: string
  operatorId: string
  date: string
  tag: string
  accountId: string
}

const productNames: Record<string, string> = {
  '24018': 'Personal current account',
  '24019': 'Cash ISA',
}

type GetMemosRequest = {
  productIds: readonly string[]
}

type SaveMemoRequest = {
  productId: string
  memo: string
}

const memos = new Map<string, MemoRecord>([
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
      message: '',
      operatorId: '',
      date: '',
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

export function productNameFor(accountId: string) {
  return productNames[accountId] ?? `Product ${accountId}`
}

export async function getMemos({ productIds }: GetMemosRequest): Promise<MemoRecord[]> {
  await delay(200)
  return productIds.map((productId) => {
    const memo = memos.get(productId)
    if (!memo) {
      return {
        message: '',
        operatorId: '',
        date: '',
        tag: '',
        accountId: productId,
      }
    }
    return { ...memo }
  })
}

export async function saveMemo({ productId, memo }: SaveMemoRequest): Promise<void> {
  await delay(200)
  const current = memos.get(productId)
  if (!current) {
    throw new Error(`Unknown product ${productId}`)
  }
  current.message = memo
  current.operatorId = 'alex.novak'
  current.date = new Date().toISOString()
}
