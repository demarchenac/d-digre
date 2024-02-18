import { useEffect, useRef } from "react";
import * as d3 from "d3";

type UseD3RenderProps = {
  render: (svg: d3.Selection<SVGSVGElement, unknown, null, unknown>) => void;
  renderDependencies?: readonly unknown[];
  onZoom: (
    svg: d3.Selection<SVGSVGElement, unknown, null, unknown>,
    g: d3.Selection<SVGGElement, unknown, null, unknown>,
  ) => void;
  zoomDependencies?: readonly unknown[];
};

export const useD3Render = ({
  render,
  onZoom,
  renderDependencies,
  zoomDependencies,
}: UseD3RenderProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const zoomRef = useRef<SVGGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const selection = d3.select(svgRef.current);
    render(selection);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, renderDependencies ?? []);

  useEffect(() => {
    if (!svgRef.current) return;
    if (!zoomRef.current) return;

    const selection = d3.select(svgRef.current);
    const zoomable = d3.select(zoomRef.current);
    onZoom(selection, zoomable);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, zoomDependencies ?? []);

  return { svgRef, zoomRef };
};
