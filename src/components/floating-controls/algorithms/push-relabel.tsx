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
import {
  algorithmAtom,
  graphAtom,
  sourceTargetPairAtom,
  stateAtom,
  trimmingMethodAtom,
} from "~/lib/jotai";
import { cn } from "~/lib/utils";
import type { RawPairPattern, AppState, TrimmedPairPattern, TrimmingMethod } from "~/types";

const nonPermissibleStatus: AppState[] = ["no-graph", "graph-loaded"];

export function WithPushRelabelControls() {
  const [state, setState] = useAtom(stateAtom, { store: useStore() });
  const algorithm = useAtomValue(algorithmAtom, { store: useStore() });
  const graph = useAtomValue(graphAtom, { store: useStore() });
  const [pair, setPair] = useAtom(sourceTargetPairAtom, { store: useStore() });
  const [trimmingMethod, setTrimmingMethod] = useAtom(trimmingMethodAtom, { store: useStore() });

  if (nonPermissibleStatus.includes(state)) return null;
  if (algorithm !== "push-relabel") return null;
  if (!graph) return null;

  const labelIncrement = Number(graph.startsAt1 ?? false);

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
      setTrimmingMethod(undefined);
      setState("selected-raw-source-target");
    };

    return (
      <div className="m-2.5" key={key}>
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

  const trimmedActions = Object.keys(graph.pushRelabel.trimmed).map((key) => {
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
      setTrimmingMethod(undefined);
      setState("selected-trimmed-source-target");
    };

    return (
      <div className="m-2.5" key={key}>
        <Button
          variant="ghost"
          onClick={onPairClick}
          className={cn("flex w-full gap-2", { "ring-2 ring-green-600": key === pair })}
        >
          {getIcon()}
          <span>
            Source: {sourceLabel}, Target: {targetLabel} = {maxFlow}
          </span>
        </Button>
      </div>
    );
  }) as JSX.Element[];

  const mergedTrimmedActions = Object.keys(graph.pushRelabel.trimmedMerged).map((key) => {
    const method = key as TrimmingMethod;

    if (method === undefined) return null;

    const getIcon = () => {
      if (method.includes("first" as TrimmingMethod)) return <ArrowDown01 size={18} />;
      if (method.includes("longest" as TrimmingMethod)) return <MoveHorizontal size={18} />;
      if (method.includes("random" as TrimmingMethod)) return <Shuffle size={18} />;
    };

    const getTitle = () => {
      if (method === "first") return "First Path";
      if (method === "longest") return "Longest Path";
      if (method === "random") return "Random Path";
    };

    const onPairClick = () => {
      if (trimmingMethod === method) return;

      setPair(undefined);
      setTrimmingMethod(method);
      setState("selected-trimmed-merged");
    };

    return (
      <div className="m-2.5" key={key}>
        <Button
          variant="ghost"
          onClick={onPairClick}
          className={cn("flex w-full gap-2", { "ring-2 ring-green-600": key === trimmingMethod })}
        >
          {getIcon()}
          <span>{getTitle()}</span>
        </Button>
      </div>
    );
  }) as JSX.Element[];

  const onResetClick = () => {
    setPair(undefined);
    setTrimmingMethod(undefined);
    setState("ran-algorithm");
  };

  const onSelectRawMergedClick = () => {
    setPair(undefined);
    setTrimmingMethod(undefined);
    setState("selected-raw-merged");
  };

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

      {trimmedActions.length > 0 && (
        <Accordion type="single" collapsible key="trimmed-actions">
          <AccordionItem value="paths">
            <AccordionTrigger className="pt-0">Trimmed Subgraphs</AccordionTrigger>
            <AccordionContent>{trimmedActions}</AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      <Button key="raw-merged" variant="ghost" onClick={onSelectRawMergedClick}>
        Raw Subgraphs Merged
      </Button>

      {mergedTrimmedActions.length > 0 && (
        <Accordion type="single" collapsible key="trimmed-merged-actions">
          <AccordionItem value="paths">
            <AccordionTrigger className="pt-0">Trimmed Subgraphs Merged</AccordionTrigger>
            <AccordionContent>{mergedTrimmedActions}</AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
}
