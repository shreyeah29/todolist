import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";

type ModulePageProps = {
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
};

function ModulePage({
  title,
  description,
  emptyTitle,
  emptyDescription,
}: ModulePageProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <Surface>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </Surface>
    </div>
  );
}

export default function PlannerCalendarPage() {
  return (
    <ModulePage
      title="Calendar"
      description="Month, week, day, and agenda views with click-to-create scheduling."
      emptyTitle="Calendar canvas"
      emptyDescription="Interactive calendar views will be built with the Planner module."
    />
  );
}
