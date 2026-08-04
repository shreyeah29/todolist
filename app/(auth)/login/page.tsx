import { AuthForm } from "@/features/auth/auth-form";

export default function LoginPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Sign in to continue to your productivity OS.
        </p>
      </div>
      <AuthForm mode="login" />
    </section>
  );
}
