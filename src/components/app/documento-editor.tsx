import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIAS } from "@/lib/constants";
import { PageHeader } from "@/components/app/page-header";
import { Markdown } from "@/components/app/markdown";
import type { Documento, Attachment } from "@/lib/documentos";
import { toast } from "sonner";
import { Loader2, X, Upload, Link as LinkIcon, Plus } from "lucide-react";

type Props =
  | { mode: "create"; documento?: undefined; onSaved: (id: string) => void; onCancel: () => void }
  | { mode: "edit"; documento: Documento; onSaved: () => void; onCancel: () => void };

const PLACEHOLDER =
  "# Título\n\nEscreva em Markdown. Suporta **negrito**, listas, tabelas, blocos de codigo, imagens e checklists.\n\n- [ ] Item pendente\n- [x] Item concluido\n\n> Bloco de destaque\n";

export function DocumentoEditor(props: Props) {
  const qc = useQueryClient();
  const initial = props.documento;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<string>(initial?.category ?? "Outros");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<Documento["status"]>(initial?.status ?? "rascunho");
  const [attachments, setAttachments] = useState<Attachment[]>(initial?.attachments ?? []);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    setTags([...tags, t]);
    setTagInput("");
  }

  function addLink() {
    if (!linkUrl.trim()) return;
    setAttachments([
      ...attachments,
      { name: linkName.trim() || linkUrl, url: linkUrl.trim(), type: "link" },
    ]);
    setLinkName("");
    setLinkUrl("");
  }

  async function onUpload(file: File) {
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id ?? "anon";
      const path = `${uid}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("attachments").upload(path, file);
      if (error) throw error;
      const { data: signed, error: sErr } = await supabase.storage
        .from("attachments")
        .createSignedUrl(path, 60 * 60 * 24 * 365);
      if (sErr) throw sErr;
      setAttachments([
        ...attachments,
        { name: file.name, url: signed.signedUrl, type: "file" },
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao enviar arquivo.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!title.trim()) {
      toast.error("Informe um título.");
      return;
    }
    setSaving(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user?.id;
      if (!uid) throw new Error("Sem sessão.");

      const payload = {
        title: title.trim(),
        category,
        description: description.trim() || null,
        content,
        tags,
        status,
        attachments: attachments as unknown as never,
      };

      if (props.mode === "create") {
        const { data, error } = await supabase
          .from("documentos")
          .insert({ ...payload, author_id: uid })
          .select("id")
          .single();
        if (error) throw error;
        toast.success("Documento criado.");
        qc.invalidateQueries({ queryKey: ["documentos"] });
        props.onSaved(data.id);
      } else {
        const { error } = await supabase
          .from("documentos")
          .update(payload)
          .eq("id", initial!.id);
        if (error) throw error;
        toast.success("Documento atualizado.");
        qc.invalidateQueries({ queryKey: ["documentos"] });
        props.onSaved();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <PageHeader
        title={props.mode === "create" ? "Novo documento" : "Editar documento"}
        actions={
          <>
            <Button variant="outline" onClick={props.onCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Salvar
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Configuração do Firewall Sophos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição curta</Label>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Resumo em uma frase"
              />
            </div>
          </Card>

          <Card className="p-0">
            <Tabs defaultValue="edit" className="w-full">
              <div className="border-b border-border px-4 pt-3">
                <TabsList>
                  <TabsTrigger value="edit">Editar</TabsTrigger>
                  <TabsTrigger value="preview">Pré-visualizar</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="edit" className="p-0 m-0">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[420px] rounded-none border-0 font-mono text-sm focus-visible:ring-0"
                  placeholder={PLACEHOLDER}
                />
              </TabsContent>
              <TabsContent value="preview" className="p-6 min-h-[420px]">
                <Markdown content={content} />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as Documento["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Adicionar tag"
                />
                <Button type="button" variant="outline" size="icon" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      #{t}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((x) => x !== t))}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <Label>Anexos</Label>
            <label className="flex items-center justify-center gap-2 h-10 border border-dashed border-border rounded-md text-sm text-muted-foreground hover:border-primary hover:text-foreground cursor-pointer transition">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{uploading ? "Enviando…" : "Enviar arquivo"}</span>
              <input
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                  e.target.value = "";
                }}
              />
            </label>

            <div className="space-y-1.5 pt-1">
              <Input
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                placeholder="Nome (opcional)"
                className="text-sm"
              />
              <div className="flex gap-1">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://…"
                  className="text-sm"
                />
                <Button type="button" variant="outline" size="icon" onClick={addLink}>
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {attachments.length > 0 && (
              <ul className="space-y-1 pt-2 border-t border-border">
                {attachments.map((a, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-xs gap-2 py-1"
                  >
                    <span className="truncate">
                      {a.type === "link" ? "🔗" : "📎"} {a.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments(attachments.filter((_, idx) => idx !== i))
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}