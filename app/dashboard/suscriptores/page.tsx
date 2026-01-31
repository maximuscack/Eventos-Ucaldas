import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SuscriptoresManager } from "@/components/dashboard/suscriptores-manager"

export default async function SuscriptoresPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener todos los suscriptores
  const { data: suscriptores } = await supabase
    .from("suscriptores")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Suscriptores</h1>
        <p className="text-muted-foreground">
          Gestiona la lista de correos para envío masivo de eventos
        </p>
      </div>

      <SuscriptoresManager suscriptores={suscriptores || []} />
    </div>
  )
}
