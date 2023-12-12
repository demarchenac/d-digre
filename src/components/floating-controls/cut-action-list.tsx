import { type STCutMetadata } from "~/types";
import { CutActionControl } from "./cut-action-control";

type CutActionListProps = {
  increment: number;
  cuts: STCutMetadata[];
};

export function CutActionList({ increment, cuts }: CutActionListProps) {
  return (
    <div className="flex flex-col gap-2">
      {cuts.map((cut) => (
        <CutActionControl key={cut.id} increment={increment} cut={cut} />
      ))}
    </div>
  );
}
