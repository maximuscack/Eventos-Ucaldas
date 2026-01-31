"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Eye, Calendar, MapPin } from "lucide-react"
import { formatDate, formatTime } from "@/lib/utils/date"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import type { Evento } from "@/lib/types"

interface EventosTableProps {
  eventos: Evento[]
}

export function EventosTable({ eventos }: EventosTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    try {
      const supabase = createClient()
      await supabase.from("eventos").delete().eq("id", deleteId)
      router.refresh()
    } catch (error) {
      console.error("Error deleting event:", error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (eventos.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay eventos</h3>
        <p className="text-muted-foreground mb-4">Comienza creando tu primer evento</p>
        <Link href="/dashboard/eventos/nuevo">
          <Button>Crear Evento</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead>Área</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventos.map((evento) => (
              <TableRow key={evento.id}>
                <TableCell className="font-medium">{evento.nombre}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(evento.fecha, "d MMM yyyy")}
                  </div>
                </TableCell>
                <TableCell>{formatTime(evento.hora)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{evento.lugar}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {evento.areas && (
                    <Badge
                      style={{
                        backgroundColor: evento.areas.color,
                        color: "#fff",
                      }}
                    >
                      {evento.areas.nombre}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/dashboard/eventos/${evento.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/eventos/${evento.id}/editar`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(evento.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
