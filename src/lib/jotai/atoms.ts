import { atom } from "jotai";
import type { AppState, Graph } from "~/types";

export const stateAtom = atom<AppState>("no-graph");
export const graphAtom = atom<Graph | undefined>(undefined);
