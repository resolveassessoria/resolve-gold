
-- Fix 1: Tighten profiles self-update to prevent tipo_usuario/status changes
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND tipo_usuario = (SELECT p.tipo_usuario FROM public.profiles p WHERE p.id = auth.uid())
    AND status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Fix 2: Remove user-facing audit log insert policy (auditing via SECURITY DEFINER functions only)
DROP POLICY IF EXISTS "Authenticated insert audit logs" ON public.audit_logs;

-- Allow service-role and security-definer functions to insert (no direct user access)
-- Audit inserts come from: audit_profile_changes, audit_kyc_changes, audit_admin_role_changes triggers
-- and edge functions using service_role key
