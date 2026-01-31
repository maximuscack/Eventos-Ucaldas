import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Tag, Mail, TrendingUp, BarChart3, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Obtener estadísticas
  const today = new Date().toISOString().split("T")[0]

  const [
    { count: totalEventos },
    { count: eventosProximos },
    { count: totalAreas },
    { count: totalSuscriptores },
    { count: totalVistas },
    { count: totalInscripciones },
    { data: user },
  ] = await Promise.all([
    supabase.from("eventos").select("*", { count: "exact", head: true }),
    supabase.from("eventos").select("*", { count: "exact", head: true }).gte("fecha", today),
    supabase.from("areas").select("*", { count: "exact", head: true }),
    supabase.from("suscriptores").select("*", { count: "exact", head: true }).eq("activo", true),
    supabase.from("evento_vistas").select("*", { count: "exact", head: true }),
    supabase.from("evento_inscripciones").select("*", { count: "exact", head: true }),
    supabase.auth.getUser().then(({ data }) => data),
  ])

  const userName = user?.user?.email?.split("@")[0] || "Usuario"

  const stats = [
    {
      title: "Eventos Totales",
      value: totalEventos || 0,
      icon: Calendar,
      color: "bg-chart-1",
      href: "/dashboard/eventos",
    },
    {
      title: "Eventos Próximos",
      value: eventosProximos || 0,
      icon: TrendingUp,
      color: "bg-chart-2",
      href: "/dashboard/eventos",
    },
    {
      title: "Total Vistas",
      value: totalVistas || 0,
      icon: Eye,
      color: "bg-chart-3",
      href: "/dashboard/analytics",
    },
    {
      title: "Inscripciones",
      value: totalInscripciones || 0,
      icon: Users,
      color: "bg-chart-4",
      href: "/dashboard/analytics",
    },
    {
      title: "Áreas",
      value: totalAreas || 0,
      icon: Tag,
      color: "bg-chart-5",
      href: "/dashboard/areas",
    },
    {
      title: "Suscriptores",
      value: totalSuscriptores || 0,
      icon: Mail,
      color: "bg-primary",
      href: "/dashboard/suscriptores",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido, {userName}</p>
        </div>
        <Link href="/dashboard/eventos/nuevo">
          <Button className="gap-2">
            <Calendar className="h-4 w-4" />
            Nuevo Evento
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/eventos/nuevo">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 bg-transparent">
                <Calendar className="h-6 w-6" />
                <span>Crear Evento</span>
              </Button>
            </Link>
            <Link href="/dashboard/eventos">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 bg-transparent">
                <TrendingUp className="h-6 w-6" />
                <span>Ver Eventos</span>
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 bg-transparent">
                <BarChart3 className="h-6 w-6" />
                <span>Ver Analytics</span>
              </Button>
            </Link>
            <Link href="/dashboard/suscriptores">
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 bg-transparent">
                <Mail className="h-6 w-6" />
                <span>Suscriptores</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
