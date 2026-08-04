"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Surface } from "@/components/layout/surface";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchNotes } from "@/features/knowledge/notes/actions";
import { fetchTasks } from "@/features/planner/tasks/actions";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const tasksQuery = useQuery({
    queryKey: ["tasks", "dashboard"],
    queryFn: async () => {
      const result = await fetchTasks({ limit: 8 });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  const notesQuery = useQuery({
    queryKey: ["notes", "dashboard"],
    queryFn: async () => {
      const result = await fetchNotes({ limit: 5 });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  const completed =
    tasksQuery.data?.filter((task) => task.status === "done").length ?? 0;
  const total = tasksQuery.data?.length ?? 0;
  const score = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`${format(now, "EEEE, MMMM d")} · ${format(now, "h:mm:ss a")}`}
        actions={
          <div className="flex gap-2">
            <Link
              href="/planner"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Planner
            </Link>
            <Link href="/knowledge" className={cn(buttonVariants())}>
              Knowledge
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Surface>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Productivity score
          </p>
          <p className="font-heading mt-2 text-4xl font-semibold">{score}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {completed} of {total || 0} loaded tasks complete
          </p>
        </Surface>

        <Surface className="md:col-span-1 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">Today’s tasks</h2>
            <Link href="/planner" className="text-muted-foreground text-xs">
              View all
            </Link>
          </div>
          {tasksQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <ul className="space-y-2">
              {(tasksQuery.data ?? []).slice(0, 6).map((task) => (
                <li
                  key={task.id}
                  className="bg-muted/40 flex items-center justify-between rounded-xl px-3 py-2 text-sm"
                >
                  <span
                    className={cn(
                      task.status === "done" &&
                        "text-muted-foreground line-through",
                    )}
                  >
                    {task.title}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {task.priority}
                  </span>
                </li>
              ))}
              {!tasksQuery.data?.length ? (
                <p className="text-muted-foreground text-sm">
                  No tasks yet — create one in Planner.
                </p>
              ) : null}
            </ul>
          )}
        </Surface>

        <Surface className="md:col-span-2 xl:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">Recent notes</h2>
            <Link href="/knowledge" className="text-muted-foreground text-xs">
              Open hub
            </Link>
          </div>
          {notesQuery.isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {(notesQuery.data ?? []).map((note) => (
                <Link
                  key={note.id}
                  href={`/knowledge/${note.id}`}
                  className="hover:bg-muted/60 rounded-xl border px-3 py-3 transition-colors"
                >
                  <p className="truncate text-sm font-medium">{note.title}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {note.content_text || "Empty note"}
                  </p>
                </Link>
              ))}
              {!notesQuery.data?.length ? (
                <p className="text-muted-foreground text-sm">
                  No notes yet — create one in Knowledge Hub.
                </p>
              ) : null}
            </div>
          )}
        </Surface>
      </div>
    </div>
  );
}
