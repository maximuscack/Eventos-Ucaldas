import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventoDetail } from "@/components/dashboard/evento-detail"
import type { Evento } from "@/lib/types"

export default async function EventoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: evento } = await supabase.from("eventos").select("*, areas(*)").eq("id", id).single()

  if (!evento) {
    notFound()
  }

  return <EventoDetail evento={evento as Evento} />
}
