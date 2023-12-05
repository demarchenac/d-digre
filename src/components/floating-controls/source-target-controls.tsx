import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { type STCutMetadata } from "~/types";
import { PathActionList } from "./path-action-list";
import { CutActionList } from "./cut-action-list";

type SourceTargetControlsProps = {
  increment: number;
  source: number;
  target: number;
  paths: number[][];
  cuts: STCutMetadata[];
};

export function SourceTargetControls({
  increment,
  source,
  target,
  paths,
  cuts,
}: SourceTargetControlsProps) {
  const fixedSource = source + increment;
  const fixedTarget = target + increment;
  const key = `from_${fixedSource}_to_${fixedTarget}`;
  const description = `From ${fixedSource} to ${fixedTarget}`;
  return (
    <Accordion type="single" collapsible key={key}>
      <AccordionItem value="item-1">
        <AccordionTrigger>{description}</AccordionTrigger>
        <AccordionContent>
          <div className="border-l-4 border-l-slate-800 pl-2">
            <Accordion type="single" collapsible>
              <AccordionItem value="paths">
                <AccordionTrigger>Paths: {paths.length}</AccordionTrigger>
                <AccordionContent>
                  <PathActionList increment={increment} paths={paths} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>Cuts: {cuts.length}</AccordionTrigger>
                <AccordionContent>
                  <CutActionList increment={increment} cuts={cuts} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
