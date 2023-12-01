import { type getSTPaths } from "./getSTPaths";
import { parseToPartialLinkId } from "../linkAndIdParsing";

type AreSTPathsBlockedProps = {
  stPaths: ReturnType<typeof getSTPaths>;
  linkIds: string[];
};

export function areSTPathsBlocked({ stPaths, linkIds }: AreSTPathsBlockedProps) {
  const pathsFlow = stPaths.map((stPath) => {
    let canFlowOnPath = true;
    for (let targetIndex = 1; targetIndex < stPath.length; targetIndex++) {
      const linkSource = stPath[targetIndex - 1];
      const linkTarget = stPath[targetIndex];
      if (linkSource === undefined || linkTarget === undefined) break;

      const linkIdQuery = parseToPartialLinkId(linkSource, linkTarget);
      const sourceTargetLink = linkIds.find((linkId) => linkId.startsWith(linkIdQuery));
      if (!sourceTargetLink) canFlowOnPath = false;
    }

    return canFlowOnPath;
  });

  return !pathsFlow.some(Boolean);
}
