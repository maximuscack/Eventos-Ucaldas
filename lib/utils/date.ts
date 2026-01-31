import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns"
import { es } from "date-fns/locale"

export function formatDate(date: Date | string, formatStr = "PPP"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: es })
}

export function getMonthDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function isCurrentMonth(date: Date, currentDate: Date): boolean {
  return isSameMonth(date, currentDate)
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1)
}

export function getPrevMonth(date: Date): Date {
  return subMonths(date, 1)
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${minutes} ${ampm}`
}
