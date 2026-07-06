import { supabase } from "@/integrations/supabase/client";

export type Attachment = {
  name: string;
  url: string;
  type: "file" | "link";
};

export type Documento = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  content: string;
  tags: string[];
  status: "rascunho" | "publicado" | "arquivado";
  attachments: Attachment[];
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export async function listDocumentos() {
  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Documento[];
}

export async function getDocumento(id: string) {
  const { data, error } = await supabase.from("documentos").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as unknown as Documento | null;
}

export async function recentDocumentos(limit = 5) {
  const { data, error } = await supabase
    .from("documentos")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as Documento[];
}