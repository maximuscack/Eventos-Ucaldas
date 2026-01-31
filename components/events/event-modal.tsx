"use client"

import Image from "next/image"
import { Calendar, Clock, MapPin, Tag, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatTime } from "@/lib/utils/date"
import type { Evento } from "@/lib/types"

interface EventModalProps {
  evento: Evento | null
  open: boolean
  onClose: () => void
}

export function EventModal({ evento, open, onClose }: EventModalProps) {
  if (!evento) return null

  const hasLocation = evento.ubicacion_lat && evento.ubicacion_lng
  const googleMapsUrl = hasLocation
    ? `https://www.google.com/maps?q=${evento.ubicacion_lat},${evento.ubicacion_lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(evento.lugar)}`

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold pr-8">{evento.nombre}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagen del evento */}
          <div className="relative h-64 rounded-lg overflow-hidden">
            <Image
              src={
                evento.imagen_url || `/placeholder.svg?height=300&width=600&query=${encodeURIComponent(evento.nombre)}`
              }
              alt={evento.nombre}
              fill
              className="object-cover"
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

          {/* Información del evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Calendar className="h-5 w-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Fecha</p>
                <p className="font-medium">{formatDate(evento.fecha, "EEEE, d 'de' MMMM 'de' yyyy")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Clock className="h-5 w-5 text-accent" />
              <div>
                <p className="text-xs text-muted-foreground">Hora</p>
                <p className="font-medium">{formatTime(evento.hora)}</p>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-accent mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Ubicación</p>
                <p className="font-medium mb-2">{evento.lugar}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                  onClick={() => window.open(googleMapsUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver en Google Maps
                </Button>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {evento.descripcion && (
            <div>
              <h4 className="font-semibold mb-2">Descripción</h4>
              <p className="text-muted-foreground leading-relaxed">{evento.descripcion}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
