-- Tighten admin permission management so only admin_full can grant/revoke
-- administrative access or change other users' main role.

CREATE OR REPLACE FUNCTION public.is_full_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_roles
    WHERE user_id = _user_id
      AND role = 'admin_full'
  );
$$;

DROP POLICY IF EXISTS "Admin full manage admin_roles" ON public.admin_roles;
CREATE POLICY "Admin full manage admin_roles"
  ON public.admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_full_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin full delete admin_roles" ON public.admin_roles;
CREATE POLICY "Admin full delete admin_roles"
  ON public.admin_roles FOR DELETE
  TO authenticated
  USING (public.is_full_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.tipo_usuario IS DISTINCT FROM NEW.tipo_usuario THEN
    IF auth.uid() IS NULL THEN
      RETURN NEW;
    END IF;

    IF NOT public.is_full_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only full admins can change user roles';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
