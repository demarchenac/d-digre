import { getFileLines } from "./getFileLines";
import { getMetadataFromLines } from "./getMetadataFromLines";
import { isSquared } from "./isSquared";
import { getNodesAndLinks } from "./getNodesAndLinks";

type parseFileToMetadataArguments = { file?: File; startsAt1?: boolean };

export async function parseFileToAlgorithmMetadata({
  file,
  startsAt1,
}: parseFileToMetadataArguments) {
  if (!file) {
    console.error("Expected a file to parse");
    alert("Expected a file to parse");
    return;
  }

  const lines = await getFileLines(file);
  const { capacities, adjacency } = getMetadataFromLines(lines, startsAt1);

  if (!isSquared(capacities)) {
    console.error("Graph isn't squared");
    alert("Graph isn't squared");
    return;
  }

  const { nodes } = getNodesAndLinks(capacities);

  const sources = nodes
    .map(({ id, incoming }) => (incoming.length === 0 ? id : null))
    .filter((id) => id !== null) as number[];

  const targets = nodes
    .map(({ id, outgoing }) =>
      lines.at(1)?.includes(`${id}`) && outgoing.length === 0 ? id : null,
    )
    .filter((id) => id !== null) as number[];

  return {
    adjacency,
    capacities,
    sources,
    targets,
  };
}
