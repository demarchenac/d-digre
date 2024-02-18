import { useEffect, useRef, useState } from "react";
import { ResizeObserver } from "@juggle/resize-observer";

export type Dimensions = { height?: number; width?: number };

export type UseDimensionsReturnValue = [React.RefObject<HTMLDivElement>, Required<Dimensions>];

const combineChartDimensions = (dms?: Dimensions) => ({
  height: Math.max(dms?.height ?? 0, 0),
  width: Math.max(dms?.width ?? 0, 0),
});

export function useDimensions(dms?: Dimensions): UseDimensionsReturnValue {
  const ref = useRef<HTMLDivElement>(null);

  const [width, changeWidth] = useState(dms?.width ?? 0);
  const [height, changeHeight] = useState(dms?.height ?? 0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) return;
      if (!entries.length) return;

      const entry = entries[0];
      if (!entry) return;

      if (width != entry.contentRect.width) changeWidth(entry.contentRect.width);
      if (height != entry.contentRect.height) changeHeight(entry.contentRect.height);
    });

    resizeObserver.observe(element);

    return () => resizeObserver.unobserve(element);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dimensions = combineChartDimensions({ width, height });

  return [ref, dimensions];
}
