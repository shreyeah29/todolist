import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";

export default function PlannerTimelinePage() {
  return (
    <div>
      <PageHeader
        title="Time Blocking"
        description="A calm daily timeline from 6 AM to 11 PM with resizable blocks."
      />
      <Surface>
        <EmptyState
          title="Daily schedule"
          description="Draggable time blocks and conflict detection will live here."
        />
      </Surface>
    </div>
  );
}
