"use client";

import * as d3 from "d3";
import { useMemo } from "react";
import { useD3Render, useDimensions } from "~/hooks";
import { parseGraphToId, parseLinkToLinkId } from "~/lib/helpers";
import { cn } from "~/lib/utils";
import type { DirectedGraph, SimulationLink, SimulationNode } from "~/types";
import { color, colors, getNodeColor, radius, strokeWidth } from "./constants";

type DirectedGraphWithWeightsProps = {
  data: DirectedGraph;
  height?: number;
  width?: number;
  visibleNodes?: number[];
  encoders?: number[];
  visibleLinks?: { source: number; target: number }[];
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
export function DirectedGraphWithWeights({
  data,
  visibleNodes,
  visibleLinks,
  encoders,
}: DirectedGraphWithWeightsProps) {
  const graphId = parseGraphToId(data);

  const nodes = useMemo(() => {
    let toRender = data.nodes.map((node) => ({ ...node, shouldRender: true })) as SimulationNode[];
    if (visibleNodes?.length) {
      toRender = toRender.map((node) => ({
        ...node,
        shouldRender: visibleNodes.includes(node.id),
      }));
    }
    if (encoders) {
      toRender = toRender.map((node) => ({ ...node, isEncoder: encoders.includes(node.id) }));
    }

    return toRender;
  }, [data.nodes, visibleNodes, encoders]);

  const links = useMemo(() => {
    let toRender = data.links.map((link) => ({ ...link, shouldRender: true })) as SimulationLink[];

    if (visibleLinks?.length) {
      toRender = toRender.map((link) => ({
        ...link,
        shouldRender: visibleLinks.some(
          (visibleLink) => visibleLink.source === link.from && visibleLink.target === link.to,
        ),
      }));
    }

    return toRender;
  }, [data.links, visibleLinks]);

  const [wrapperRef, dimensions] = useDimensions({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const heightSize = 120;
  const sizedWith = dimensions.width - (320 + 16 * 2) * 2 - 16 * 2;
  const visibleWidth = d3.min([sizedWith, 650])!;
  const levelSize = data.maxDepth;
  const columnSize = 100;
  let fixedWidth = columnSize * levelSize;
  if (levelSize > 0 && visibleWidth / levelSize < columnSize)
    fixedWidth = visibleWidth + (columnSize - visibleWidth / levelSize) * levelSize;
  else if (levelSize > 0 && visibleWidth / levelSize > columnSize)
    fixedWidth = visibleWidth - (visibleWidth / levelSize - columnSize) * levelSize;

  const { svgRef, zoomRef } = useD3Render({
    render(svg) {
      const simulation = d3
        .forceSimulation(nodes)
        .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
        .force("collide", d3.forceCollide(radius * 2))
        .force("link", d3.forceLink(links).strength(0.05))
        .force("y", d3.forceY<SimulationNode>((n) => n.height * heightSize).strength(1))
        .force(
          "x",
          d3
            .forceX<SimulationNode>(({ height, depth, maxDepth }) => {
              const isHeightOdd = height % 2 === 0;
              const increment = Number(isHeightOdd) * (columnSize / 2);
              const stripSize =
                maxDepth === 0
                  ? (fixedWidth - columnSize / 2) / 2
                  : depth * (fixedWidth / maxDepth);
              return stripSize + increment;
            })
            .strength(1),
        );

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
          svg
            .selectAll(".hide-render-link")
            .classed(sourceEdgeClass, false)
            .classed(targetEdgeClass, false);
          svg
            .selectAll(".hide-render-link-marker")
            .classed(sourceMarkerClass, false)
            .classed(targetMarkerClass, false);
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
          svg.selectAll(".hide-render-link").classed(colors.highlight.edge.stroke, false);
          svg.selectAll(".hide-render-link-marker").classed(colors.highlight.edge.fill, false);
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

      function onTick() {
        // The source property comes from the SimulationLinkDatum interface, and by default,
        // has a type of TypeOfNode | string | number, where TypeOfNode is SimulationNode, so we
        // need to make an `as assertion`. The x,y properties added by the SimulationNodeDatum
        // interface are of type number | undefined, so a non-null assertion operator is used

        const getX = (value: number | d3.SimulationNodeDatum) =>
          typeof value === "number" ? 0 : value.x ?? 0;
        const getY = (value: number | d3.SimulationNodeDatum) =>
          typeof value === "number" ? 0 : value.y ?? 0;

        const getMiddleX = (link: SimulationLink) => (getX(link.source) + getX(link.target)) / 2;
        const getMiddleY = (link: SimulationLink) => (getY(link.source) + getY(link.target)) / 2;

        const getLinkTextBB = (link: SimulationLink) => {
          const textId = parseLinkToLinkId(link) + "-text";
          const text = document.getElementById(textId);
          if (!text) return undefined;

          const textSvg = text as unknown as SVGGraphicsElement;
          return textSvg.getBBox();
        };

        node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
        nodeId.attr("x", (d) => d.x!).attr("y", (d) => d.y! + 6);

        link.attr("d", (link) => {
          const sourceX = getX(link.source); // x1
          const sourceY = getY(link.source); // y1
          const targetX = getX(link.target); // x2
          const targetY = getY(link.target); // y2

          const diffX = targetX - sourceX;
          const diffY = targetY - sourceY;

          // Length of path from center of source node to center of target node
          const pathLength = Math.sqrt(diffX * diffX + diffY * diffY);
          const arrowOffset = 8;

          // X and Y distances from center to outside edge of target node
          const nodeRadius = radius + arrowOffset + strokeWidth / 2;
          const offsetX = (diffX * nodeRadius) / pathLength;
          const offsetY = (diffY * nodeRadius) / pathLength;

          const startingPoint = `${sourceX + offsetX},${sourceY + offsetY}`;
          const endingPoint = `${targetX - offsetX},${targetY - offsetY}`;

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

      simulation.on("tick", onTick);

      function onDragStart(
        event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>,
      ) {
        if (!event.active) simulation.alphaTarget(0.05).restart();
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
        simulation.stop();
      }

      node.call(
        d3
          .drag<SVGCircleElement, SimulationNode>()
          .on("start", onDragStart)
          .on("drag", onDrag)
          .on("end", onDragEnd),
      );
    },
    onZoom: (svg, g) => {
      // fixes zooming on Mozilla Firefox.
      if (navigator.userAgent.indexOf("Firefox") !== -1) g.style("transform-origin", "50% 50% 0");

      const onZoom = ({ transform }: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr("transform", transform.toString());
      };

      const zoomHandler = d3
        .zoom<SVGSVGElement, unknown>()
        .extent([
          [0, 0],
          [dimensions.width, dimensions.height],
        ])
        .scaleExtent([0.5, 10])
        .on("zoom", onZoom);
      svg.call(zoomHandler);
    },
    renderDependencies: [graphId],
    zoomDependencies: [dimensions.height, dimensions.width],
  });

  const labelIncrement = Number(data.startsAt1);

  return (
    <div ref={wrapperRef} className="h-screen w-screen ">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <text x="16" y="95%" className="fill-slate-500 stroke-1 text-xs" pointerEvents="none">
          {data.description}
        </text>
        <text x="16" y="97.5%" className="fill-slate-500 stroke-1 text-xs" pointerEvents="none">
          {`${dimensions.width}px x ${dimensions.height}px`}
        </text>
        <g ref={zoomRef}>
          <g id="links">
            {links.map((link) => {
              const linkId = parseLinkToLinkId(link);
              return (
                <g
                  key={linkId}
                  className={cn({ "pointer-events-none opacity-10": !link.shouldRender })}
                >
                  <defs>
                    <marker
                      id={`link-arrow-from-${link.from}-to-${link.to}`}
                      markerWidth="5"
                      markerHeight="5"
                      refX="7"
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
                          `link-source-${link.from}-marker link-target-${link.to}-marker`,
                          {
                            "hide-render-link-marker": !link.shouldRender,
                          },
                        )}
                      />
                    </marker>
                  </defs>
                  <path
                    className={cn(
                      colors.default.stroke,
                      "link transition-[stroke] duration-300",
                      `link-source-${link.from} link-target-${link.to}`,
                      {
                        "hide-render-link": !link.shouldRender,
                      },
                    )}
                    strokeWidth={3}
                    markerEnd={`url(#link-arrow-from-${link.from}-to-${link.to})`}
                    strokeLinecap="round"
                  />
                  <rect
                    rx="4"
                    id={`${linkId}-text-background`}
                    className={cn({
                      [colors.default.fill]: data.renderWeights,
                      "stroke-zinc-500 stroke-1": data.renderWeights,
                      "fill-none stroke-none": !data.renderWeights,
                      hidden: !link.shouldRender,
                    })}
                  />
                  <text
                    id={`${linkId}-text`}
                    textAnchor="middle"
                    className={cn("text-[10px]", {
                      "fill-zinc-200 dark:fill-zinc-500": data.renderWeights,
                      "fill-none": !data.renderWeights,
                      hidden: !link.shouldRender,
                    })}
                    pointerEvents="none"
                  >
                    {link.weight}
                  </text>
                </g>
              );
            })}
          </g>
          <g id="nodes" strokeWidth={strokeWidth}>
            {nodes.map((node) => (
              <g
                key={node.id}
                className={cn({
                  "pointer-events-none opacity-10": !node.shouldRender,
                  "stroke-white": node.shouldRender,
                })}
              >
                <circle
                  key={node.id}
                  r={radius}
                  className={cn("cursor-pointer", color(getNodeColor(node)))}
                />
                <text
                  textAnchor="middle"
                  className="fill-slate-50 stroke-none"
                  pointerEvents="none"
                >
                  {node.id + labelIncrement}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
