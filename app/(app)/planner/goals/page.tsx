import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";

export default function GoalsPage() {
  return (
    <div>
      <PageHeader
        title="Goals"
        description="Long-range outcomes linked to the work you do each day."
      />
      <Surface>
        <EmptyState
          title="Goals workspace"
          description="Goal progress and linked tasks will be implemented next."
        />
      </Surface>
    </div>
  );
}
