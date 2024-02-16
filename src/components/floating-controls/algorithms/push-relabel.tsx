"use client";

import { useAtom, useAtomValue, useStore } from "jotai";
import { ArrowDown01, MoveHorizontal, Shuffle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { algorithmAtom, graphAtom, sourceTargetPairAtom, stateAtom } from "~/lib/jotai";
import { cn } from "~/lib/utils";
import type { RawPairPattern, AppState, TrimmedPairPattern, TrimmingMethod } from "~/types";

const nonPermissibleStatus: AppState[] = ["no-graph", "graph-loaded"];

export function WithPushRelabelControls() {
  const [state, setState] = useAtom(stateAtom, { store: useStore() });
  const algorithm = useAtomValue(algorithmAtom, { store: useStore() });
  const graph = useAtomValue(graphAtom, { store: useStore() });
  const [pair, setPair] = useAtom(sourceTargetPairAtom, { store: useStore() });

  if (nonPermissibleStatus.includes(state)) return null;
  if (algorithm !== "push-relabel") return null;
  if (!graph) return null;

  const labelIncrement = Number(graph.startsAt1 ?? false);

  const onResetClick = () => {
    setPair(undefined);
    setState("ran-algorithm");
  };

  const rawActions = Object.keys(graph.pushRelabel.raw).map((key) => {
    const literalKey = key as RawPairPattern;
    const [source, target] = literalKey.split(":").at(-1)!.split("_").map(Number);
    const maxFlow = graph.pushRelabel.raw[literalKey]!.maxFlow;

    if (source === undefined || target === undefined) return null;

    const sourceLabel = (source + labelIncrement).toString();
    const targetLabel = (target + labelIncrement).toString();

    const onPairClick = () => {
      if (pair === literalKey) return;

      setPair(literalKey);
      setState("selected-raw-source-target");
    };

    return (
      <div className="m-2" key={key}>
        <Button
          variant="ghost"
          onClick={onPairClick}
          className={cn("w-full", { "ring-2 ring-green-600": key === pair })}
        >
          Source: {sourceLabel}, Target: {targetLabel} = {maxFlow}
        </Button>
      </div>
    );
  }) as JSX.Element[];

  const minifyActions = Object.keys(graph.pushRelabel.trimmed).map((key) => {
    const literalKey = key as TrimmedPairPattern;
    const [source, target] = literalKey.split(":").at(-1)!.split("_").map(Number);
    const maxFlow = graph.pushRelabel.trimmed[literalKey]!.maxFlow;

    if (source === undefined || target === undefined) return null;

    const sourceLabel = (source + labelIncrement).toString();
    const targetLabel = (target + labelIncrement).toString();

    const getIcon = () => {
      if (literalKey.includes("first" as TrimmingMethod)) return <ArrowDown01 size={18} />;
      if (literalKey.includes("longest" as TrimmingMethod)) return <MoveHorizontal size={18} />;
      if (literalKey.includes("random" as TrimmingMethod)) return <Shuffle size={18} />;
    };

    const onPairClick = () => {
      if (pair === literalKey) return;

      setPair(literalKey);
      setState("selected-trimmed-source-target");
    };

    return (
      <div className="m-2" key={key}>
        <Button
          variant="ghost"
          onClick={onPairClick}
          className={cn("flex w-full gap-2", { "ring-2 ring-green-600": key === pair })}
        >
          {getIcon()}{" "}
          <span>
            Source: {sourceLabel}, Target: {targetLabel} = {maxFlow}
          </span>
        </Button>
      </div>
    );
  }) as JSX.Element[];

  return (
    <>
      <Button key="reset-pair" variant="ghost" onClick={onResetClick}>
        Render Everything
      </Button>
      <Accordion type="single" collapsible key="raw-actions">
        <AccordionItem value="paths">
          <AccordionTrigger className="pt-0">Raw Subgraphs</AccordionTrigger>
          <AccordionContent>{rawActions}</AccordionContent>
        </AccordionItem>
      </Accordion>
      {minifyActions.length > 0 && (
        <Accordion type="single" collapsible key="trimmed-actions">
          <AccordionItem value="paths">
            <AccordionTrigger className="pt-0">Trimmed Subgraphs</AccordionTrigger>
            <AccordionContent>{minifyActions}</AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
}
