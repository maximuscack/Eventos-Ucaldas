"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { Area } from "@/lib/types"

interface AreasManagerProps {
  areas: Area[]
}

const COLORS = [
  "#E94E77",
  "#4A90E2",
  "#F5A623",
  "#50C878",
  "#9B59B6",
  "#E85D04",
  "#1B365D",
  "#C4A962",
]

export function AreasManager({ areas: initialAreas }: AreasManagerProps) {
  const router = useRouter()
  const [areas, setAreas] = useState(initialAreas)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingArea, setEditingArea] = useState<Area | null>(null)
  const [deleteArea, setDeleteArea] = useState<Area | null>(null)
  const [formData, setFormData] = useState({ nombre: "", color: COLORS[0] })
  const [error, setError] = useState("")

  const resetForm = () => {
    setFormData({ nombre: "", color: COLORS[0] })
    setEditingArea(null)
    setError("")
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) resetForm()
  }

  const handleEdit = (area: Area) => {
    setEditingArea(area)
    setFormData({ nombre: area.nombre, color: area.color })
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (editingArea) {
        const { error: updateError } = await supabase
          .from("areas")
          .update({ nombre: formData.nombre, color: formData.color })
          .eq("id", editingArea.id)

        if (updateError) throw updateError

        setAreas(
          areas.map((a) =>
            a.id === editingArea.id
              ? { ...a, nombre: formData.nombre, color: formData.color }
              : a
          )
        )
      } else {
        const { data, error: insertError } = await supabase
          .from("areas")
          .insert({ nombre: formData.nombre, color: formData.color })
          .select()
          .single()

        if (insertError) throw insertError

        setAreas([...areas, data])
      }

      setIsOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el área")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteArea) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("areas").delete().eq("id", deleteArea.id)

      if (error) throw error

      setAreas(areas.filter((a) => a.id !== deleteArea.id))
      setDeleteArea(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el área")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Área
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingArea ? "Editar Área" : "Nueva Área"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del área</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  placeholder="Ej: Expresiones culturales y artísticas"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        formData.color === color
                          ? "border-foreground scale-110"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingArea ? "Guardar Cambios" : "Crear Área"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha de Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {areas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hay áreas registradas
                  </TableCell>
                </TableRow>
              ) : (
                areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell>
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: area.color }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{area.nombre}</TableCell>
                    <TableCell>
                      {new Date(area.created_at).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(area)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteArea(area)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteArea} onOpenChange={() => setDeleteArea(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar área?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los eventos asociados a esta área
              perderán su categorización.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
