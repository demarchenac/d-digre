import { type STCutMetadata } from "~/types";
import { Button } from "~/components/ui/button";
import { Equal, MoveRight } from "lucide-react";

type CutActionControlProps = {
  increment: number;
  cut: STCutMetadata;
};

export function CutActionControl({ cut, increment }: CutActionControlProps) {
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
}
