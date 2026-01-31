"use client"

import type React from "react"

import { useState } from "react"
import { Mail, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { validateEmail } from "@/lib/utils/validation"

export function SubscribeForm() {
  const [email, setEmail] = useState("")
  const [nombre, setNombre] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateEmail(email)) {
      setError("Por favor, ingresa un correo electrónico válido")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase.from("suscriptores").insert({ email, nombre: nombre || null })

      if (insertError) {
        if (insertError.code === "23505") {
          setError("Este correo ya está suscrito")
        } else {
          throw insertError
        }
      } else {
        setSuccess(true)
        setEmail("")
        setNombre("")
      }
    } catch (err) {
      setError("Ocurrió un error. Por favor, intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-lg text-green-800 mb-2">¡Suscripción exitosa!</h3>
        <p className="text-green-600">Recibirás notificaciones sobre nuevos eventos.</p>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => setSuccess(false)}>
          Suscribir otro correo
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          placeholder="Tu nombre (opcional)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="py-6"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-12 py-6"
            required
          />
        </div>
        <Button
          type="submit"
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Suscribirse"}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </form>
  )
}
