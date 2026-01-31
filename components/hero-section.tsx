import { Calendar, Users, Bell, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative gradient-header text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            Descubre los mejores <span className="text-accent">eventos</span> cerca de ti
          </h1>
          <p className="text-xl text-white/80 mb-8 leading-relaxed text-pretty">
            Tu calendario de eventos todo en uno. Encuentra actividades de cultura, deportes, educación y mucho más.
            Mantente informado sin necesidad de registrarte.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link href="#eventos">
              <Button size="lg" variant="secondary" className="gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Ver Eventos
              </Button>
            </Link>
            <Link href="#suscribirse">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-lg border-white/30 text-white hover:bg-white/10 bg-transparent"
              >
                <Bell className="h-5 w-5" />
                Recibir Notificaciones
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Calendar className="h-10 w-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Calendario Visual</h3>
              <p className="text-white/70 text-sm">
                Visualiza todos los eventos por día, semana o mes de forma intuitiva
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Users className="h-10 w-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Múltiples Áreas</h3>
              <p className="text-white/70 text-sm">Filtra por cultura, deportes, educación, arte y más</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <Bell className="h-10 w-10 text-accent mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Notificaciones</h3>
              <p className="text-white/70 text-sm">Suscríbete y recibe alertas de nuevos eventos</p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="flex justify-center mt-12 animate-bounce">
          <ArrowDown className="h-8 w-8 text-white/50" />
        </div>
      </div>
    </section>
  )
}
