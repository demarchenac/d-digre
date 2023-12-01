import type { Link } from "~/types";

const decodableLinkSeparator = ":";

export function parseLinkToLinkId(link: Link) {
  return [link.source, link.target, link.weight].join(decodableLinkSeparator);
}

export function parseToPartialLinkId(source: number, target: number) {
  return [source, target].join(decodableLinkSeparator);
}

export function parseLinkIdToLink(linkId: string): Link {
  const [source, target, weight] = linkId.split(decodableLinkSeparator).map((arg) => +arg);
  return { source, target, weight } as Link;
}
