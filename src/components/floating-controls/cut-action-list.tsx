import { Equal, MoveRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { type STCutMetadata } from "~/types";

type CutActionListProps = {
  increment: number;
  cuts: STCutMetadata[];
};

export function CutActionList({ increment, cuts }: CutActionListProps) {
  return (
    <div className="flex flex-col gap-2">
      {cuts.map((cut) => {
        const sources = `[${cut.sources.map((node) => node + increment).join(", ")}]`;
        const targets = `[${cut.targets.map((node) => node + increment).join(", ")}]`;
        const key = `${sources}-${targets}:${cut.capacity}`;
        return (
          <Button variant="ghost" key={key}>
            <div className="flex gap-2">
              <span>{sources}</span> <MoveRight /> <span>{targets}</span> <Equal />{" "}
              <span>{cut.capacity}</span>
            </div>
          </Button>
        );
      })}
    </div>
  );
}
