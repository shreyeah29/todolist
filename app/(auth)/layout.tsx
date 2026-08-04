import type { ReactNode } from "react";

import { Brand } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/layout/theme-toggle";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-6 py-10">
      <div className="pointer-events-none absolute inset-0 gradient-aurora opacity-70" />
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>
      <div className="glass shadow-soft relative z-10 w-full max-w-md rounded-3xl border p-8">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        {children}
      </div>
    </div>
  );
}
