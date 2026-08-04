import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";

export default function HabitsPage() {
  return (
    <div>
      <PageHeader
        title="Habits"
        description="Track the rituals that compound into better weeks."
      />
      <Surface>
        <EmptyState
          title="Habit tracker"
          description="Daily and weekly habit logging arrives with Planner."
        />
      </Surface>
    </div>
  );
}
