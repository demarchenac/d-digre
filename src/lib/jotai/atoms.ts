import { atom } from "jotai";
import type { AppState, DirectedGraph, STCutMetadata, SelectedAlgorithm } from "~/types";

export const stateAtom = atom<AppState>("no-graph");
export const graphAtom = atom<DirectedGraph | undefined>(undefined);
export const algorithmAtom = atom<SelectedAlgorithm>("none");
export const sourceTargetPairAtom = atom<`${number}_${number}` | undefined>(undefined);
export const activePath = atom<number[]>([]);
export const activeCut = atom<STCutMetadata | undefined>(undefined);
