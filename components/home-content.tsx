"use client"

import { useState } from "react"
import { CalendarView } from "@/components/calendar/calendar-view"
import { EventSearch } from "@/components/events/event-search"
import { EventCard } from "@/components/events/event-card"
import { EventModal } from "@/components/events/event-modal"
import { SubscribeForm } from "@/components/subscribe-form"
import type { Evento, Area } from "@/lib/types"

interface HomeContentProps {
  eventos: Evento[]
  areas: Area[]
}

export function HomeContent({ eventos, areas }: HomeContentProps) {
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleEventClick = (evento: Evento) => {
    setSelectedEvento(evento)
    setModalOpen(true)
  }

  // Eventos destacados (próximos 6)
  const featuredEventos = eventos.slice(0, 6)

  return (
    <>
      {/* Sección de búsqueda */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-6">Buscar Eventos</h2>
          <EventSearch eventos={eventos} onEventClick={handleEventClick} />
        </div>
      </section>

      {/* Eventos destacados */}
      <section id="eventos" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Próximos Eventos</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Descubre las actividades más cercanas. Haz clic en cualquier evento para ver todos los detalles.
          </p>

          {featuredEventos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredEventos.map((evento) => (
                <EventCard key={evento.id} evento={evento} onClick={() => handleEventClick(evento)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-xl mb-12">
              <p className="text-lg text-muted-foreground">No hay eventos programados próximamente.</p>
              <p className="text-sm text-muted-foreground mt-2">¡Vuelve pronto para ver nuevas actividades!</p>
            </div>
          )}

          {/* Calendario */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-6">Calendario de Eventos</h3>
            <CalendarView eventos={eventos} areas={areas} onEventClick={handleEventClick} />
          </div>
        </div>
      </section>

      {/* Sección de suscripción */}
      <section id="suscribirse" className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">No te pierdas ningún evento</h2>
            <p className="text-white/80 mb-8">
              Suscríbete para recibir notificaciones sobre nuevos eventos y actividades en tu área de interés.
            </p>
            <div className="bg-white rounded-xl p-6 text-foreground">
              <SubscribeForm />
            </div>
          </div>
        </div>
      </section>

      {/* Modal de evento */}
      <EventModal evento={selectedEvento} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
