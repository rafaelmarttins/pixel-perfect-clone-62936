import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getDocumento } from "@/lib/documentos";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Markdown } from "@/components/app/markdown";
import { DocumentoEditor } from "@/components/app/documento-editor";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Pencil, Trash2, Paperclip, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { STATUS_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/documentacao/$id")({
  component: DocumentoView,
});

function DocumentoView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: doc, isLoading } = useQuery({
    queryKey: ["documento", id],
    queryFn: () => getDocumento(id),
  });

  async function onDelete() {
    const { error } = await supabase.from("documentos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Documento excluído.");
    qc.invalidateQueries({ queryKey: ["documentos"] });
    navigate({ to: "/documentacao" });
  }

  if (isLoading) {
    return <div className="p-8 text-sm text-muted-foreground">Carregando…</div>;
  }
  if (!doc) {
    return (
      <div className="p-8">
        <p className="text-sm text-muted-foreground mb-4">Documento não encontrado.</p>
        <Button variant="outline" asChild>
          <Link to="/documentacao">
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Link>
        </Button>
      </div>
    );
  }

  if (editing) {
    return (
      <DocumentoEditor
        mode="edit"
        documento={doc}
        onSaved={() => {
          setEditing(false);
          qc.invalidateQueries({ queryKey: ["documento", id] });
          qc.invalidateQueries({ queryKey: ["documentos"] });
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
        <Link to="/documentacao">
          <ArrowLeft className="h-4 w-4 mr-1" /> Documentação
        </Link>
      </Button>

      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="outline">{doc.category}</Badge>
            <Badge variant={doc.status === "publicado" ? "default" : "outline"}>
              {STATUS_LABELS[doc.status]}
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
          {doc.description && (
            <p className="text-muted-foreground mt-2">{doc.description}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-1" /> Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir documento?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação é permanente. O documento e seus anexos vinculados serão perdidos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-6">
        Atualizado em{" "}
        {format(new Date(doc.updated_at), "d 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
      </p>

      {doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {doc.tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <Card className="p-6 md:p-8 mb-6">
        <Markdown content={doc.content} />
      </Card>

      {doc.attachments.length > 0 && (
        <Card className="p-5 mb-6">
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Paperclip className="h-4 w-4" /> Anexos
          </h2>
          <ul className="space-y-1.5">
            {doc.attachments.map((a, i) => (
              <li key={i}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  {a.name}
                  <span className="text-xs text-muted-foreground">
                    ({a.type === "link" ? "URL" : "arquivo"})
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-5 border-dashed">
        <h2 className="text-sm font-semibold mb-2">Relacionamentos</h2>
        <p className="text-xs text-muted-foreground">
          Ligações a Contratos, Fornecedores, Infraestrutura, Projetos e outros ficarão
          disponíveis nas Fases 2 e 3.
        </p>
      </Card>
    </div>
  );
}