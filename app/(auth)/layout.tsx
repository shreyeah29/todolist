import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-background text-foreground flex min-h-dvh items-center justify-center px-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
