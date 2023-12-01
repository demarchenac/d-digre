import { atom } from "jotai";
import type { AppState, DirectedGraph } from "~/types";

export const stateAtom = atom<AppState>("no-graph");
export const graphAtom = atom<DirectedGraph | undefined>(undefined);
