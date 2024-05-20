import { MaxFlowAlgorithm } from "../types";

export type Pair = { from: number; to: number };

export type Config = {
  queue: number[];
  middleNodes: number[];
  heights: number[];
  excesses: number[];
  capacities: number[][];
  edges: number[][];
  residualEdges: number[][];
  flow: number[][];
};

export type AddToQueue = (node: number, config: Config, prefix?: string) => Config;

export type GetResidualCapacityOf = (args: Pair, config: Config) => number;

export type IsActive = (node: number, config: Config) => boolean;

export type CanPush = (args: Pair, config: Config) => boolean;
export type DoPush = (args: Pair, config: Config, decorator?: string) => Config;

export type CanRelabel = (from: number, config: Config) => boolean;
export type DoRelabel = (from: number, config: Config) => Config;

export type Relabel = (from: number, config: Config) => { config: Config; ok: boolean };

export type PushOrRelabel = (from: number, config: Config) => Config;

export type Discharge = (config: Config) => Config;

export type PushRelabel = MaxFlowAlgorithm<Config>;
export type InitializeHeights = (...args: Parameters<PushRelabel>) => number[];
export type Initialize = (...args: Parameters<PushRelabel>) => Config;
