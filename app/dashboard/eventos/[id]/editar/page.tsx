import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventoForm } from "@/components/dashboard/evento-form"
import type { Area, Evento } from "@/lib/types"

export default async function EditarEventoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: evento }, { data: areas }] = await Promise.all([
    supabase.from("eventos").select("*, areas(*)").eq("id", id).single(),
    supabase.from("areas").select("*").order("nombre"),
  ])

  if (!evento) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Editar Evento</h1>
        <p className="text-muted-foreground">Modifica la información del evento</p>
      </div>

      <EventoForm evento={evento as Evento} areas={(areas as Area[]) || []} />
    </div>
  )
}
