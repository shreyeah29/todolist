import { PageHeader } from "@/components/layout/page-header";
import { KnowledgeWorkspace } from "@/features/knowledge/notes/knowledge-workspace";

export default function KnowledgePage() {
  return (
    <div>
      <PageHeader
        title="Knowledge Hub"
        description="Folders, notes, and a Notion-style editor with autosave."
      />
      <KnowledgeWorkspace />
    </div>
  );
}
