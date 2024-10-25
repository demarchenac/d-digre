import { copy } from "~/lib/helpers";
import { canRelabelBackwards } from "./canRelabelBackwards";
import { doRelabelBackwards } from "./doRelabelBackwards";
import type { Relabel } from "./types";

export const relabelBackwards: Relabel = (from, config) => {
  const mutableConfig = copy(config);

  const canPushFromTo = canRelabelBackwards(from, mutableConfig);
  if (!canPushFromTo) return { config: copy(mutableConfig), ok: false };

  return { config: doRelabelBackwards(from, config), ok: true };
};
