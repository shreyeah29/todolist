"use client";

import { useEffect } from "react";

import { bootstrapLocalSession } from "@/features/auth/actions";

export function LocalBootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void bootstrapLocalSession();
  }, []);

  return children;
}
