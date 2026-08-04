type NotePageProps = {
  params: Promise<{ noteId: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { noteId } = await params;

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Note</h1>
      <p className="text-muted-foreground text-sm">Note ID: {noteId}</p>
    </section>
  );
}
