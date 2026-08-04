"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { fail, ok, withActionResult } from "@/lib/utils/action";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { ActionResult } from "@/types";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  displayName: z.string().trim().min(1).max(80).optional(),
});

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<ActionResult<{ redirectTo: string }>> {
  if (!hasSupabaseEnv()) {
    return fail(
      new Error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      ),
    );
  }

  return withActionResult(async () => {
    const parsed = credentialsSchema
      .pick({ email: true, password: true })
      .parse(input);
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed);
    if (error) throw error;
    return { redirectTo: "/dashboard" };
  });
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<ActionResult<{ redirectTo: string }>> {
  if (!hasSupabaseEnv()) {
    return fail(
      new Error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      ),
    );
  }

  return withActionResult(async () => {
    const parsed = credentialsSchema.parse(input);
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const { error } = await supabase.auth.signUp({
      email: parsed.email,
      password: parsed.password,
      options: {
        emailRedirectTo: `${origin}/callback`,
        data: {
          display_name: parsed.displayName ?? parsed.email.split("@")[0],
        },
      },
    });
    if (error) throw error;
    return { redirectTo: "/dashboard" };
  });
}

export async function signOut(): Promise<void> {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getSessionUser() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
