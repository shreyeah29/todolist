import { PageHeader } from "@/components/layout/page-header";
import { KnowledgeWorkspace } from "@/features/knowledge/notes/knowledge-workspace";

type NotePageProps = {
  params: Promise<{ noteId: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { noteId } = await params;

  return (
    <div>
      <PageHeader
        title="Knowledge Hub"
        description="Editing with autosave and live folder navigation."
      />
      <KnowledgeWorkspace noteId={noteId === "new" ? undefined : noteId} />
    </div>
  );
}
