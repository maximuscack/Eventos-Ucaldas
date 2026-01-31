import Link from "next/link"
import { Calendar, Mail, MapPin, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo y descripción */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-accent p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold">EventosCalendar</span>
            </div>
            <p className="text-white/70 leading-relaxed">
              Tu plataforma para descubrir y gestionar eventos. Mantente informado sobre las actividades más
              importantes.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Enlaces Rápidos</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-white/70 hover:text-white transition-colors">
                Inicio
              </Link>
              <Link href="/#eventos" className="text-white/70 hover:text-white transition-colors">
                Ver Eventos
              </Link>
              <Link href="/#suscribirse" className="text-white/70 hover:text-white transition-colors">
                Suscribirse
              </Link>
              <Link href="/auth/login" className="text-white/70 hover:text-white transition-colors">
                Acceso Administrador
              </Link>
            </nav>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-white/70">
                <Mail className="h-5 w-5" />
                <span>info@eventoscalendar.com</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Phone className="h-5 w-5" />
                <span>+1 234 567 890</span>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <MapPin className="h-5 w-5" />
                <span>Ciudad, País</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} EventosCalendar. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
