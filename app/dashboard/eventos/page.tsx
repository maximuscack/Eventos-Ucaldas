import { createClient } from "@/lib/supabase/server"
import { EventosTable } from "@/components/dashboard/eventos-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { Evento } from "@/lib/types"

export default async function EventosPage() {
  const supabase = await createClient()

  const { data: eventos } = await supabase.from("eventos").select("*, areas(*)").order("fecha", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-muted-foreground">Gestiona todos los eventos del calendario</p>
        </div>
        <Link href="/dashboard/eventos/nuevo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Evento
          </Button>
        </Link>
      </div>

      <EventosTable eventos={(eventos as Evento[]) || []} />
    </div>
  )
}
