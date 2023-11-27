import { useEffect, useRef } from "react";
import * as d3 from "d3";

type UseD3RenderProps = {
  render: (svg: d3.Selection<SVGSVGElement, unknown, null, unknown>) => void;
  dependencies?: readonly unknown[];
};

export const useD3Render = ({ render, dependencies }: UseD3RenderProps) => {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const selection = d3.select(ref.current);
    render(selection);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies ?? []);

  return ref;
};
