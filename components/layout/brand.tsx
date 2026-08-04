"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BrandProps = {
  collapsed?: boolean;
  className?: string;
};

export function Brand({ collapsed = false, className }: BrandProps) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <motion.span
        layout
        className="gradient-brand shadow-soft flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        T
      </motion.span>
      {!collapsed ? (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.18 }}
          className="min-w-0"
        >
          <p className="font-heading text-foreground text-[1.05rem] leading-none font-semibold tracking-tight">
            {APP_NAME}
          </p>
          <p className="text-muted-foreground mt-1 text-[11px] tracking-wide">
            Productivity OS
          </p>
        </motion.div>
      ) : null}
    </Link>
  );
}
