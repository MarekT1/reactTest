export function startOfToday(): Date {
  const today = new Date()
  return new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

export function getDefaultDateRange(): [Date, Date] {
  const today = startOfToday()
  const day = today.getDate()
  const cursor = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const from = new Date(cursor.getFullYear(), cursor.getMonth(), Math.min(day, lastDay))
  return [from, today]
}
