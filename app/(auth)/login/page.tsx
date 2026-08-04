import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Toso</h1>
        <p className="text-muted-foreground text-sm">
          Supabase Auth wiring lands with backend connection in Step 7.
        </p>
      </div>
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "default" }), "w-full")}
      >
        Continue to app shell
      </Link>
    </section>
  );
}
