
-- 1. Fix handle_new_user: always default to 'cliente', ignore user-supplied tipo_usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, cpf, telefone, tipo_usuario)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    'cliente'
  );
  RETURN NEW;
END;
$$;

-- 2. Fix self-update policy: prevent users from changing their own tipo_usuario
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND tipo_usuario = (SELECT tipo_usuario FROM public.profiles WHERE id = auth.uid()));

-- 3. Add admin-only INSERT policy for expansion_points
CREATE POLICY "Admin insert expansion points"
ON public.expansion_points
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- 4. Add admin-only UPDATE policy for expansion_points
CREATE POLICY "Admin update expansion points"
ON public.expansion_points
FOR UPDATE
USING (is_admin(auth.uid()));
