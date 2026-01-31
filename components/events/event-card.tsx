"use client"

import Image from "next/image"
import { Calendar, Clock, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatTime } from "@/lib/utils/date"
import type { Evento } from "@/lib/types"

interface EventCardProps {
  evento: Evento
  onClick?: () => void
}

export function EventCard({ evento, onClick }: EventCardProps) {
  return (
    <Card className="event-card overflow-hidden cursor-pointer group" onClick={onClick}>
      <div className="relative h-48 overflow-hidden">
        <Image
          src={evento.imagen_url || `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(evento.nombre)}`}
          alt={evento.nombre}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {evento.areas && (
          <Badge
            className="absolute top-3 right-3"
            style={{
              backgroundColor: evento.areas.color,
              color: "#fff",
            }}
          >
            {evento.areas.nombre}
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2">{evento.nombre}</h3>

        {evento.descripcion && <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{evento.descripcion}</p>}

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-accent" />
            <span>{formatDate(evento.fecha, "EEEE, d 'de' MMMM")}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-accent" />
            <span>{formatTime(evento.hora)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="line-clamp-1">{evento.lugar}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
