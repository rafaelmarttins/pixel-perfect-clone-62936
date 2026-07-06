import { type ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { GlobalSearch } from "@/components/app/global-search";
import { Button } from "@/components/ui/button";
import { Search, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [email, setEmail] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada.");
    navigate({ to: "/auth" });
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border flex items-center gap-2 px-4 sticky top-0 bg-background/80 backdrop-blur z-10">
            <SidebarTrigger />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex-1 max-w-md flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/40 text-sm text-muted-foreground hover:bg-muted transition"
            >
              <Search className="h-4 w-4" />
              <span>Pesquisar em tudo…</span>
              <kbd className="ml-auto text-xs bg-background border border-border px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </button>
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[180px]">
              {email}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </header>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}