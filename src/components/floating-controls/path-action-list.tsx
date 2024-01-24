import { PathActionControl } from "./path-action-control";

type PathActionListProps = {
  increment: number;
  paths: number[][];
};

export function PathActionList({ increment, paths }: PathActionListProps) {
  return (
    <div className="flex flex-col gap-2">
      {paths.map((path) => (
        <PathActionControl key={path.join("-")} path={path} increment={increment} />
      ))}
    </div>
  );
}
