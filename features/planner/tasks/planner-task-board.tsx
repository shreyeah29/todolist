"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isToday, parseISO } from "date-fns";
import {
  Archive,
  CheckCircle2,
  Circle,
  Copy,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createTask,
  deleteTask,
  duplicateTask,
  fetchTasks,
  toggleTaskComplete,
  undoDeleteTask,
  updateTask,
} from "@/features/planner/tasks/actions";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types";
import type { Task } from "@/types/database";

const priorities: TaskPriority[] = [
  "none",
  "low",
  "medium",
  "high",
  "urgent",
];

export function PlannerTaskBoard() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const tasksQuery = useQuery({
    queryKey: ["tasks", search],
    queryFn: async () => {
      const result = await fetchTasks({ search });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tasks"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await createTask({ title, priority });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      setTitle("");
      toast.success("Task created");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const grouped = useMemo(() => {
    const tasks = tasksQuery.data ?? [];
    const today: Task[] = [];
    const upcoming: Task[] = [];
    const backlog: Task[] = [];

    for (const task of tasks) {
      if (task.due_date && isToday(parseISO(task.due_date))) today.push(task);
      else if (task.due_date) upcoming.push(task);
      else backlog.push(task);
    }

    return { today, upcoming, backlog };
  }, [tasksQuery.data]);

  return (
    <div className="space-y-6">
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (!title.trim()) return;
          createMutation.mutate();
        }}
      >
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task… (press Enter)"
          className="flex-1"
        />
        <Select
          value={priority}
          onValueChange={(value) => setPriority(value as TaskPriority)}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={createMutation.isPending || pending}>
          <Plus className="size-4" />
          Add
        </Button>
      </form>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter tasks"
        className="max-w-sm"
      />

      {tasksQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : tasksQuery.isError ? (
        <p className="text-destructive text-sm">
          {(tasksQuery.error as Error).message}
        </p>
      ) : (
        <div className="space-y-6">
          <TaskGroup
            title="Today"
            tasks={grouped.today}
            onToggle={(id) =>
              startTransition(async () => {
                const result = await toggleTaskComplete(id);
                if (!result.success) toast.error(result.error.message);
                else invalidate();
              })
            }
            onDelete={(id) =>
              startTransition(async () => {
                const result = await deleteTask(id);
                if (!result.success) {
                  toast.error(result.error.message);
                  return;
                }
                toast.success("Task deleted", {
                  action: {
                    label: "Undo",
                    onClick: async () => {
                      await undoDeleteTask(id);
                      invalidate();
                    },
                  },
                });
                invalidate();
              })
            }
            onDuplicate={(id) =>
              startTransition(async () => {
                const result = await duplicateTask(id);
                if (!result.success) toast.error(result.error.message);
                else {
                  toast.success("Duplicated");
                  invalidate();
                }
              })
            }
            onFavorite={(task) =>
              startTransition(async () => {
                await updateTask({
                  id: task.id,
                  is_favorite: !task.is_favorite,
                });
                invalidate();
              })
            }
            onArchive={(task) =>
              startTransition(async () => {
                await updateTask({
                  id: task.id,
                  is_archived: true,
                });
                invalidate();
              })
            }
          />
          <TaskGroup
            title="Upcoming"
            tasks={grouped.upcoming}
            onToggle={(id) =>
              startTransition(async () => {
                await toggleTaskComplete(id);
                invalidate();
              })
            }
            onDelete={(id) =>
              startTransition(async () => {
                await deleteTask(id);
                invalidate();
              })
            }
            onDuplicate={(id) =>
              startTransition(async () => {
                await duplicateTask(id);
                invalidate();
              })
            }
            onFavorite={(task) =>
              startTransition(async () => {
                await updateTask({
                  id: task.id,
                  is_favorite: !task.is_favorite,
                });
                invalidate();
              })
            }
            onArchive={(task) =>
              startTransition(async () => {
                await updateTask({ id: task.id, is_archived: true });
                invalidate();
              })
            }
          />
          <TaskGroup
            title="Backlog"
            tasks={grouped.backlog}
            onToggle={(id) =>
              startTransition(async () => {
                await toggleTaskComplete(id);
                invalidate();
              })
            }
            onDelete={(id) =>
              startTransition(async () => {
                await deleteTask(id);
                invalidate();
              })
            }
            onDuplicate={(id) =>
              startTransition(async () => {
                await duplicateTask(id);
                invalidate();
              })
            }
            onFavorite={(task) =>
              startTransition(async () => {
                await updateTask({
                  id: task.id,
                  is_favorite: !task.is_favorite,
                });
                invalidate();
              })
            }
            onArchive={(task) =>
              startTransition(async () => {
                await updateTask({ id: task.id, is_archived: true });
                invalidate();
              })
            }
          />
        </div>
      )}
    </div>
  );
}

function TaskGroup({
  title,
  tasks,
  onToggle,
  onDelete,
  onDuplicate,
  onFavorite,
  onArchive,
}: {
  title: string;
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onFavorite: (task: Task) => void;
  onArchive: (task: Task) => void;
}) {
  if (!tasks.length) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
        {title}
      </h3>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className={cn(
              "glass border-border/50 flex items-center gap-3 rounded-xl border px-3 py-2.5",
              task.status === "done" && "opacity-60",
            )}
          >
            <button
              type="button"
              onClick={() => onToggle(task.id)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Toggle complete"
            >
              {task.status === "done" ? (
                <CheckCircle2 className="size-5 text-primary" />
              ) : (
                <Circle className="size-5" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm font-medium",
                  task.status === "done" && "line-through",
                )}
              >
                {task.title}
              </p>
              <p className="text-muted-foreground text-xs">
                {task.priority}
                {task.due_date
                  ? ` · ${format(parseISO(task.due_date), "MMM d")}`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onFavorite(task)}
                aria-label="Favorite"
              >
                <Star
                  className={cn(
                    "size-3.5",
                    task.is_favorite && "fill-current text-amber-500",
                  )}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDuplicate(task.id)}
                aria-label="Duplicate"
              >
                <Copy className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onArchive(task)}
                aria-label="Archive"
              >
                <Archive className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(task.id)}
                aria-label="Delete"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
