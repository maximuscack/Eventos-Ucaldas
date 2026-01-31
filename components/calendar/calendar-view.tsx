"use client"

import { useState, useMemo } from "react"
import { format, isSameDay, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getMonthDays, isCurrentMonth, isToday, getNextMonth, getPrevMonth } from "@/lib/utils/date"
import type { Evento, Area } from "@/lib/types"

interface CalendarViewProps {
  eventos: Evento[]
  areas: Area[]
  onEventClick?: (evento: Evento) => void
}

export function CalendarView({ eventos, areas, onEventClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedArea, setSelectedArea] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>("current")

  const months = useMemo(() => {
    const result = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      result.push({
        value: i === 0 ? "current" : format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy", { locale: es }),
        date,
      })
    }
    return result
  }, [])

  const days = useMemo(() => getMonthDays(currentDate), [currentDate])

  const filteredEventos = useMemo(() => {
    return eventos.filter((evento) => {
      if (selectedArea !== "all" && evento.area_id !== selectedArea) {
        return false
      }
      return true
    })
  }, [eventos, selectedArea])

  const getEventsForDay = (date: Date) => {
    return filteredEventos.filter((evento) => isSameDay(parseISO(evento.fecha), date))
  }

  const handlePrevMonth = () => {
    const prevMonth = getPrevMonth(currentDate)
    const now = new Date()
    if (prevMonth >= new Date(now.getFullYear(), now.getMonth(), 1)) {
      setCurrentDate(prevMonth)
    }
  }

  const handleNextMonth = () => {
    const nextMonth = getNextMonth(currentDate)
    const now = new Date()
    const maxDate = new Date(now.getFullYear() + 1, now.getMonth(), 1)
    if (nextMonth <= maxDate) {
      setCurrentDate(nextMonth)
    }
  }

  const handleMonthSelect = (value: string) => {
    setSelectedMonth(value)
    if (value === "current") {
      setCurrentDate(new Date())
    } else {
      const [year, month] = value.split("-")
      setCurrentDate(new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1))
    }
  }

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
      {/* Header del calendario */}
      <div className="bg-primary p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="text-white hover:bg-white/20">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-bold text-white capitalize min-w-[200px] text-center">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="text-white hover:bg-white/20">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtro por mes */}
            <Select value={selectedMonth} onValueChange={handleMonthSelect}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por área */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrar
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Filtrar por área</h4>
                  <Select value={selectedArea} onValueChange={setSelectedArea}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las áreas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las áreas</SelectItem>
                      {areas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                            {area.nombre}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-muted">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonthDay = isCurrentMonth(day, currentDate)
          const isTodayDay = isToday(day)

          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border-b border-r border-border transition-colors ${
                isCurrentMonthDay ? "bg-card" : "bg-muted/50"
              } ${isTodayDay ? "bg-accent/10" : ""}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-sm font-medium ${
                    isTodayDay
                      ? "bg-accent text-accent-foreground w-7 h-7 rounded-full flex items-center justify-center"
                      : isCurrentMonthDay
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {format(day, "d")}
                </span>
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((evento) => (
                  <button key={evento.id} onClick={() => onEventClick?.(evento)} className="w-full text-left">
                    <Badge
                      variant="secondary"
                      className="w-full truncate text-xs py-0.5 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: evento.areas?.color || "#F5A623",
                        color: "#fff",
                      }}
                    >
                      {evento.nombre}
                    </Badge>
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{dayEvents.length - 2} más</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
