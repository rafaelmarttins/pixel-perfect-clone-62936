
-- ROLES
CREATE TYPE public.app_role AS ENUM ('diretor', 'tecnico', 'estagio');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'diretor'));

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));

  SELECT count(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'diretor');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'tecnico');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- UPDATED_AT
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- DOCUMENTOS
CREATE TYPE public.doc_status AS ENUM ('rascunho', 'publicado', 'arquivado');

CREATE TABLE public.documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text,
  content text DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  status public.doc_status NOT NULL DEFAULT 'rascunho',
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO authenticated;
GRANT ALL ON public.documentos TO service_role;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth users read documentos" ON public.documentos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth users create documentos" ON public.documentos FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Author or diretor update" ON public.documentos FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'diretor'))
  WITH CHECK (auth.uid() = author_id OR public.has_role(auth.uid(), 'diretor'));
CREATE POLICY "Author or diretor delete" ON public.documentos FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.has_role(auth.uid(), 'diretor'));

CREATE TRIGGER trg_documentos_updated
  BEFORE UPDATE ON public.documentos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX documentos_category_idx ON public.documentos(category);
CREATE INDEX documentos_status_idx ON public.documentos(status);
CREATE INDEX documentos_updated_idx ON public.documentos(updated_at DESC);
CREATE INDEX documentos_tags_idx ON public.documentos USING GIN(tags);

-- RELATIONSHIPS
CREATE TABLE public.relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_type text NOT NULL,
  from_id uuid NOT NULL,
  to_type text NOT NULL,
  to_id uuid NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_type, from_id, to_type, to_id)
);
GRANT SELECT, INSERT, DELETE ON public.relationships TO authenticated;
GRANT ALL ON public.relationships TO service_role;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth read relationships" ON public.relationships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth create relationships" ON public.relationships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Auth delete relationships" ON public.relationships FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'diretor'));

CREATE INDEX relationships_from_idx ON public.relationships(from_type, from_id);
CREATE INDEX relationships_to_idx ON public.relationships(to_type, to_id);

-- STORAGE POLICIES for 'attachments' bucket
CREATE POLICY "Auth read attachments" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'attachments');
CREATE POLICY "Auth upload attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "Auth update own attachments" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'attachments' AND auth.uid() = owner);
CREATE POLICY "Auth delete own attachments" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'attachments' AND (auth.uid() = owner OR public.has_role(auth.uid(), 'diretor')));
