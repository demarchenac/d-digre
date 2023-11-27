export type Node = {
  id: number;
  set?: 1 | 2 | 3;
  outgoing: number[];
  incoming: number[];
};

export type Link = {
  source: number;
  target: number;
  weight: number;
};

export type STCut = {
  capacity: number;
  s: number[];
  t: number[];
};

export type Graph = {
  startsAt1: boolean;
  description: string;
  sources: number[];
  targets: number[];
  adjacency: number[][];
  nodes: Node[];
  links: Link[];
  stCuts: Record<string, STCut>;
};
