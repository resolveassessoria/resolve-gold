
-- 1. Simplify profile self-update policy (prevent_role_change trigger handles role protection)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Explicit admin-only INSERT/DELETE for indications
CREATE POLICY "Admin insert indications"
ON public.indications
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin delete indications"
ON public.indications
FOR DELETE
USING (is_admin(auth.uid()));

-- 3. Create audit_logs table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_table text,
  target_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "Admin read audit logs"
ON public.audit_logs
FOR SELECT
USING (is_admin(auth.uid()));

-- Authenticated users can insert (for logging their own actions)
CREATE POLICY "Authenticated insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Index for fast queries
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- 4. Audit trigger for profile role changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.tipo_usuario IS DISTINCT FROM NEW.tipo_usuario THEN
    INSERT INTO public.audit_logs (user_id, action, target_table, target_id, metadata)
    VALUES (auth.uid(), 'role_change', 'profiles', NEW.id::text,
      jsonb_build_object('old_role', OLD.tipo_usuario::text, 'new_role', NEW.tipo_usuario::text));
  END IF;
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (user_id, action, target_table, target_id, metadata)
    VALUES (auth.uid(), 'status_change', 'profiles', NEW.id::text,
      jsonb_build_object('old_status', OLD.status::text, 'new_status', NEW.status::text));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_profile_changes_trigger
AFTER UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.audit_profile_changes();

-- 5. Audit trigger for KYC status changes
CREATE OR REPLACE FUNCTION public.audit_kyc_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_logs (user_id, action, target_table, target_id, metadata)
    VALUES (auth.uid(), 'kyc_' || NEW.status::text, 'kyc_documents', NEW.id::text,
      jsonb_build_object('document_type', NEW.document_type, 'user_id', NEW.user_id::text));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_kyc_changes_trigger
AFTER UPDATE ON public.kyc_documents
FOR EACH ROW
EXECUTE FUNCTION public.audit_kyc_changes();

-- 6. Validate KYC document file extensions
CREATE OR REPLACE FUNCTION public.validate_kyc_document()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  ext text;
BEGIN
  ext := lower(split_part(NEW.file_url, '.', array_length(string_to_array(NEW.file_url, '.'), 1)));
  IF ext NOT IN ('pdf', 'jpg', 'jpeg', 'png', 'webp') THEN
    RAISE EXCEPTION 'Tipo de arquivo não permitido: %. Use PDF, JPG, PNG ou WEBP.', ext;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_kyc_document_trigger
BEFORE INSERT ON public.kyc_documents
FOR EACH ROW
EXECUTE FUNCTION public.validate_kyc_document();
