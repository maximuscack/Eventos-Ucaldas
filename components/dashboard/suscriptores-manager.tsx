"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2, Download, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { Suscriptor } from "@/lib/types"

interface SuscriptoresManagerProps {
  suscriptores: Suscriptor[]
}

export function SuscriptoresManager({ suscriptores: initialSuscriptores }: SuscriptoresManagerProps) {
  const router = useRouter()
  const [suscriptores, setSuscriptores] = useState(initialSuscriptores)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteSuscriptor, setDeleteSuscriptor] = useState<Suscriptor | null>(null)
  const [formData, setFormData] = useState({ email: "", nombre: "" })
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredSuscriptores = suscriptores.filter(
    (s) =>
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData({ email: "", nombre: "" })
    setError("")
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from("suscriptores")
        .insert({
          email: formData.email,
          nombre: formData.nombre || null,
          activo: true,
        })
        .select()
        .single()

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("Este correo ya está registrado")
        }
        throw insertError
      }

      setSuscriptores([data, ...suscriptores])
      setIsOpen(false)
      resetForm()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el suscriptor")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteSuscriptor) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("suscriptores")
        .delete()
        .eq("id", deleteSuscriptor.id)

      if (error) throw error

      setSuscriptores(suscriptores.filter((s) => s.id !== deleteSuscriptor.id))
      setDeleteSuscriptor(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleActive = async (suscriptor: Suscriptor) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("suscriptores")
        .update({ activo: !suscriptor.activo })
        .eq("id", suscriptor.id)

      if (error) throw error

      setSuscriptores(
        suscriptores.map((s) =>
          s.id === suscriptor.id ? { ...s, activo: !s.activo } : s
        )
      )
    } catch (err) {
      console.error("Error al actualizar estado:", err)
    }
  }

  const exportCSV = () => {
    const activeEmails = suscriptores.filter((s) => s.activo)
    const csv = [
      ["Nombre", "Email", "Fecha de registro"],
      ...activeEmails.map((s) => [
        s.nombre || "",
        s.email,
        new Date(s.created_at).toLocaleDateString("es-ES"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `suscriptores_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const activosCount = suscriptores.filter((s) => s.activo).length

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Suscriptores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{suscriptores.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activosCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-muted-foreground">
              {suscriptores.length - activosCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          placeholder="Buscar por email o nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Suscriptor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Suscriptor</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre (opcional)</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Nombre completo"
                  />
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Agregar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuscriptores.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm
                      ? "No se encontraron suscriptores"
                      : "No hay suscriptores registrados"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuscriptores.map((suscriptor) => (
                  <TableRow key={suscriptor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {suscriptor.email}
                      </div>
                    </TableCell>
                    <TableCell>{suscriptor.nombre || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={suscriptor.activo ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleActive(suscriptor)}
                      >
                        {suscriptor.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(suscriptor.created_at).toLocaleDateString(
                        "es-ES"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteSuscriptor(suscriptor)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteSuscriptor}
        onOpenChange={() => setDeleteSuscriptor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar suscriptor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente a {deleteSuscriptor?.email}{" "}
              de la lista de suscriptores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
