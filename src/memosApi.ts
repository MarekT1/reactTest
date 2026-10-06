export const janeDoeProductIds = ['24018', '24019'] as const

export const memosQueryKey = ['memos', janeDoeProductIds] as const

export type ProductMemo = {
  productId: string
  productName: string
  memo: string
}

type GetMemosRequest = {
  productIds: readonly string[]
}

type SaveMemoRequest = {
  productId: string
  memo: string
}

const products = new Map<string, ProductMemo>([
  [
    '24018',
    {
      productId: '24018',
      productName: 'Personal current account',
      memo: 'Asked to keep the old address on file until 1 November.',
    },
  ],
  [
    '24019',
    {
      productId: '24019',
      productName: 'Cash ISA',
      memo: '',
    },
  ],
])

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function getMemos({ productIds }: GetMemosRequest): Promise<ProductMemo[]> {
  await delay(200)
  return productIds.map((productId) => {
    const product = products.get(productId)
    if (!product) {
      return { productId, productName: `Product ${productId}`, memo: '' }
    }
    return { ...product }
  })
}

export async function saveMemo({ productId, memo }: SaveMemoRequest): Promise<void> {
  await delay(200)
  const product = products.get(productId)
  if (!product) {
    throw new Error(`Unknown product ${productId}`)
  }
  product.memo = memo
}
