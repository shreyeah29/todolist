import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";
import { buttonVariants } from "@/components/ui/button";
import { PLANNER_SUBNAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function PlannerPage() {
  return (
    <div>
      <PageHeader
        title="Planner"
        description="Tasks, calendar, time blocking, habits, and goals — one precise daily system."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {PLANNER_SUBNAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              buttonVariants({
                variant: item.href === "/planner" ? "default" : "outline",
                size: "sm",
              }),
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <Surface>
        <EmptyState
          title="Your task list starts here"
          description="Full Planner capabilities — drag and drop, priorities, recurring tasks, and bulk edit — arrive in Step 5."
        />
      </Surface>
    </div>
  );
}
