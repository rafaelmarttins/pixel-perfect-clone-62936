import { Link, useRouterState } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { MODULES } from "@/lib/constants";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  const isActive = (url: string) =>
    url === "/" ? currentPath === "/" : currentPath === url || currentPath.startsWith(url + "/");

  const phase1 = MODULES.filter((m) => m.phase === 1);
  const upcoming = MODULES.filter((m) => m.phase !== 1);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-tight">DTI HUB</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Chapadão do Sul
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {phase1.map((m) => (
                <SidebarMenuItem key={m.id}>
                  <SidebarMenuButton asChild isActive={isActive(m.url)} tooltip={m.title}>
                    <Link to={m.url}>
                      <m.icon className="h-4 w-4" />
                      <span>{m.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Em breve</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {upcoming.map((m) => (
                <SidebarMenuItem key={m.id}>
                  <SidebarMenuButton
                    disabled
                    tooltip={`${m.title} — Fase ${m.phase}`}
                    className="opacity-50 cursor-not-allowed"
                  >
                    <m.icon className="h-4 w-4" />
                    <span>{m.title}</span>
                    {!collapsed && (
                      <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4">
                        F{m.phase}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}