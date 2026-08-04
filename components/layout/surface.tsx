"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type SurfaceProps = {
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export function Surface({ children, className, padded = true }: SurfaceProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: 0.04 }}
      className={cn(
        "glass border-border/50 shadow-soft rounded-2xl border",
        padded && "p-5 md:p-6",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-3 py-10",
        className,
      )}
    >
      <div className="gradient-aurora rounded-2xl p-4">
        <div className="bg-background/50 size-10 rounded-xl" />
      </div>
      <h2 className="font-heading text-lg font-semibold tracking-tight">
        {title}
      </h2>
      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
        {description}
      </p>
      {action}
    </div>
  );
}
