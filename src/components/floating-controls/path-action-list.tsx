import { Button } from "~/components/ui/button";

type PathActionListProps = {
  increment: number;
  paths: number[][];
};

export function PathActionList({ increment, paths }: PathActionListProps) {
  return (
    <div className="flex flex-col gap-2">
      {paths.map((path) => {
        const pathRender = `[${path.map((node) => node + increment).join(", ")}]`;
        return (
          <Button variant="ghost" key={pathRender}>
            {pathRender}
          </Button>
        );
      })}
    </div>
  );
}
