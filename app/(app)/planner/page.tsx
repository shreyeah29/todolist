import { PageHeader } from "@/components/layout/page-header";
import { Surface } from "@/components/layout/surface";
import { PlannerTaskBoard } from "@/features/planner/tasks/planner-task-board";

export default function PlannerPage() {
  return (
    <div>
      <PageHeader
        title="Planner"
        description="Capture, prioritize, and complete work with live sync."
      />
      <Surface>
        <PlannerTaskBoard />
      </Surface>
    </div>
  );
}
