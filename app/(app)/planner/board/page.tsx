import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";

export default function PlannerBoardPage() {
  return (
    <div>
      <PageHeader
        title="Kanban"
        description="Status columns with drag-and-drop prioritization."
      />
      <Surface>
        <EmptyState
          title="Board view"
          description="Kanban columns and card interactions land in Step 5."
        />
      </Surface>
    </div>
  );
}
