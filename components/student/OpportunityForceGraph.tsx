'use client';

import ForceGraph2D, {
  type ForceGraphMethods,
  type ForceGraphProps,
} from 'react-force-graph-2d';
import type {
  OpportunityEdge,
  OpportunityNode,
} from '@/lib/opportunity-map/data';

export type OpportunityForceGraphProps = ForceGraphProps<
  OpportunityNode,
  OpportunityEdge
> & {
  graphRef: React.MutableRefObject<
    ForceGraphMethods<OpportunityNode, OpportunityEdge> | undefined
  >;
};

export function OpportunityForceGraph({
  graphRef,
  ...props
}: OpportunityForceGraphProps) {
  return (
    <ForceGraph2D<OpportunityNode, OpportunityEdge> ref={graphRef} {...props} />
  );
}
