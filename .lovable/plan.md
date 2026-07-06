
# DTI HUB — Plano de Construção

Sistema de memória institucional da DTI (Prefeitura de Chapadão do Sul). UI em **Português (Brasil)**, tema escuro minimalista inspirado em Linear/Notion, cor primária `#1F3864`.

Vou seguir a **ordem de build** definida no próprio prompt e entregar a **Fase 1** completa e polida antes de expandir.

## Fase 1 — Escopo desta entrega

1. **Design system** (dark, minimal, azul `#1F3864`, verde discreto para status positivo, tipografia limpa, sidebar navegável).
2. **Backend Lovable Cloud** (Supabase gerenciado) com:
   - Auth de usuário único (Rafael) já preparado para multi-user futuro via tabela `user_roles` (`diretor` | `tecnico` | `estagio`).
   - Tabela `documentos` com todos os campos do Módulo 2.
   - Tabela genérica `relationships` (polimórfica: `from_type/from_id ↔ to_type/to_id`) para suportar M:N entre qualquer entidade futura.
   - Storage bucket `attachments` para anexos.
   - RLS habilitado com policies + GRANTs corretos.
3. **Módulo Documentação** completo:
   - Listagem com filtros por categoria, tag, status, autor.
   - Criar/editar com editor Markdown (headings, negrito, itálico, listas, checklists, tabelas, code blocks, callouts, imagens, links) + preview.
   - 23 categorias pré-definidas conforme spec.
   - Tags multi-select livre, status Rascunho/Publicado/Arquivado.
   - Anexos (upload + URL externa).
   - Seção "Relacionamentos" (pronta para ligar a outras entidades — visível já com placeholder até Fase 2).
4. **Pesquisa Global** (`Cmd/Ctrl+K`):
   - Command palette buscando título, conteúdo, tags, categoria, autor.
   - Filtros por módulo (só Documentação nesta fase) e por data.
5. **Dashboard básico**:
   - Documentos atualizados recentemente (últimos 5).
   - Últimos acessos / atividade.
   - Atalhos rápidos.
   - (Cards de contratos, projetos, memorandos ficam com placeholder "Disponível na Fase 2/3".)
6. **Shell da aplicação**:
   - Sidebar com todos os 12 módulos (os das fases futuras aparecem desabilitados com badge "Em breve", para dar visão do todo desde já).
   - Header com busca global e usuário.
   - Layout responsivo, PWA-ready (manifest + meta tags; service worker fica para depois se necessário).

## Fora do escopo desta fase (conforme o próprio prompt)

- Fase 2: Infraestrutura, Fornecedores, Contratos, engine de Relacionamentos navegáveis end-to-end.
- Fase 3: POP, Projetos, Memorandos.
- Fase 4: Incidentes, Diário do Diretor, Dashboard completo com alertas de vencimento.

Os dados de pré-população citados (hosts ESXi, Sophos, DataCor, ransomware, equipe, projetos) entrarão nas respectivas fases via migration seed.

## Notas técnicas

- Stack: TanStack Start + React 19 + Tailwind v4 + shadcn (já no template).
- Backend: **Lovable Cloud** (habilitado no início).
- Auth: email/senha via Lovable Cloud; primeiro signup = Rafael. Tabela `user_roles` separada, função `has_role()` `SECURITY DEFINER`, RLS baseada nela.
- Markdown editor: `@uiw/react-md-editor` (leve, dark-mode friendly) + `react-markdown` + `remark-gfm` para render.
- Rotas TanStack: `/` (dashboard), `/documentacao`, `/documentacao/novo`, `/documentacao/$id`, `/auth`. Rotas privadas sob `_authenticated`.
- Design tokens em `src/styles.css` (oklch): background quase preto, superfícies em camadas, primary `#1F3864` convertido para oklch, accent verde sutil.

## Próximos passos após aprovação

1. Habilitar Lovable Cloud.
2. Criar migration (roles + documentos + relationships + storage + RLS/GRANTs).
3. Design system + shell (sidebar + header + command palette).
4. Auth + rota `_authenticated`.
5. Módulo Documentação (CRUD + editor + anexos).
6. Pesquisa Global e Dashboard básico.
7. Verificar build e navegação.

Confirma seguir com esta Fase 1?
