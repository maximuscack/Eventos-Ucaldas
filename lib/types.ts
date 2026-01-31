export interface Area {
  id: string
  nombre: string
  color: string
  created_at: string
  created_by: string | null
}

export interface Evento {
  id: string
  nombre: string
  descripcion: string | null
  lugar: string
  ubicacion_lat: number | null
  ubicacion_lng: number | null
  fecha: string
  hora: string
  imagen_url: string | null
  area_id: string | null
  created_at: string
  updated_at: string
  created_by: string | null
  areas?: Area
}

export interface Profile {
  id: string
  email: string
  nombre: string | null
  activo: boolean
  created_at: string
  created_by: string | null
}

export interface Suscriptor {
  id: string
  email: string
  nombre: string | null
  activo: boolean
  created_at: string
}

export interface EventoVista {
  id: string
  evento_id: string
  visitor_id: string | null
  ip_hash: string | null
  user_agent: string | null
  created_at: string
}

export interface EventoInscripcion {
  id: string
  evento_id: string
  nombre: string
  email: string
  telefono: string | null
  created_at: string
}

export interface EventoEstadisticas {
  id: string
  nombre: string
  fecha: string
  area_nombre: string | null
  area_color: string | null
  total_vistas: number
  vistas_unicas: number
  total_inscripciones: number
}

export type ViewMode = "day" | "week" | "month"
