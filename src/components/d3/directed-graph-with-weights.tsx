"use client";

import * as d3 from "d3";
import { useD3Render } from "~/hooks";
import { parseGraphToId, parseLinkToId } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { Graph, SimulationLink, SimulationNode } from "~/types";

type ForceGraphProps = {
  data: Graph;
  height?: number;
  width?: number;
};

/**
 * Inspired from:
 * - https://www.d3indepth.com/force-layout/
 * - https://stackoverflow.com/questions/76924982/d3-force-graph-in-solidjs-with-typescript
 * - https://codesandbox.io/p/sandbox/d3-react-force-graph-les-miserables-forked-twqr4d?file=%2Fsrc%2FForceGraph.js%3A68%2C22-68%2C31
 * - https://balramchavan.medium.com/building-d3-interactive-network-graph-d3-force-simulation-react-typescript-b17e71f03913
 * - https://github.com/ultrasonicsoft/d3-network-graph-editor/blob/main/src/App.tsx
 * - https://stackoverflow.com/questions/32966823/links-and-arrowheads-to-terminate-at-borders-of-nodes-in-d3
 * - https://stackoverflow.com/questions/16660193/get-arrowheads-to-point-at-outer-edge-of-node-in-d3
 * - https://stackoverflow.com/questions/47020108/d3-force-nodes-are-dragged-away-from-links-ticks-not-run
 * - https://stackoverflow.com/questions/52358115/d3-force-graph-with-arrows-and-curved-edges-shorten-links-so-arrow-doesnt-over
 * - https://observablehq.com/@ben-tanen/a-tutorial-to-using-d3-force-from-someone-who-just-learned-ho
 * - https://observablehq.com/@bumbeishvili/d3-v6-force-graph-with-natural-drag-attraction
 */
