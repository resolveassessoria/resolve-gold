
-- Create enums
CREATE TYPE public.tipo_usuario AS ENUM ('cliente', 'fomentador', 'corretor', 'franqueado', 'admin');
CREATE TYPE public.status_type AS ENUM ('pendente', 'aprovado', 'rejeitado');
CREATE TYPE public.transaction_type AS ENUM ('cashback', 'royalty', 'comissao', 'investimento');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  tipo_usuario tipo_usuario NOT NULL DEFAULT 'cliente',
  status status_type NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Admin check function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND tipo_usuario = 'admin');
$$;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admin can update any profile" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));

-- KYC Documents
CREATE TABLE public.kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status status_type NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own kyc" ON public.kyc_documents FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Users insert own kyc" ON public.kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin update kyc" ON public.kyc_documents FOR UPDATE USING (public.is_admin(auth.uid()));

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo transaction_type NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  mes_referencia DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Admin insert transactions" ON public.transactions FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Indications
CREATE TABLE public.indications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indicador_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  indicado_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nivel INT NOT NULL CHECK (nivel BETWEEN 1 AND 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.indications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own indications" ON public.indications FOR SELECT USING (auth.uid() = indicador_id OR public.is_admin(auth.uid()));

-- Marketplace Products
CREATE TABLE public.marketplace_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  preco DECIMAL(12,2) NOT NULL,
  comissao_percentual DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.marketplace_products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage products" ON public.marketplace_products FOR ALL USING (public.is_admin(auth.uid()));

-- Marketplace Sales
CREATE TABLE public.marketplace_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corretor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.marketplace_products(id),
  valor DECIMAL(12,2) NOT NULL,
  comissao_recebida DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.marketplace_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sales" ON public.marketplace_sales FOR SELECT USING (auth.uid() = corretor_id OR public.is_admin(auth.uid()));

-- Expansion Points
CREATE TABLE public.expansion_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pontos INT NOT NULL DEFAULT 0,
  mes DATE NOT NULL,
  comprou_conteudo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.expansion_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own points" ON public.expansion_points FOR SELECT USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, cpf, telefone, tipo_usuario)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE((NEW.raw_user_meta_data->>'tipo_usuario')::tipo_usuario, 'cliente')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Storage bucket for KYC
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-documents', 'kyc-documents', false);
CREATE POLICY "Users upload own kyc docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users view own kyc docs" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin(auth.uid())));
