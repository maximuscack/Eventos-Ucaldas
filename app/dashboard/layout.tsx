import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Obtener nombre del perfil si existe
  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen flex bg-muted">
      <DashboardSidebar 
        userEmail={user.email || ""} 
        userName={profile?.nombre || user.email?.split("@")[0] || "Usuario"} 
      />
      <main className="flex-1 p-6 overflow-auto pt-16 lg:pt-6">{children}</main>
    </div>
  )
}
