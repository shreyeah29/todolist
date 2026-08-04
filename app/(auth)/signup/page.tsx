import { AuthForm } from "@/features/auth/auth-form";

export default function SignupPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Set up your local space
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          No cloud account needed. Everything is stored on-device.
        </p>
      </div>
      <AuthForm mode="signup" />
    </section>
  );
}
