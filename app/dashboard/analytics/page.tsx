import { createClient } from "@/lib/supabase/server"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Obtener estadísticas de eventos
  const { data: eventos } = await supabase
    .from("eventos")
    .select(`
      id,
      nombre,
      fecha,
      areas (nombre, color)
    `)
    .order("fecha", { ascending: true })

  // Obtener vistas por evento
  const { data: vistas } = await supabase
    .from("evento_vistas")
    .select("evento_id, visitor_id, created_at")

  // Obtener inscripciones por evento
  const { data: inscripciones } = await supabase
    .from("evento_inscripciones")
    .select("evento_id, nombre, email, created_at")

  // Obtener áreas
  const { data: areas } = await supabase
    .from("areas")
    .select("id, nombre, color")

  // Obtener total de suscriptores
  const { count: totalSuscriptores } = await supabase
    .from("suscriptores")
    .select("*", { count: "exact", head: true })
    .eq("activo", true)

  // Procesar datos para estadísticas
  const eventosConStats = (eventos || []).map((evento) => {
    const eventVistas = (vistas || []).filter((v) => v.evento_id === evento.id)
    const eventInscripciones = (inscripciones || []).filter((i) => i.evento_id === evento.id)
    const visitantesUnicos = new Set(eventVistas.map((v) => v.visitor_id)).size

    return {
      ...evento,
      total_vistas: eventVistas.length,
      vistas_unicas: visitantesUnicos,
      total_inscripciones: eventInscripciones.length,
      inscripciones: eventInscripciones,
    }
  })

  // Estadísticas por área
  const statsPorArea = (areas || []).map((area) => {
    const eventosDeArea = eventosConStats.filter(
      (e) => e.areas?.nombre === area.nombre
    )
    return {
      nombre: area.nombre,
      color: area.color,
      total_eventos: eventosDeArea.length,
      total_vistas: eventosDeArea.reduce((acc, e) => acc + e.total_vistas, 0),
      total_inscripciones: eventosDeArea.reduce((acc, e) => acc + e.total_inscripciones, 0),
    }
  })

  // Estadísticas generales
  const statsGenerales = {
    total_eventos: eventos?.length || 0,
    total_vistas: vistas?.length || 0,
    vistas_unicas: new Set(vistas?.map((v) => v.visitor_id)).size,
    total_inscripciones: inscripciones?.length || 0,
    total_suscriptores: totalSuscriptores || 0,
  }

  // Vistas por día (últimos 30 días)
  const vistasPorDia = (vistas || []).reduce((acc, vista) => {
    const fecha = new Date(vista.created_at).toISOString().split("T")[0]
    acc[fecha] = (acc[fecha] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Inscripciones por día (últimos 30 días)
  const inscripcionesPorDia = (inscripciones || []).reduce((acc, insc) => {
    const fecha = new Date(insc.created_at).toISOString().split("T")[0]
    acc[fecha] = (acc[fecha] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">
          Estadísticas y análisis de eventos, visualizaciones e inscripciones
        </p>
      </div>

      <AnalyticsDashboard
        statsGenerales={statsGenerales}
        eventosConStats={eventosConStats}
        statsPorArea={statsPorArea}
        vistasPorDia={vistasPorDia}
        inscripcionesPorDia={inscripcionesPorDia}
      />
    </div>
  )
}
