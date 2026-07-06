import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DocumentoEditor } from "@/components/app/documento-editor";

export const Route = createFileRoute("/_authenticated/documentacao/novo")({
  component: NovoDocumento,
});

function NovoDocumento() {
  const navigate = useNavigate();
  return (
    <DocumentoEditor
      mode="create"
      onSaved={(id) => navigate({ to: "/documentacao/$id", params: { id } })}
      onCancel={() => navigate({ to: "/documentacao" })}
    />
  );
}