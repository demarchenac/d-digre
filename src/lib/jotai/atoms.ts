import { atom } from "jotai";
import type {
  AppState,
  DirectedGraph,
  PairPattern,
  SelectedAlgorithm,
  TrimmingMethod,
} from "~/types";

export const stateAtom = atom<AppState>("no-graph");
export const graphAtom = atom<DirectedGraph | undefined>(undefined);
export const algorithmAtom = atom<SelectedAlgorithm>("none");
export const sourceTargetPairAtom = atom<PairPattern | undefined>(undefined);
export const trimmingMethodAtom = atom<TrimmingMethod | undefined>(undefined);
