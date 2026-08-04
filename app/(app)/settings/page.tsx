"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Surface } from "@/components/layout/surface";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { resetLocalWorkspace } from "@/features/auth/actions";
import { DEFAULT_ACCENT } from "@/lib/constants";

export default function SettingsPage() {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Local workspace preferences. Data is stored in this browser only."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Surface>
          <h2 className="font-heading mb-1 text-sm font-semibold">Appearance</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Switch between light, dark, and system themes.
          </p>
          <ThemeToggle />
        </Surface>
        <Surface>
          <h2 className="font-heading mb-1 text-sm font-semibold">Accent</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Default brand accent is indigo {DEFAULT_ACCENT}.
          </p>
          <div
            className="shadow-soft size-10 rounded-xl"
            style={{ background: DEFAULT_ACCENT }}
          />
        </Surface>
        <Surface className="md:col-span-2">
          <h2 className="font-heading mb-1 text-sm font-semibold">Storage</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Toso is running in local-first mode using IndexedDB. Clearing data
            cannot be undone.
          </p>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const confirmed = window.confirm(
                  "Delete all local tasks, notes, and settings?",
                );
                if (!confirmed) return;
                const result = await resetLocalWorkspace();
                if (!result.success) {
                  toast.error(result.error.message);
                  return;
                }
                toast.success("Local data cleared");
                window.location.href = "/dashboard";
              })
            }
          >
            Reset local data
          </Button>
        </Surface>
      </div>
    </div>
  );
}