export function DirectedGraphWithWeights({ data, ...config }: ForceGraphProps) {
  const strokeWidth = 2;
  const radius = 15;
  const height = config.height ?? window.innerHeight;
  const width = config.width ?? window.innerWidth;
  const graphId = parseGraphToId(data);
  const color = d3.scaleOrdinal([1, 2, 3], ["#0ea5e9", "#64748b", "#22c55e"]);

  const nodes = data.nodes.map((node) => ({ ...node })) as SimulationNode[];
  const links = data.links.map((d) => ({ ...d })) as SimulationLink[];

  const { svgRef, zoomRef } = useD3Render({
    render(svg, zoomG) {
      const simulation = d3
        .forceSimulation(nodes)
        .force("link", d3.forceLink(links).distance(150))
        .force("collide", d3.forceCollide().radius(radius * 2))
        .force("charge", d3.forceManyBody().strength(-(radius * 2 - 1)))
        .force("center", d3.forceCenter(width / 2, height / 2));

      const node = svg.selectAll<SVGCircleElement, SimulationNode>("circle").data(nodes);
      const nodeId = svg
        .select("#nodes")
        .selectAll<SVGCircleElement, SimulationNode>("text")
        .data(nodes);

      const link = svg.selectAll<SVGLineElement, SimulationLink>(".link").data(links);

      const linkWeightBackground = svg
        .select("#links")
        .selectAll<SVGRectElement, SimulationNode>("rect")
        .data(links);

      const linkWeight = svg
        .select("#links")
        .selectAll<SVGTextElement, SimulationNode>("text")
        .data(links);

      function ticked() {
        // The source property comes from the SimulationLinkDatum interface, and by default,
        // has a type of TypeOfNode | string | number, where TypeOfNode is SimulationNode, so we
        // need to make an `as assertion`. The x,y properties added by the SimulationNodeDatum
        // interface are of type number | undefined, so a non-null assertion operator is used

        const getX = (value: unknown) => (value as SimulationNode).x!;
        const getY = (value: unknown) => (value as SimulationNode).y!;
        const getMiddleX = (link: SimulationLink) => (getX(link.source) + getX(link.target)) / 2;
        const getMiddleY = (link: SimulationLink) => (getY(link.source) + getY(link.target)) / 2;
        const getLinkTextBB = (link: SimulationLink) => {
          const textId = parseLinkToId(link) + "-text";
          const text = document.getElementById(textId);
          if (!text) return undefined;

          const textSvg = text as unknown as SVGGraphicsElement;
          return textSvg.getBBox();
        };

        node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

        nodeId.attr("x", (d) => d.x!).attr("y", (d) => d.y! + 6);

        link.attr("d", (link) => {
          const diffX = getX(link.target) - getX(link.source);
          const diffY = getY(link.target) - getY(link.source);

          // Length of path from center of source node to center of target node
          const pathLength = Math.sqrt(diffX * diffX + diffY * diffY);
          const arrowOffset = 5;

          // x and y distances from center to outside edge of target node
          const nodeRadius = radius + arrowOffset + strokeWidth / 2;
          const offsetX = (diffX * nodeRadius) / pathLength;
          const offsetY = (diffY * nodeRadius) / pathLength;

          const startingPoint = `${getX(link.source) + offsetX},${getY(link.source) + offsetY}`;
          const endingPoint = `${getX(link.target) - offsetX},${getY(link.target) - offsetY}`;

          const toDraw = `M ${startingPoint} L${endingPoint}`;

          return toDraw;
        });

        linkWeight.attr("x", getMiddleX).attr("y", (link) => getMiddleY(link) + 4);

        linkWeightBackground.each(function (link) {
          const boundingBox = getLinkTextBB(link);
          if (!boundingBox) return;

          d3.select(this)
            .attr("x", boundingBox.x - 4)
            .attr("y", boundingBox.y - 4)
            .attr("width", boundingBox.width + 8)
            .attr("height", boundingBox.height + 8);
        });
      }

      simulation.on("tick", ticked);

      function onDragStart(
        event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>,
      ) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function onDrag(event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function onDragEnd(event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      node.call(
        d3
          .drag<SVGCircleElement, SimulationNode>()
          .on("start", onDragStart)
          .on("drag", onDrag)
          .on("end", onDragEnd),
      );

      if (zoomG) {
        zoomG.style("transform-origin", "50% 50% 0");

        const onZoom = (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
          zoomG.attr(
            "transform",
            `translate(${event.transform.x},${event.transform.y}) scale(${event.transform.k})`,
          );
        };

        const zoomHandler = d3.zoom<SVGSVGElement, unknown>().on("zoom", onZoom);
        svg.call(zoomHandler);
      }
    },
    dependencies: [graphId],
  });

  return (
    <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <text x="16" y="95%" className="fill-slate-500 stroke-1 text-xs" pointerEvents="none">
        {data.description}
      </text>
      <text x="16" y="97.5%" className="fill-slate-500 stroke-1 text-xs" pointerEvents="none">
        {`${width}px x ${height}px`}
      </text>
      <g ref={zoomRef}>
        <g id="links">
          {links.map((link) => {
            const linkId = parseLinkToId(link);
            return (
              <g key={linkId}>
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="5"
                    markerHeight="5"
                    refX="8"
                    refY="5"
                    orient="auto"
                    markerUnits="strokeWidth"
                    viewBox="0 0 10 10"
                  >
                    <path d="M0,0L0,10L10,5" className="fill-slate-800" />
                  </marker>
                </defs>
                <path
                  className="link stroke-slate-800"
                  strokeWidth={3}
                  markerEnd="url(#arrow)"
                  strokeLinecap="round"
                />
                <rect
                  rx="4"
                  id={`${linkId}-text-background`}
                  className={cn({
                    "fill-slate-800 stroke-zinc-500 stroke-1": data.renderWeights,
                    "fill-none stroke-none": !data.renderWeights,
                  })}
                />
                <text
                  id={`${linkId}-text`}
                  textAnchor="middle"
                  className={cn("text-[10px]", {
                    "fill-zinc-200 dark:fill-zinc-500": data.renderWeights,
                    "fill-none": !data.renderWeights,
                  })}
                  pointerEvents="none"
                >
                  {link.weight}
                </text>
              </g>
            );
          })}
        </g>
        <g id="nodes" stroke="#fff" strokeWidth={strokeWidth}>
          {nodes.map((node) => (
            <g key={node.id}>
              <circle
                key={node.id}
                r={radius}
                fill={color(node.set ?? 2)}
                className="cursor-pointer"
              />
              <text
                textAnchor="middle"
                className="bg-slate-500 fill-slate-50 stroke-none"
                pointerEvents="none"
              >
                {data.startsAt1 ? node.id + 1 : node.id}
              </text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
