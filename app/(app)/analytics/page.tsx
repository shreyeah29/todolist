import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Completion, focus time, habits, and the days you do your best work."
      />
      <Surface>
        <EmptyState
          title="Insights arrive soon"
          description="Charts and productivity trends will use live Planner and Pomodoro data."
        />
      </Surface>
    </div>
  );
}
