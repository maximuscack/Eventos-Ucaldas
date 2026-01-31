"use client"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, MapPin, Tag, Edit, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate, formatTime } from "@/lib/utils/date"
import type { Evento } from "@/lib/types"

interface EventoDetailProps {
  evento: Evento
}

export function EventoDetail({ evento }: EventoDetailProps) {
  const hasLocation = evento.ubicacion_lat && evento.ubicacion_lng
  const googleMapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${evento.ubicacion_lat},${evento.ubicacion_lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(evento.lugar)}`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/eventos">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </Link>
        <Link href={`/dashboard/eventos/${evento.id}/editar`}>
          <Button className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      <Card>
        <div className="relative h-64 md:h-80">
          <Image
            src={
              evento.imagen_url || `/placeholder.svg?height=400&width=800&query=${encodeURIComponent(evento.nombre)}`
            }
            alt={evento.nombre}
            fill
            className="object-cover rounded-t-lg"
          />
          {evento.areas && (
            <Badge
              className="absolute top-4 right-4"
              style={{
                backgroundColor: evento.areas.color,
                color: "#fff",
              }}
            >
              <Tag className="h-3 w-3 mr-1" />
              {evento.areas.nombre}
            </Badge>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
          <h1 className="text-3xl font-bold">{evento.nombre}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Calendar className="h-6 w-6 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium">{formatDate(evento.fecha, "EEEE, d 'de' MMMM 'de' yyyy")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Clock className="h-6 w-6 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Hora</p>
                <p className="font-medium">{formatTime(evento.hora)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <MapPin className="h-6 w-6 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Lugar</p>
                <p className="font-medium">{evento.lugar}</p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => window.open(googleMapsUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            Ver en Google Maps
          </Button>

          {evento.descripcion && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Descripción</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{evento.descripcion}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
