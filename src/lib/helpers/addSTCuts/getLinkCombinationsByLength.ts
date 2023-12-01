import { type Link } from "~/types";

export function* getLinkCombinationsByLength(links: Link[], length: number): Generator<Link[]> {
  if (length === 1) {
    for (const link of links) {
      yield [link];
    }
  } else if (length > 1) {
    for (let linkIndex = 0; linkIndex <= links.length - length; linkIndex++) {
      const smallerCombinations = getLinkCombinationsByLength(
        links.slice(linkIndex + 1),
        length - 1,
      );

      for (const combination of smallerCombinations) {
        const linkToAdd = links[linkIndex];
        if (linkToAdd) {
          yield [linkToAdd, ...combination];
        }
      }
    }
  }
}
