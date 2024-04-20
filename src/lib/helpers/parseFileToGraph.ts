import type { DirectedGraph } from "~/types";
import { findSourceTargetPaths } from "./findSourceTargetPaths";
import { zeros } from "./zeros";
import { getFileLines } from "./getFileLines";
import { getMetadataFromLines } from "./getMetadataFromLines";
import { isSquared } from "./isSquared";
import { getNodesAndLinks } from "./getNodesAndLinks";

export async function parseFileToGraph({
  file,
  startsAt1,
}: {
  file?: File;
  startsAt1: boolean;
}): Promise<DirectedGraph | undefined> {
  if (!file) {
    console.error("Expected a file to parse");
    alert("Expected a file to parse");
    return;
  }

  const lines = await getFileLines(file);
  const metadata = getMetadataFromLines(lines, startsAt1);

  if (!isSquared(metadata.capacities)) {
    console.error("Graph isn't squared");
    alert("Graph isn't squared");
    return;
  }

  const { nodes, links } = getNodesAndLinks(metadata.capacities);

  const sources = nodes
    .map(({ id, incoming }) => (incoming.length === 0 ? id : null))
    .filter((id) => id !== null) as number[];

  // compute heights
  nodes.forEach(({ id }) => {
    if (sources.includes(id)) return;

    const node = nodes[id];
    if (!node) return;

    let longest: number[] = [];

    for (const source of sources) {
      const paths = findSourceTargetPaths(metadata.adjacency, source, node.id);
      paths.sort((a, b) => {
        if (a.length > b.length) return -1;
        else if (a.length < b.length) return 1;
        return 0;
      });

      const longestPath = paths.at(0);

      if (!longestPath) continue;
      if (longestPath.length < longest.length) continue;

      longest = Array.from(longestPath);
    }

    node.height = longest.length - 1;
  });

  const heights = Array.from(new Set(nodes.map((n) => n.height))).sort();
  const depths = zeros(heights.length);

  // enumerate nodes per level with computed depth and keep track of maxDepth per level
  heights.forEach((height) => {
    let depth = 0;
    const levelNodes = nodes.filter((node) => node.height === height);
    levelNodes.forEach(({ id }, index) => {
      const node = nodes[id];
      if (!node) return;

      node.depth = depth;

      if (index === levelNodes.length - 1) depths[height] = depth;

      depth++;
    });
  });

  // set maxDepth for each node at its corresponding level
  heights.forEach((height) => {
    const levelNodes = nodes.filter((node) => node.height === height);
    levelNodes.forEach(({ id }) => {
      const node = nodes[id];
      if (!node) return;
      node.maxDepth = depths[height] ?? 0;
    });
  });

  const targets = nodes
    .map(({ id, outgoing }) =>
      lines.at(1)?.includes(`${id + Number(metadata.startsAt1)}`) && outgoing.length === 0
        ? id
        : null,
    )
    .filter((id) => id !== null) as number[];

  nodes.forEach(({ id }) => {
    const node = nodes[id];
    if (!node) return;

    const isSource = sources.includes(id);
    const isTarget = targets.includes(id);

    if (!isSource && !isTarget) node.set = 2;
    else if (isSource) node.set = 1;
    else if (isTarget) node.set = 3;
  });

  const graph: DirectedGraph = {
    ...metadata,
    maxDepth: Math.max(...depths),
    renderWeights: false,
    sources,
    targets,
    nodes,
    links,
    pushRelabel: { raw: {}, trimmed: {}, trimmedMerged: {} },
  };

  console.log({ graph });

  return graph;
}
