import dayjs from 'dayjs'
import 'dayjs/locale/tr'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.locale('tr')
dayjs.extend(relativeTime)

export const formatDate = (date: string | Date, format = 'DD.MM.YYYY HH:mm') => {
  return dayjs(date).format(format)
}

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow()
}

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export const getColorFromString = (str: string): string => {
  const colors = [
    '#1890ff', '#52c41a', '#fa8c16', '#722ed1', '#eb2f96',
    '#13c2c2', '#faad14', '#f5222d', '#2f54eb', '#52c41a'
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}