export type DirectedNode = {
  isSelected: boolean;
  id: number;
  set?: 1 | 2 | 3;
  outgoing: number[];
  incoming: number[];
};

export type BiDirectedNode = {
  id: number;
  connectedTo: number[];
};

export type Link = {
  source: number;
  target: number;
  weight: number;
  isSelected: boolean;
};

export type PushRelabelIteration = {
  flow: number[][];
  excess: number[];
  height: number[];
  seen: number[];
  p: number;
};

export type PushRelabelMetadata = {
  maxFlow: number;
  iterations: PushRelabelIteration[];
  flow: number[][];
};

export type DirectedGraph = {
  startsAt1: boolean;
  renderWeights: boolean;
  description: string;
  sources: number[];
  targets: number[];
  adjacency: number[][];
  nodes: DirectedNode[];
  links: Link[];
  pushRelabel: Record<`${number}_${number}`, PushRelabelMetadata>;
};

export type BiDirectedGraph = {
  nodes: BiDirectedNode[];
  links: Link[];
};

export type STCut = {
  capacity: number;
  sources: number[];
  targets: number[];
};

export type STCutMetadata = {
  id: string;
  capacity: number;
  sources: number[];
  targets: number[];
  cut: Link[];
};
