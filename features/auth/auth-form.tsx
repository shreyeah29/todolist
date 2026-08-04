"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  bootstrapLocalSession,
  updateLocalProfile,
} from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const boot = await bootstrapLocalSession();
      if (!boot.success) {
        toast.error(boot.error.message);
        return;
      }

      if (displayName.trim() || email.trim()) {
        const result = await updateLocalProfile({
          displayName:
            displayName.trim() ||
            boot.data.display_name ||
            "Local User",
          email: email.trim() || undefined,
        });
        if (!result.success) {
          toast.error(result.error.message);
          return;
        }
      }

      toast.success(
        mode === "login" ? "Welcome back to local Toso" : "Local workspace ready",
      );
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="bg-muted/50 rounded-xl px-3 py-2 text-xs leading-relaxed">
        Running in <strong>local mode</strong> — data stays in this browser
        (IndexedDB). No cloud account required.
      </div>
      <div className="space-y-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email (optional)</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Opening…" : "Continue locally"}
      </Button>
    </form>
  );
}
