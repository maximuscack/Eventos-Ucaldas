"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, ImageIcon, Loader2, Upload, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import type { Area, Evento } from "@/lib/types"

interface EventoFormProps {
  areas: Area[]
  evento?: Evento
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
const MAX_DIMENSIONS = { width: 5000, height: 5000 }
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

export function EventoForm({ areas, evento }: EventoFormProps) {
  const router = useRouter()
  const isEditing = !!evento
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    nombre: evento?.nombre || "",
    descripcion: evento?.descripcion || "",
    lugar: evento?.lugar || "",
    ubicacion_lat: evento?.ubicacion_lat?.toString() || "",
    ubicacion_lng: evento?.ubicacion_lng?.toString() || "",
    fecha: evento?.fecha || "",
    hora: evento?.hora || "",
    imagen_url: evento?.imagen_url || "",
    area_id: evento?.area_id || "",
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(evento?.imagen_url || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Formato no válido. Solo se permiten PNG, JPG o WebP")
        resolve(false)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setError(`El archivo es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`)
        resolve(false)
        return
      }

      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        if (img.width > MAX_DIMENSIONS.width || img.height > MAX_DIMENSIONS.height) {
          setError(`Imagen muy grande. Máximo ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} píxeles`)
          resolve(false)
        } else {
          resolve(true)
        }
      }
      img.onerror = () => {
        setError("No se pudo validar la imagen")
        resolve(false)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    const isValid = await validateImage(file)
    
    if (isValid) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    } else {
      e.target.value = ""
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `eventos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("imagenes")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        })

      if (uploadError) {
        // Si el bucket no existe, usar URL de datos base64
        const reader = new FileReader()
        return new Promise((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.readAsDataURL(file)
        })
      }

      const { data: urlData } = supabase.storage
        .from("imagenes")
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch {
      // Fallback: convertir a base64 data URL
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onloadend = () => {
          resolve(reader.result as string)
        }
        reader.readAsDataURL(file)
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    setFormData({ ...formData, imagen_url: "" })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("No autenticado")

      let finalImageUrl = formData.imagen_url

      // Si hay un archivo nuevo, subirlo
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile)
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl
        }
      }

      const eventData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        lugar: formData.lugar,
        ubicacion_lat: formData.ubicacion_lat ? Number.parseFloat(formData.ubicacion_lat) : null,
        ubicacion_lng: formData.ubicacion_lng ? Number.parseFloat(formData.ubicacion_lng) : null,
        fecha: formData.fecha,
        hora: formData.hora,
        imagen_url: finalImageUrl || null,
        area_id: formData.area_id || null,
        created_by: user.id,
        updated_at: new Date().toISOString(),
      }

      console.log("[v0] Intentando guardar evento:", eventData)

      if (isEditing) {
        const { error: updateError } = await supabase.from("eventos").update(eventData).eq("id", evento.id)
        if (updateError) {
          console.log("[v0] Error al actualizar:", updateError)
          throw new Error(`Error al actualizar: ${updateError.message} (${updateError.code})`)
        }
      } else {
        const { error: insertError } = await supabase.from("eventos").insert(eventData)
        if (insertError) {
          console.log("[v0] Error al insertar:", insertError)
          throw new Error(`Error al crear evento: ${insertError.message} (${insertError.code})`)
        }
      }

      router.push("/dashboard/eventos")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el evento")
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular fecha mínima (hoy) y máxima (1 año)
  const today = new Date().toISOString().split("T")[0]
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 1)
  const maxDateStr = maxDate.toISOString().split("T")[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Evento" : "Información del Evento"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del evento *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Concierto de música clásica"
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe el evento..."
              rows={4}
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  min={today}
                  max={maxDateStr}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Lugar */}
          <div className="space-y-2">
            <Label htmlFor="lugar">Lugar *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="lugar"
                value={formData.lugar}
                onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                placeholder="Ej: Teatro Municipal, Calle Principal 123"
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Coordenadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ubicacion_lat">Latitud (opcional)</Label>
              <Input
                id="ubicacion_lat"
                type="number"
                step="any"
                value={formData.ubicacion_lat}
                onChange={(e) => setFormData({ ...formData, ubicacion_lat: e.target.value })}
                placeholder="Ej: 40.4168"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion_lng">Longitud (opcional)</Label>
              <Input
                id="ubicacion_lng"
                type="number"
                step="any"
                value={formData.ubicacion_lng}
                onChange={(e) => setFormData({ ...formData, ubicacion_lng: e.target.value })}
                placeholder="Ej: -3.7038"
              />
            </div>
          </div>

          {/* Área */}
          <div className="space-y-2">
            <Label htmlFor="area_id">Área responsable</Label>
            <Select value={formData.area_id} onValueChange={(value) => setFormData({ ...formData, area_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                      {area.nombre}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Imagen - Subida de archivo */}
          <div className="space-y-2">
            <Label>Imagen del evento (opcional)</Label>
            <Alert className="mb-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Formatos: PNG, JPG, WebP. Tamaño máximo: 25MB. Dimensiones máximas: 5000x5000 píxeles.
              </AlertDescription>
            </Alert>
            
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Vista previa"
                  className="max-w-full max-h-48 rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Haz clic para subir una imagen</p>
                <p className="text-xs text-muted-foreground">PNG, JPG o WebP (máx. 25MB, 5000x5000px)</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Opción alternativa: URL */}
            <div className="mt-4 pt-4 border-t">
              <Label htmlFor="imagen_url" className="text-sm text-muted-foreground">O ingresa una URL de imagen</Label>
              <div className="relative mt-2">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="imagen_url"
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => {
                    setFormData({ ...formData, imagen_url: e.target.value })
                    if (e.target.value) {
                      setImagePreview(e.target.value)
                      setImageFile(null)
                    }
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isUploading}>
              {isLoading || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? "Subiendo imagen..." : "Guardando..."}
                </>
              ) : isEditing ? (
                "Guardar Cambios"
              ) : (
                "Crear Evento"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
