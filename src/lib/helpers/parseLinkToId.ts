import { type SimulationLink } from "~/types";

export function parseLinkToId(link: SimulationLink) {
  const unsafeSource = link.source as Record<"id", number>;
  const unsafeTarget = link.target as Record<"id", number>;

  if (typeof unsafeSource.id === "number" && typeof unsafeTarget.id === "number") {
    return `${unsafeSource.id}-${unsafeTarget.id}=${link.weight}`;
  }

  return `${link.source}-${link.target}=${link.weight}`;
}
