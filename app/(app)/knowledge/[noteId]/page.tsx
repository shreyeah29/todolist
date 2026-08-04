import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";

type NotePageProps = {
  params: Promise<{ noteId: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { noteId } = await params;

  return (
    <div>
      <PageHeader
        title="Note"
        description={`Editing surface for note ${noteId}.`}
      />
      <Surface>
        <EmptyState
          title="Rich text editor"
          description="TipTap with slash commands, version history, and autosave will mount here."
        />
      </Surface>
    </div>
  );
}
