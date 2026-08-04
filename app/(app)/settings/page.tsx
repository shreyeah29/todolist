import { PageHeader } from "@/components/layout/page-header";
import { Surface } from "@/components/layout/surface";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DEFAULT_ACCENT } from "@/lib/constants";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Theme, accent, notifications, timezone, and backup controls."
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
            Default brand accent is indigo {DEFAULT_ACCENT}. Custom accents sync
            across the shell.
          </p>
          <div
            className="size-10 rounded-xl shadow-soft"
            style={{ background: DEFAULT_ACCENT }}
          />
        </Surface>
      </div>
    </div>
  );
}
