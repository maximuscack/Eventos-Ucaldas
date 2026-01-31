import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UsuariosManager } from "@/components/dashboard/usuarios-manager"
import type { Profile } from "@/lib/types"

export default async function UsuariosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener todos los usuarios
  const { data: usuarios } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Visualiza los usuarios registrados en el sistema
        </p>
      </div>

      <UsuariosManager usuarios={(usuarios as Profile[]) || []} />
    </div>
  )
}
