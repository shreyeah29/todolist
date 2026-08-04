import type { ReactNode } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

/**
 * Authenticated application shell.
 * Full sidebar / top-nav UI lands in Step 3.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="bg-background text-foreground min-h-dvh">
      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
