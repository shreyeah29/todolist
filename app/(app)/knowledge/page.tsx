import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, Surface } from "@/components/layout/surface";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function KnowledgePage() {
  return (
    <div>
      <PageHeader
        title="Knowledge Hub"
        description="A Notion-like home for notes, folders, and thinking — deep, calm, and searchable."
        actions={
          <Link href="/knowledge/new" className={cn(buttonVariants())}>
            New note
          </Link>
        }
      />
      <Surface>
        <EmptyState
          title="Your second brain"
          description="Nested folders, TipTap editing, slash commands, and autosave land in Step 6."
        />
      </Surface>
    </div>
  );
}
