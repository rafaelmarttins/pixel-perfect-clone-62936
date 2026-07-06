import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { recentDocumentos } from "@/lib/documentos";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import {
  FileText,
  Plus,
  Server,
  FileSignature,
  FolderKanban,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { STATUS_LABELS } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: recent = [], isLoading } = useQuery({
    queryKey: ["documentos", "recent"],
    queryFn: () => recentDocumentos(5),
  });

  const upcoming = [
    { icon: Server, label: "Infraestrutura", phase: "Fase 2" },
    { icon: FileSignature, label: "Contratos", phase: "Fase 2" },
    { icon: FolderKanban, label: "Projetos", phase: "Fase 3" },
    { icon: ShieldAlert, label: "Incidentes", phase: "Fase 4" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="Painel"
        description="Visão geral da memória institucional da DTI."
        actions={
          <Button asChild>
            <Link to="/documentacao/novo">
              <Plus className="h-4 w-4 mr-1" /> Novo documento
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold tracking-tight">
                Documentos atualizados recentemente
              </h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/documentacao">Ver todos</Link>
            </Button>
          </div>
          {isLoading && (
            <div className="py-8 text-sm text-muted-foreground text-center">Carregando…</div>
          )}
          {!isLoading && recent.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Nenhum documento ainda. Comece a construir a memória da DTI.
              </p>
              <Button asChild size="sm">
                <Link to="/documentacao/novo">
                  <Plus className="h-4 w-4 mr-1" /> Criar o primeiro
                </Link>
              </Button>
            </div>
          )}
          <ul className="divide-y divide-border">
            {recent.map((d) => (
              <li key={d.id}>
                <Link
                  to="/documentacao/$id"
                  params={{ id: d.id }}
                  className="flex items-center justify-between py-3 hover:bg-muted/40 -mx-2 px-2 rounded transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {d.category} ·{" "}
                      {formatDistanceToNow(new Date(d.updated_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={d.status === "publicado" ? "default" : "outline"}
                    className="ml-3 shrink-0"
                  >
                    {STATUS_LABELS[d.status]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight">Atalhos</h2>
          </div>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full justify-start" asChild>
              <Link to="/documentacao/novo">
                <Plus className="h-4 w-4 mr-2" /> Novo documento
              </Link>
            </Button>
            <Button variant="secondary" className="w-full justify-start" asChild>
              <Link to="/documentacao">
                <FileText className="h-4 w-4 mr-2" /> Toda a documentação
              </Link>
            </Button>
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Próximas fases
            </p>
            <ul className="space-y-2">
              {upcoming.map((u) => (
                <li key={u.label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <u.icon className="h-3.5 w-3.5" />
                    {u.label}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {u.phase}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}