-- Ensure profile auto-creation stays active even if the trigger was removed manually
-- and backfill profiles for users created while the trigger was missing.

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
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, nome, cpf, telefone, tipo_usuario)
SELECT
  auth_user.id,
  auth_user.email,
  COALESCE(auth_user.raw_user_meta_data->>'nome', ''),
  COALESCE(auth_user.raw_user_meta_data->>'cpf', ''),
  COALESCE(auth_user.raw_user_meta_data->>'telefone', ''),
  'cliente'::public.tipo_usuario
FROM auth.users AS auth_user
LEFT JOIN public.profiles AS profile ON profile.id = auth_user.id
WHERE profile.id IS NULL
ON CONFLICT (id) DO NOTHING;
