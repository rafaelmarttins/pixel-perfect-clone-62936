import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listDocumentos } from "@/lib/documentos";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS, STATUS_LABELS } from "@/lib/constants";
import { FileText, Plus, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/documentacao/")({
  component: DocumentacaoList,
});

function DocumentacaoList() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["documentos", "all"],
    queryFn: listDocumentos,
  });

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((d) => {
      if (cat !== "all" && d.category !== cat) return false;
      if (status !== "all" && d.status !== status) return false;
      if (term) {
        const hay = `${d.title} ${d.description ?? ""} ${d.content} ${d.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [data, q, cat, status]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Documentação"
        description="Base de conhecimento da DTI — infraestrutura, procedimentos, decisões."
        actions={
          <Button asChild>
            <Link to="/documentacao/novo">
              <Plus className="h-4 w-4 mr-1" /> Novo
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por título, conteúdo, tag…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="md:w-56">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {CATEGORIAS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="rascunho">Rascunho</SelectItem>
            <SelectItem value="publicado">Publicado</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && (
        <div className="py-16 text-center text-muted-foreground text-sm">Carregando…</div>
      )}

      {!isLoading && filtered.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            {data.length === 0
              ? "Nenhum documento criado ainda."
              : "Nenhum documento corresponde aos filtros."}
          </p>
          {data.length === 0 && (
            <Button asChild className="mt-4">
              <Link to="/documentacao/novo">
                <Plus className="h-4 w-4 mr-1" /> Criar primeiro documento
              </Link>
            </Button>
          )}
        </Card>
      )}

      <div className="grid gap-3">
        {filtered.map((d) => (
          <Link
            key={d.id}
            to="/documentacao/$id"
            params={{ id: d.id }}
            className="group block"
          >
            <Card className="p-4 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate group-hover:text-primary transition">
                      {d.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {d.category}
                    </Badge>
                  </div>
                  {d.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {d.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {d.tags.slice(0, 5).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                      >
                        #{t}
                      </span>
                    ))}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDistanceToNow(new Date(d.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={d.status === "publicado" ? "default" : "outline"}
                  className="shrink-0"
                >
                  {STATUS_LABELS[d.status]}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}