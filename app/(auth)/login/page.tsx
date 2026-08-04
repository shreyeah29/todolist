import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Sign in to continue to your productivity OS. Auth connects in Step 7.
        </p>
      </div>
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        Enter Toso
      </Link>
      <p className="text-muted-foreground text-center text-xs">
        No account yet?{" "}
        <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </section>
  );
}
