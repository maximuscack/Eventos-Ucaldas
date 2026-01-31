import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AreasManager } from "@/components/dashboard/areas-manager"

export default async function AreasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener todas las áreas
  const { data: areas } = await supabase
    .from("areas")
    .select("*")
    .order("nombre", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Áreas</h1>
        <p className="text-muted-foreground">
          Administra las áreas responsables de los eventos
        </p>
      </div>

      <AreasManager areas={areas || []} />
    </div>
  )
}
