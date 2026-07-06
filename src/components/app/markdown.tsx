import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-dti">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content || "*Sem conteúdo.*"}
      </ReactMarkdown>
    </div>
  );
}