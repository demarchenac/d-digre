"use client";

import { useSetAtom } from "jotai";
import { Button } from "~/components/ui/button";
import { activePath } from "~/lib/jotai";

type PathActionControlProps = {
  increment: number;
  path: number[];
};

export function PathActionControl({ path, increment }: PathActionControlProps) {
  const setActivePath = useSetAtom(activePath);
  const onCutClick = (path: number[]) => setActivePath(path);
  const pathRender = `[${path.map((node) => node + increment).join(", ")}]`;

  return (
    <Button variant="ghost" onClick={() => onCutClick(path)}>
      {pathRender}
    </Button>
  );
}
