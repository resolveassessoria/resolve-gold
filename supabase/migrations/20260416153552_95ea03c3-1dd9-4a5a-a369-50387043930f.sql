
-- 1. Create trigger to prevent non-admin users from changing tipo_usuario
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.tipo_usuario IS DISTINCT FROM NEW.tipo_usuario THEN
    IF NOT is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_role_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_role_change();

-- 2. Add admin-only INSERT for marketplace_sales
CREATE POLICY "Admin insert marketplace sales"
ON public.marketplace_sales
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- 3. Add admin UPDATE and DELETE policies for kyc-documents storage
CREATE POLICY "Admin can update kyc files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'kyc-documents' AND is_admin(auth.uid()));

CREATE POLICY "Admin can delete kyc files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'kyc-documents' AND is_admin(auth.uid()));

-- 4. Allow users to delete their own kyc files
CREATE POLICY "Users can delete own kyc files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
