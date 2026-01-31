"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Eye,
  Users,
  Calendar,
  Mail,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts"

interface EventoConStats {
  id: string
  nombre: string
  fecha: string
  areas: { nombre: string; color: string } | null
  total_vistas: number
  vistas_unicas: number
  total_inscripciones: number
  inscripciones: Array<{ nombre: string; email: string; created_at: string }>
}

interface StatsPorArea {
  nombre: string
  color: string
  total_eventos: number
  total_vistas: number
  total_inscripciones: number
}

interface StatsGenerales {
  total_eventos: number
  total_vistas: number
  vistas_unicas: number
  total_inscripciones: number
  total_suscriptores: number
}

interface AnalyticsDashboardProps {
  statsGenerales: StatsGenerales
  eventosConStats: EventoConStats[]
  statsPorArea: StatsPorArea[]
  vistasPorDia: Record<string, number>
  inscripcionesPorDia: Record<string, number>
}

export function AnalyticsDashboard({
  statsGenerales,
  eventosConStats,
  statsPorArea,
  vistasPorDia,
  inscripcionesPorDia,
}: AnalyticsDashboardProps) {
  // Preparar datos para gráficos
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split("T")[0]
  })

  const actividadPorDia = last30Days.map((fecha) => ({
    fecha: fecha.slice(5), // MM-DD
    vistas: vistasPorDia[fecha] || 0,
    inscripciones: inscripcionesPorDia[fecha] || 0,
  }))

  const dataPorArea = statsPorArea.map((area) => ({
    name: area.nombre.split(" ").slice(0, 2).join(" "),
    fullName: area.nombre,
    eventos: area.total_eventos,
    vistas: area.total_vistas,
    inscripciones: area.total_inscripciones,
    color: area.color,
  }))

  const topEventos = [...eventosConStats]
    .sort((a, b) => b.total_vistas - a.total_vistas)
    .slice(0, 10)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  return (
    <div className="space-y-6">
      {/* Cards de estadísticas generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Eventos
            </CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statsGenerales.total_eventos}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Vistas
            </CardTitle>
            <Eye className="h-5 w-5 text-chart-1" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{statsGenerales.total_vistas}</p>
            <p className="text-xs text-muted-foreground">
              {statsGenerales.vistas_unicas} visitantes únicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inscripciones
            </CardTitle>
            <Users className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statsGenerales.total_inscripciones}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suscriptores
            </CardTitle>
            <Mail className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statsGenerales.total_suscriptores}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tasa Conversión
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-chart-4" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {statsGenerales.total_vistas > 0
                ? (
                    (statsGenerales.total_inscripciones /
                      statsGenerales.total_vistas) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
            <p className="text-xs text-muted-foreground">
              Inscripciones / Vistas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de actividad por día */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Actividad Últimos 30 Días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={actividadPorDia}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vistas"
                  stroke="#4A90E2"
                  strokeWidth={2}
                  name="Vistas"
                />
                <Line
                  type="monotone"
                  dataKey="inscripciones"
                  stroke="#50C878"
                  strokeWidth={2}
                  name="Inscripciones"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos por área */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Barras por área */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataPorArea} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    labelFormatter={(label) =>
                      dataPorArea.find((d) => d.name === label)?.fullName || label
                    }
                  />
                  <Legend />
                  <Bar dataKey="vistas" fill="#4A90E2" name="Vistas" />
                  <Bar
                    dataKey="inscripciones"
                    fill="#50C878"
                    name="Inscripciones"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie chart de eventos por área */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Distribución de Eventos por Área
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPorArea}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, eventos }) => `${name}: ${eventos}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="eventos"
                  >
                    {dataPorArea.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de top eventos */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Eventos por Visualizaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Área</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Vistas</TableHead>
                <TableHead className="text-right">Únicos</TableHead>
                <TableHead className="text-right">Inscripciones</TableHead>
                <TableHead className="text-right">Conversión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topEventos.map((evento) => (
                <TableRow key={evento.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {evento.nombre}
                  </TableCell>
                  <TableCell>
                    {evento.areas ? (
                      <Badge
                        style={{ backgroundColor: evento.areas.color }}
                        className="text-white text-xs"
                      >
                        {evento.areas.nombre.split(" ").slice(0, 2).join(" ")}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{formatDate(evento.fecha)}</TableCell>
                  <TableCell className="text-right">
                    {evento.total_vistas}
                  </TableCell>
                  <TableCell className="text-right">
                    {evento.vistas_unicas}
                  </TableCell>
                  <TableCell className="text-right">
                    {evento.total_inscripciones}
                  </TableCell>
                  <TableCell className="text-right">
                    {evento.total_vistas > 0
                      ? (
                          (evento.total_inscripciones / evento.total_vistas) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lista de inscripciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Inscripciones Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Fecha Inscripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventosConStats
                .flatMap((evento) =>
                  evento.inscripciones.map((insc) => ({
                    ...insc,
                    evento_nombre: evento.nombre,
                  }))
                )
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .slice(0, 15)
                .map((insc, idx) => (
                  <TableRow key={`${insc.email}-${idx}`}>
                    <TableCell className="font-medium">{insc.nombre}</TableCell>
                    <TableCell>{insc.email}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {insc.evento_nombre}
                    </TableCell>
                    <TableCell>
                      {new Date(insc.created_at).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
