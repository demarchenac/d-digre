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

  const colors = {
    source: { fill: "!fill-sky-500", stroke: "!stroke-sky-500" },
    target: { fill: "!fill-green-500", stroke: "!stroke-green-500" },
    default: { fill: "fill-slate-800", stroke: "stroke-slate-800" },
    highlight: {
      node: { fill: "fill-amber-600" },
      edge: { fill: "fill-amber-800", stroke: "stroke-amber-800" },
    },
  };

  const graphId = parseGraphToId(data);
  const color = d3.scaleOrdinal(
    [1, 2, 3],
    [colors.source.fill, colors.default.fill, colors.target.fill],
  );

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

      const node = svg
        .selectAll<SVGCircleElement, SimulationNode>("circle")
        .data(nodes)
        .on("mouseover", function onMouseOver(_event, node) {
          const scaled = radius * 1.2;
          const noInEdges = node.incoming.length === 0;
          const noOutEdges = node.outgoing.length === 0;
          const sourceEdgeClass = noInEdges ? colors.source.stroke : colors.target.stroke;
          const sourceMarkerClass = noInEdges ? colors.source.fill : colors.target.fill;
          const targetEdgeClass = noOutEdges ? colors.target.stroke : colors.source.stroke;
          const targetMarkerClass = noOutEdges ? colors.target.fill : colors.source.fill;

          d3.select(this)
            .classed(colors.source.fill, noInEdges)
            .classed(colors.target.fill, noOutEdges)
            .classed(colors.default.fill, !noInEdges && !noOutEdges)
            .classed(colors.highlight.node.fill, false)
            .transition()
            .duration(300)
            .attr("r", scaled);
          svg.selectAll(`.link-source-${node.id}`).classed(sourceEdgeClass, true);
          svg.selectAll(`.link-source-${node.id}-marker`).classed(sourceMarkerClass, true);
          svg.selectAll(`.link-target-${node.id}`).classed(targetEdgeClass, true);
          svg.selectAll(`.link-target-${node.id}-marker`).classed(targetMarkerClass, true);
        })
        .on("mouseout", function onMouseOut(_event, node) {
          const noInEdges = node.incoming.length === 0;
          const noOutEdges = node.outgoing.length === 0;
          const sourceEdgeClass = noInEdges ? colors.source.stroke : colors.target.stroke;
          const sourceMarkerClass = noInEdges ? colors.source.fill : colors.target.fill;
          const targetEdgeClass = noOutEdges ? colors.target.stroke : colors.source.stroke;
          const targetMarkerClass = noOutEdges ? colors.target.fill : colors.source.fill;

          d3.select(this)
            .classed(colors.source.fill, noInEdges && !node.isSelected)
            .classed(colors.target.fill, noOutEdges && !node.isSelected)
            .classed(colors.default.fill, !noInEdges && !noInEdges && !node.isSelected)
            .classed(colors.highlight.node.fill, node.isSelected)
            .transition()
            .duration(300)
            .attr("r", radius);
          svg.selectAll(`.link-source-${node.id}`).classed(sourceEdgeClass, false);
          svg.selectAll(`.link-source-${node.id}-marker`).classed(sourceMarkerClass, false);
          svg.selectAll(`.link-target-${node.id}`).classed(targetEdgeClass, false);
          svg.selectAll(`.link-target-${node.id}-marker`).classed(targetMarkerClass, false);
        })
        .on("click", function onClick(_event, node) {
          node.isSelected = !node.isSelected;
          const noInEdges = node.incoming.length === 0;
          const noOutEdges = node.outgoing.length === 0;

          d3.select(this)
            .classed(colors.source.fill, noInEdges && !node.isSelected)
            .classed(colors.target.fill, noOutEdges && !node.isSelected)
            .classed(colors.default.fill, !noInEdges && !noInEdges && !node.isSelected)
            .classed(colors.highlight.node.fill, node.isSelected);
          svg
            .selectAll(`.link-source-${node.id}`)
            .classed(colors.default.stroke, !node.isSelected)
            .classed(colors.highlight.edge.stroke, node.isSelected);
          svg
            .selectAll(`.link-source-${node.id}-marker`)
            .classed(colors.default.fill, !node.isSelected)
            .classed(colors.highlight.edge.fill, node.isSelected);
        });

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
                    id={`link-arrow-from-${link.source}-to-${link.target}`}
                    markerWidth="5"
                    markerHeight="5"
                    refX="8"
                    refY="5"
                    orient="auto"
                    markerUnits="strokeWidth"
                    viewBox="0 0 10 10"
                  >
                    <path
                      d="M0,0L0,10L10,5"
                      className={cn(
                        colors.default.fill,
                        "transition-[fill] duration-300",
                        `link-source-${link.source}-marker link-target-${link.target}-marker`,
                      )}
                    />
                  </marker>
                </defs>
                <path
                  className={cn(
                    colors.default.stroke,
                    "link transition-[stroke] duration-300",
                    `link-source-${link.source} link-target-${link.target}`,
                  )}
                  strokeWidth={3}
                  markerEnd={`url(#link-arrow-from-${link.source}-to-${link.target})`}
                  strokeLinecap="round"
                />
                <rect
                  rx="4"
                  id={`${linkId}-text-background`}
                  className={cn({
                    [colors.default.fill]: data.renderWeights,
                    "stroke-zinc-500 stroke-1": data.renderWeights,
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
                className={cn("cursor-pointer", color(node.set ?? 2))}
              />
              <text textAnchor="middle" className="fill-slate-50 stroke-none" pointerEvents="none">
                {data.startsAt1 ? node.id + 1 : node.id}
              </text>
            </g>
          ))}
        </g>
      </g>
    </svg>
  );
}
