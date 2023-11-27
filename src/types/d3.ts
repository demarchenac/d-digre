import type { Node, Link } from "./graph";

export type SimulationNode = d3.SimulationNodeDatum & Node;

export type SimulationLink = d3.SimulationLinkDatum<SimulationNode> &
  Link & {
    boundingBox?: DOMRect;
  };
