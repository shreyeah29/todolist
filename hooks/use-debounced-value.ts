"use client";

import { useEffect, useState } from "react";

import { debounce } from "@/lib/utils/debounce";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const update = debounce(() => setDebounced(value), delayMs);
    update();
    return () => update.cancel();
  }, [value, delayMs]);

  return debounced;
}
