"use client";

import type { ReactNode } from "react";
import {
  Group,
  Panel,
  Separator,
  type GroupProps,
} from "react-resizable-panels";

import { cn } from "@/lib/utils";

type ResizablePanelsProps = {
  left: ReactNode;
  right: ReactNode;
  leftDefaultSize?: number;
  rightDefaultSize?: number;
  className?: string;
  orientation?: GroupProps["orientation"];
};

export function ResizablePanels({
  left,
  right,
  leftDefaultSize = 34,
  rightDefaultSize = 66,
  className,
  orientation = "horizontal",
}: ResizablePanelsProps) {
  return (
    <Group
      orientation={orientation}
      className={cn("flex h-full min-h-[420px] w-full", className)}
    >
      <Panel defaultSize={leftDefaultSize} minSize={20} className="min-w-0">
        {left}
      </Panel>
      <Separator className="bg-border/70 hover:bg-primary/40 data-[resize-handle-active]:bg-primary/50 mx-1 w-1 rounded-full transition-colors" />
      <Panel defaultSize={rightDefaultSize} minSize={30} className="min-w-0">
        {right}
      </Panel>
    </Group>
  );
}
