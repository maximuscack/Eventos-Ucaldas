import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { HomeContent } from "@/components/home-content"
import type { Evento, Area } from "@/lib/types"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obtener eventos futuros (máximo 1 año)
  const today = new Date().toISOString().split("T")[0]
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
  const maxDate = oneYearFromNow.toISOString().split("T")[0]

  const { data: eventos } = await supabase
    .from("eventos")
    .select("*, areas(*)")
    .gte("fecha", today)
    .lte("fecha", maxDate)
    .order("fecha", { ascending: true })

  // Obtener áreas
  const { data: areas } = await supabase.from("areas").select("*").order("nombre")

  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated={!!user} />
      <main className="flex-1">
        <HeroSection />
        <HomeContent eventos={(eventos as Evento[]) || []} areas={(areas as Area[]) || []} />
      </main>
      <Footer />
    </div>
  )
}
