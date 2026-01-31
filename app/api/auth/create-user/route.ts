import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient as createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, password, nombre, rol } = await request.json()

    // Verificar que el usuario que hace la solicitud sea admin
    const supabaseServer = await createServerClient()
    const {
      data: { user },
    } = await supabaseServer.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: currentProfile } = await supabaseServer.from("profiles").select("rol").eq("id", user.id).single()

    if (!currentProfile || currentProfile.rol !== "admin") {
      return NextResponse.json({ error: "No tienes permisos para crear usuarios" }, { status: 403 })
    }

    // Usar el cliente de servicio para crear el usuario
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Crear el usuario con el admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Crear el perfil del usuario
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUser.user.id,
      email,
      nombre,
      rol,
      activo: true,
      created_by: user.id,
    })

    if (profileError) {
      // Si falla la creación del perfil, eliminar el usuario
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return NextResponse.json({ error: "Error al crear el perfil del usuario" }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: newUser.user.id })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
