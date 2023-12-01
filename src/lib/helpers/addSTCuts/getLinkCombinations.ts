import { type Link } from "~/types";
import { getLinkCombinationsByLength } from "./getLinkCombinationsByLength";
import { parseLinkToLinkId } from "../linkAndIdParsing";

type GetLinkCombinationsProps = {
  nodeCount: number;
  links: Link[];
};

export function getLinkCombinations({ nodeCount, links }: GetLinkCombinationsProps) {
  let combinations: string[][] = [];
  for (let linksToPick = 2; linksToPick < nodeCount; linksToPick++) {
    const combinationsByLengthGenerator = getLinkCombinationsByLength(links, linksToPick);
    const rawCombinationsByLength = Array.from(combinationsByLengthGenerator);
    const combinationsByLength = rawCombinationsByLength.map((combination) =>
      combination.map(parseLinkToLinkId),
    );

    combinations = combinations.concat(combinationsByLength);
  }

  return combinations;
}
