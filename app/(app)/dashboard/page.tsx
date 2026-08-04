import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your day at a glance — tasks, notes, focus, and progress in one calm surface."
        actions={
          <div className="flex gap-2">
            <Link
              href="/planner"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Open Planner
            </Link>
            <Link href="/knowledge" className={cn(buttonVariants())}>
              Open Knowledge
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Surface className="md:col-span-2 xl:col-span-2">
          <EmptyState
            title="Good day ahead"
            description="Live greeting, productivity score, today’s tasks, and weekly progress will appear here once Planner and Analytics are connected."
            action={
              <Link
                href="/planner"
                className={cn(buttonVariants({ size: "sm" }), "mt-1")}
              >
                Add your first task
              </Link>
            }
          />
        </Surface>
        <Surface>
          <h2 className="font-heading mb-2 text-sm font-semibold tracking-tight">
            Quick actions
          </h2>
          <div className="flex flex-col gap-2">
            <Link
              href="/planner"
              className="hover:bg-muted/70 rounded-xl px-3 py-2.5 text-sm transition-colors"
            >
              New task
              <span className="text-muted-foreground ml-2 text-xs">N</span>
            </Link>
            <Link
              href="/knowledge"
              className="hover:bg-muted/70 rounded-xl px-3 py-2.5 text-sm transition-colors"
            >
              New note
              <span className="text-muted-foreground ml-2 text-xs">⇧N</span>
            </Link>
            <p className="text-muted-foreground px-3 pt-2 text-xs">
              Press ⌘K anytime for global search.
            </p>
          </div>
        </Surface>
      </div>
    </div>
  );
}
