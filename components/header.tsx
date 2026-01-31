"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, Menu, X, LogIn, User } from "lucide-react"

interface HeaderProps {
  isAuthenticated?: boolean
}

export function Header({ isAuthenticated = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="gradient-header sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-accent p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-white">EventosCalendar</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-white/80 hover:text-white transition-colors font-medium">
              Inicio
            </Link>
            <Link href="/#eventos" className="text-white/80 hover:text-white transition-colors font-medium">
              Eventos
            </Link>
            <Link href="/#suscribirse" className="text-white/80 hover:text-white transition-colors font-medium">
              Suscribirse
            </Link>

            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="secondary" className="gap-2">
                  <User className="h-4 w-4" />
                  Panel
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="secondary" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Iniciar Sesión
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <nav className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-white/80 hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/#eventos"
                className="text-white/80 hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Eventos
              </Link>
              <Link
                href="/#suscribirse"
                className="text-white/80 hover:text-white transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Suscribirse
              </Link>

              {isAuthenticated ? (
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full gap-2">
                    <User className="h-4 w-4" />
                    Panel
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full gap-2">
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
