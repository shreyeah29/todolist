import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";

export default function PomodoroPage() {
  return (
    <div>
      <PageHeader
        title="Pomodoro"
        description="Focused work sessions with gentle breaks and logged focus time."
      />
      <Surface>
        <EmptyState
          title="Focus timer"
          description="Session controls and history will sync with Analytics."
        />
      </Surface>
    </div>
  );
}
