import type { DirectedNode, Link } from "~/types";
import { range } from "./range";

export function getNodesAndLinks(capacities: number[][]) {
  const nodeList = range(0, capacities.length);

  const nodes: DirectedNode[] = nodeList.map((node) => ({
    isSelected: false,
    shouldRender: true,
    height: 0,
    depth: 0,
    maxDepth: 0,
    id: node,
    outgoing: [],
    incoming: [],
  }));

  const links: Link[] = [];

  nodeList.forEach((source) =>
    nodeList.forEach((target) => {
      const link = {
        source,
        target,
        from: source,
        to: target,
        weight: capacities[source]?.[target] ?? 0,
        isSelected: false,
        shouldRender: true,
      };
      if (link.weight > 0) links.push(link);
    }),
  );

  links.forEach(({ from: source, to: target }) => {
    nodes[source]?.outgoing.push(target);
    nodes[target]?.incoming.push(source);
  });

  return { nodes, links };
}
