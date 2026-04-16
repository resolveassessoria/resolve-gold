
-- Create admin sub-role enum
CREATE TYPE public.admin_role AS ENUM ('admin_kyc', 'admin_financeiro', 'admin_suporte', 'admin_full');

-- Create admin_roles table (follows user-roles pattern)
CREATE TABLE public.admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin roles
CREATE POLICY "Admin read admin_roles"
  ON public.admin_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_admin(auth.uid()));

CREATE POLICY "Admin full manage admin_roles"
  ON public.admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admin full delete admin_roles"
  ON public.admin_roles FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Security definer function to check admin sub-roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_admin_role(_user_id uuid, _role admin_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_roles
    WHERE user_id = _user_id AND (role = _role OR role = 'admin_full')
  )
$$;

-- Audit trigger for admin role changes
CREATE OR REPLACE FUNCTION public.audit_admin_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, target_table, target_id, metadata)
    VALUES (auth.uid(), 'admin_role_assigned', 'admin_roles', NEW.user_id::text,
      jsonb_build_object('role', NEW.role::text));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, target_table, target_id, metadata)
    VALUES (auth.uid(), 'admin_role_removed', 'admin_roles', OLD.user_id::text,
      jsonb_build_object('role', OLD.role::text));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_audit_admin_roles
  AFTER INSERT OR DELETE ON public.admin_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_admin_role_changes();
