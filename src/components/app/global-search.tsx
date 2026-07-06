import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Loader2 } from "lucide-react";

type Hit = {
  id: string;
  title: string;
  category: string;
  status: string;
};

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setQ("");
      setHits([]);
    }
  }, [open]);

  useEffect(() => {
    let cancel = false;
    const term = q.trim();
    if (!term) {
      setHits([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const like = `%${term}%`;
      const { data } = await supabase
        .from("documentos")
        .select("id, title, category, status")
        .or(
          `title.ilike.${like},description.ilike.${like},content.ilike.${like},category.ilike.${like}`,
        )
        .limit(20);
      if (!cancel) {
        setHits((data as Hit[] | null) ?? []);
        setLoading(false);
      }
    }, 200);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Pesquisar documentos, tags, categorias…"
        value={q}
        onValueChange={setQ}
      />
      <CommandList>
        {loading && (
          <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Buscando…
          </div>
        )}
        {!loading && q && hits.length === 0 && (
          <CommandEmpty>Nenhum resultado.</CommandEmpty>
        )}
        {!loading && !q && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Digite para pesquisar em todos os documentos.
          </div>
        )}
        {hits.length > 0 && (
          <CommandGroup heading="Documentação">
            {hits.map((h) => (
              <CommandItem
                key={h.id}
                value={h.id + h.title}
                onSelect={() => {
                  onOpenChange(false);
                  navigate({ to: "/documentacao/$id", params: { id: h.id } });
                }}
              >
                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{h.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {h.category} · {h.status}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}