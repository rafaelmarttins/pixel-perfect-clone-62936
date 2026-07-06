export const CATEGORIAS = [
  "Infraestrutura",
  "Rede",
  "VMware",
  "Firewall",
  "Backup",
  "Servidores",
  "Windows",
  "Linux",
  "Active Directory",
  "DNS",
  "DHCP",
  "GLPI",
  "Impressoras",
  "Internet",
  "Telefonia",
  "POP",
  "Projetos",
  "Contratos",
  "Fornecedores",
  "Segurança",
  "LGPD",
  "Compras",
  "Licitações",
  "Outros",
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export const STATUS_LABELS: Record<string, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  arquivado: "Arquivado",
};

import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  Server,
  Building2,
  FileSignature,
  Mail,
  FolderKanban,
  ListChecks,
  ShieldAlert,
  Users,
  BookOpen,
  Search,
} from "lucide-react";

export type ModuleItem = {
  id: string;
  title: string;
  url: string;
  icon: LucideIcon;
  phase: 1 | 2 | 3 | 4;
};

export const MODULES: ModuleItem[] = [
  { id: "dashboard", title: "Dashboard", url: "/", icon: LayoutDashboard, phase: 1 },
  { id: "documentacao", title: "Documentação", url: "/documentacao", icon: FileText, phase: 1 },
  { id: "infraestrutura", title: "Infraestrutura", url: "/infraestrutura", icon: Server, phase: 2 },
  { id: "fornecedores", title: "Fornecedores", url: "/fornecedores", icon: Building2, phase: 2 },
  { id: "contratos", title: "Contratos", url: "/contratos", icon: FileSignature, phase: 2 },
  { id: "memorandos", title: "Memorandos", url: "/memorandos", icon: Mail, phase: 3 },
  { id: "projetos", title: "Projetos", url: "/projetos", icon: FolderKanban, phase: 3 },
  { id: "pop", title: "POP", url: "/pop", icon: ListChecks, phase: 3 },
  { id: "incidentes", title: "Incidentes", url: "/incidentes", icon: ShieldAlert, phase: 4 },
  { id: "equipe", title: "Equipe", url: "/equipe", icon: Users, phase: 2 },
  { id: "diario", title: "Diário do Diretor", url: "/diario", icon: BookOpen, phase: 4 },
];

export const SearchIcon = Search;