import { type TrimmingMethod, type PairPattern } from "./state";

export type DirectedNode = {
  isSelected: boolean;
  shouldRender: boolean;
  id: number;
  set?: 1 | 2 | 3;
  outgoing: number[];
  incoming: number[];
  height: number;
  depth: number;
  maxDepth: number;
};

export type BiDirectedNode = {
  id: number;
  connectedTo: number[];
};

export type Link = {
  from: number;
  to: number;
  source: number;
  target: number;
  weight: number;
  isSelected: boolean;
  shouldRender: boolean;
};

export type AlgorithmMetadata = {
  maxFlow: number;
  nodeCount: number;
  targets: number[];
  flow: number[][];
  paths: number[][];
  capacities: number[][];
  adjacency: (0 | 1)[][];
};

export type DirectedGraph = {
  startsAt1: boolean;
  renderWeights: boolean;
  maxDepth: number;
  description: string;
  sources: number[];
  targets: number[];
  capacities: number[][];
  adjacency: (0 | 1)[][];
  nodes: DirectedNode[];
  links: Link[];
  pushRelabel: {
    raw: Record<PairPattern, AlgorithmMetadata>;
    trimmed: Record<PairPattern, AlgorithmMetadata>;
    rawMerged?: AlgorithmMetadata;
    trimmedMerged: Record<TrimmingMethod, AlgorithmMetadata> | Record<string, never>;
  };
};

export type BiDirectedGraph = {
  nodes: BiDirectedNode[];
  links: Link[];
};

export type DownloadableGraph = {
  nodeCount: number;
  maxFlow: number;
  targetCount: number;
  targets: number[];
  adjacency: (0 | 1)[][];
};
