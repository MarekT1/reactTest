import { format, parseISO } from 'date-fns'

export function formatUpdatedAt(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy, HH:mm')
}
