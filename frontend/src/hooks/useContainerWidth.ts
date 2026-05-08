// src/hooks/useContainerWidth.ts
import { useState, useEffect, RefObject } from "react";

export function useContainerWidth(ref: RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(() => {
      if (ref.current) setWidth(ref.current.clientWidth);
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);

  return width;
}
