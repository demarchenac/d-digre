import type { BiDirectedGraph, BiDirectedNode, DirectedGraph } from "~/types";
import { parseLinkToLinkId } from "../linkAndIdParsing";

export function parseDirectedToBiDirected(
  graph: DirectedGraph,
  linkIdsToIgnore?: string[],
): BiDirectedGraph {
  let links = graph.links;
  if (linkIdsToIgnore) {
    links = links.filter((link) => !linkIdsToIgnore.includes(parseLinkToLinkId(link)));
  }

  const nodes: BiDirectedNode[] = graph.nodes.map((node) => {
    let incoming = node.incoming;
    let outgoing = node.outgoing;

    if (linkIdsToIgnore) {
      incoming = incoming.filter((source) => {
        const match = links.find((link) => link.source === source && link.target === node.id);
        return Boolean(match);
      });

      outgoing = outgoing.filter((target) => {
        const match = links.find((link) => link.source === node.id && link.target === target);
        return Boolean(match);
      });
    }

    return { id: node.id, connectedTo: incoming.concat(outgoing) };
  });

  return { nodes, links };
}
