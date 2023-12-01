import { type DirectedGraph } from "~/types";
import { parseLinkToLinkId } from "./linkAndIdParsing";

export function parseGraphToId(graph: DirectedGraph) {
  const linkIds = graph.links.map(parseLinkToLinkId);
  return linkIds.join("-");
}
