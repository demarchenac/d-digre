import { type Graph } from "~/types";
import { parseLinkToId } from "./parseLinkToId";

export function parseGraphToId(graph: Graph) {
  const linkIds = graph.links.map(parseLinkToId);
  return linkIds.join(",");
}
