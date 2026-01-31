-- =====================================================
-- SCRIPT 005: ARREGLAR POLÍTICAS RLS DE EVENTOS
-- Permite que cualquier usuario autenticado pueda crear/editar eventos
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- Eliminar todas las políticas existentes de eventos
DROP POLICY IF EXISTS "eventos_select_public" ON eventos;
DROP POLICY IF EXISTS "eventos_insert_auth" ON eventos;
DROP POLICY IF EXISTS "eventos_update_auth" ON eventos;
DROP POLICY IF EXISTS "eventos_delete_auth" ON eventos;
DROP POLICY IF EXISTS "eventos_insert_admin" ON eventos;
DROP POLICY IF EXISTS "eventos_update_admin" ON eventos;
DROP POLICY IF EXISTS "eventos_delete_admin" ON eventos;
DROP POLICY IF EXISTS "Eventos visibles para todos" ON eventos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear eventos" ON eventos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar eventos" ON eventos;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar eventos" ON eventos;

-- Crear nuevas políticas sin restricción de rol
-- Cualquier persona puede VER eventos (público)
CREATE POLICY "eventos_public_select" 
ON eventos FOR SELECT 
USING (true);

-- Cualquier usuario AUTENTICADO puede CREAR eventos
CREATE POLICY "eventos_auth_insert" 
ON eventos FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Cualquier usuario AUTENTICADO puede ACTUALIZAR eventos
CREATE POLICY "eventos_auth_update" 
ON eventos FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Cualquier usuario AUTENTICADO puede ELIMINAR eventos
CREATE POLICY "eventos_auth_delete" 
ON eventos FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Verificar que RLS está habilitado
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Mostrar políticas actuales para verificar
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'eventos';
