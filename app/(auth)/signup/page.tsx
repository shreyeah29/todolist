import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SignupPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-muted-foreground text-sm">
          Account creation will use Supabase Auth.
        </p>
      </div>
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "outline" }), "w-full")}
      >
        Back to sign in
      </Link>
    </section>
  );
}
