import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Create your space
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          One account for Planner and Knowledge Hub.
        </p>
      </div>
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        Continue
      </Link>
      <p className="text-muted-foreground text-center text-xs">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
