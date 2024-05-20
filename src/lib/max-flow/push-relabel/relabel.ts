import { copy } from "~/lib/helpers";
import { canRelabel } from "./canRelabel";
import { doRelabel } from "./doRelabel";
import type { Relabel } from "./types";

export const relabel: Relabel = (from, config) => {
  const mutableConfig = copy(config);

  const canPushFromTo = canRelabel(from, mutableConfig);
  if (!canPushFromTo) return { config: copy(mutableConfig), ok: false };

  return { config: doRelabel(from, config), ok: true };
};
