"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EventCard } from "./event-card"
import type { Evento } from "@/lib/types"

interface EventSearchProps {
  eventos: Evento[]
  onEventClick?: (evento: Evento) => void
}

export function EventSearch({ eventos, onEventClick }: EventSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEventos = useMemo(() => {
    if (!searchQuery.trim()) return []

    const query = searchQuery.toLowerCase()
    return eventos.filter(
      (evento) =>
        evento.nombre.toLowerCase().includes(query) ||
        evento.lugar.toLowerCase().includes(query) ||
        evento.descripcion?.toLowerCase().includes(query) ||
        evento.areas?.nombre.toLowerCase().includes(query),
    )
  }, [eventos, searchQuery])

  return (
    <div className="space-y-6">
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar eventos por nombre, lugar o área..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-12 py-6 text-lg rounded-full border-2 focus:border-accent"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {searchQuery && (
        <div className="space-y-4">
          <p className="text-muted-foreground text-center">
            {filteredEventos.length} resultado(s) para "{searchQuery}"
          </p>

          {filteredEventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEventos.map((evento) => (
                <EventCard key={evento.id} evento={evento} onClick={() => onEventClick?.(evento)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No se encontraron eventos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
