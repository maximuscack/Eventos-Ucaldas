import { createClient } from "@/lib/supabase/server"
import { EventoForm } from "@/components/dashboard/evento-form"
import type { Area } from "@/lib/types"

export default async function NuevoEventoPage() {
  const supabase = await createClient()

  const { data: areas } = await supabase.from("areas").select("*").order("nombre")

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Evento</h1>
        <p className="text-muted-foreground">Crea un nuevo evento para el calendario</p>
      </div>

      <EventoForm areas={(areas as Area[]) || []} />
    </div>
  )
}
