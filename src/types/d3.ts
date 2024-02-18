import type { DirectedNode, Link } from "./graph";

export type SimulationNode = d3.SimulationNodeDatum & DirectedNode;

export type SimulationLink = d3.SimulationLinkDatum<SimulationNode> &
  Link & {
    boundingBox?: DOMRect;
  };
