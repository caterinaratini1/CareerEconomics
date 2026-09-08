'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Columns3,
  Compass,
  ListPlus,
  Network,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react';
import type {
  ForceGraphMethods,
  LinkObject,
  NodeObject,
} from 'react-force-graph-2d';
import { addCareerToComparison } from '@/lib/student-work/actions';
import {
  connectedNodeIds,
  NODE_BY_ID,
  OPPORTUNITY_EDGES,
  OPPORTUNITY_NODES,
  type OpportunityEdge,
  type OpportunityNode,
  type OpportunityNodeType,
} from '@/lib/opportunity-map/data';
import type { OpportunityForceGraphProps } from './OpportunityForceGraph';

const ForceGraph2D = dynamic<OpportunityForceGraphProps>(
  () =>
    import('./OpportunityForceGraph').then(
      (module) => module.OpportunityForceGraph,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="opportunity-network-loading" role="status">
        <Network aria-hidden="true" className="h-5 w-5" />
        Sto preparando la rete…
      </div>
    ),
  },
);

type GraphNode = NodeObject<OpportunityNode>;
type GraphLink = LinkObject<OpportunityNode, OpportunityEdge>;

const MAX_VISIBLE_DOORS = 5;

const TYPE_LABEL: Record<OpportunityNodeType, string> = {
  root: 'Punto di partenza',
  subject: 'Area di interesse',
  career: 'Professione',
  skill: 'Competenza',
  industry: 'Settore',
  study_path: 'Percorso di studio',
};

const TYPE_COLOR: Record<OpportunityNodeType, string> = {
  root: '#0e5c52',
  subject: '#277a68',
  career: '#b67823',
  skill: '#2e658b',
  industry: '#876234',
  study_path: '#675286',
};

const ORBIT_POSITIONS = [
  { x: 20, y: 22 },
  { x: 80, y: 22 },
  { x: 17, y: 72 },
  { x: 83, y: 72 },
  { x: 50, y: 88 },
] as const;

function endpointId(endpoint: unknown): string {
  if (typeof endpoint === 'object' && endpoint !== null && 'id' in endpoint) {
    return String(endpoint.id);
  }
  return String(endpoint);
}

function pathFromRoot(targetId: string): string[] {
  if (targetId === 'future') return ['future'];
  const queue: string[][] = [['future']];
  const visited = new Set(['future']);

  while (queue.length > 0) {
    const path = queue.shift();
    if (!path) break;
    const last = path[path.length - 1];
    if (!last) continue;
    for (const next of connectedNodeIds(last)) {
      if (visited.has(next)) continue;
      const nextPath = [...path, next];
      if (next === targetId) return nextPath;
      visited.add(next);
      queue.push(nextPath);
    }
  }
  return ['future', targetId];
}

function rankedConnections(nodeId: string): OpportunityNode[] {
  return OPPORTUNITY_EDGES.filter(
    (edge) => edge.source === nodeId || edge.target === nodeId,
  )
    .sort((a, b) => b.strength - a.strength)
    .map((edge) =>
      NODE_BY_ID.get(edge.source === nodeId ? edge.target : edge.source),
    )
    .filter((node): node is OpportunityNode => Boolean(node));
}

function doorMetric(node: OpportunityNode): string {
  return (
    node.metrics?.[0]?.value ?? `+${connectedNodeIds(node.id).length} porte`
  );
}

function connectionSummary(nodes: OpportunityNode[]): string {
  const labels = [...new Set(nodes.map((node) => TYPE_LABEL[node.type]))];
  return labels.slice(0, 3).join(', ');
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

export function OpportunityMap({ comparedSlugs }: { comparedSlugs: string[] }) {
  const graphRef = useRef<
    ForceGraphMethods<OpportunityNode, OpportunityEdge> | undefined
  >(undefined);
  const graphWrapRef = useRef<HTMLDivElement>(null);
  const [graphNodes] = useState(
    () =>
      new Map(
        OPPORTUNITY_NODES.map((node) => [node.id, { ...node } as GraphNode]),
      ),
  );
  const [networkSize, setNetworkSize] = useState({ width: 900, height: 620 });
  const [selectedId, setSelectedId] = useState('future');
  const [trail, setTrail] = useState<string[]>(['future']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [networkView, setNetworkView] = useState(false);

  const selectedNode = NODE_BY_ID.get(selectedId) ?? OPPORTUNITY_NODES[0]!;
  const previousId = trail.length > 1 ? trail[trail.length - 2] : null;
  const allDoors = useMemo(() => rankedConnections(selectedId), [selectedId]);
  const forwardDoors = allDoors.filter((node) => node.id !== previousId);
  const visibleDoors = forwardDoors.slice(0, MAX_VISIBLE_DOORS);
  const extraDoors = forwardDoors.slice(MAX_VISIBLE_DOORS);
  const compared = Boolean(
    selectedNode.careerSlug && comparedSlugs.includes(selectedNode.careerSlug),
  );

  const graphData = useMemo(
    () => ({
      nodes: OPPORTUNITY_NODES.map((node) => graphNodes.get(node.id)).filter(
        (node): node is GraphNode => Boolean(node),
      ),
      links: OPPORTUNITY_EDGES.map((edge) => ({ ...edge }) as GraphLink),
    }),
    [graphNodes],
  );

  useEffect(() => {
    const element = graphWrapRef.current;
    if (!element || !networkView) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setNetworkSize({
        width: Math.max(300, Math.floor(entry.contentRect.width)),
        height: Math.max(500, Math.floor(entry.contentRect.height)),
      });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [networkView]);

  useEffect(() => {
    if (!networkView) return;
    const graph = graphRef.current;
    if (!graph) return;
    graph.d3Force('charge')?.strength?.(-430);
    graph.d3Force('link')?.distance?.(105);
    graph.d3Force('link')?.strength?.(0.35);
    graph.d3ReheatSimulation();
    window.setTimeout(() => graph.zoomToFit(500, 72), 160);
  }, [graphData, networkView]);

  const selectNode = useCallback(
    (nodeId: string, fromTrail = false) => {
      if (!NODE_BY_ID.has(nodeId)) return;
      setSelectedId(nodeId);
      setShowMore(false);
      setTrail((current) => {
        const existingIndex = current.indexOf(nodeId);
        if (existingIndex >= 0) return current.slice(0, existingIndex + 1);
        if (fromTrail) return pathFromRoot(nodeId);
        return [...current, nodeId];
      });

      const graphNode = graphNodes.get(nodeId);
      if (networkView && graphNode) {
        window.setTimeout(() => {
          if (
            typeof graphNode.x === 'number' &&
            typeof graphNode.y === 'number'
          ) {
            graphRef.current?.centerAt(graphNode.x, graphNode.y, 550);
            graphRef.current?.zoom(1.45, 550);
          }
        }, 50);
      }
    },
    [graphNodes, networkView],
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim().toLocaleLowerCase('it');
    if (!query) return;
    const match = OPPORTUNITY_NODES.find((node) =>
      `${node.label} ${node.subtitle}`.toLocaleLowerCase('it').includes(query),
    );
    if (!match) return;
    selectNode(match.id, true);
  };

  const resetMap = () => {
    setSelectedId('future');
    setTrail(['future']);
    setSearchQuery('');
    setShowMore(false);
    if (networkView) {
      window.setTimeout(() => graphRef.current?.zoomToFit(500, 72), 60);
    }
  };

  const renderNetworkNode = useCallback(
    (
      node: GraphNode,
      context: CanvasRenderingContext2D,
      globalScale: number,
    ) => {
      if (typeof node.x !== 'number' || typeof node.y !== 'number') return;
      const isSelected = node.id === selectedId;
      const connected = new Set([selectedId, ...connectedNodeIds(selectedId)]);
      const related = connected.has(String(node.id));
      const width = node.type === 'root' || isSelected ? 82 : 68;
      const height = node.type === 'root' || isSelected ? 32 : 27;
      const x = node.x - width / 2;
      const y = node.y - height / 2;

      context.save();
      context.globalAlpha = related ? 1 : 0.16;
      context.shadowColor = isSelected
        ? 'rgba(14, 92, 82, 0.28)'
        : 'rgba(27, 36, 34, 0.08)';
      context.shadowBlur = isSelected ? 14 : 5;
      roundedRect(context, x, y, width, height, 7);
      context.fillStyle = isSelected ? '#0e5c52' : '#ffffff';
      context.fill();
      context.shadowColor = 'transparent';
      context.strokeStyle = TYPE_COLOR[node.type];
      context.lineWidth = isSelected ? 2 : 1;
      context.stroke();
      context.fillStyle = isSelected ? '#ffffff' : '#1b2422';
      context.font = `700 ${Math.max(8, 9 / globalScale)}px Inter, system-ui, sans-serif`;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      let label = node.label;
      while (
        context.measureText(label).width > width - 10 &&
        label.length > 8
      ) {
        label = `${label.slice(0, -2).trim()}…`;
      }
      context.fillText(label, node.x, node.y);
      context.restore();
    },
    [selectedId],
  );

  const paintNetworkNode = useCallback(
    (node: GraphNode, color: string, context: CanvasRenderingContext2D) => {
      if (typeof node.x !== 'number' || typeof node.y !== 'number') return;
      context.fillStyle = color;
      roundedRect(context, node.x - 42, node.y - 18, 84, 36, 8);
      context.fill();
    },
    [],
  );

  const primaryDoor = visibleDoors[0];

  return (
    <main className="opportunity-lens-page">
      <header className="opportunity-lens-header">
        <div>
          <p className="page-kicker">Esplorazione guidata</p>
          <h1 className="editorial-title mt-1 text-3xl sm:text-4xl">
            Mappa opportunità
          </h1>
          <p className="text-ink-muted mt-2 max-w-2xl text-sm sm:text-base">
            Una scelta alla volta: guarda dove sei, come ci sei arrivato e quali
            porte puoi aprire adesso.
          </p>
        </div>

        <div className="opportunity-lens-controls">
          <form
            onSubmit={handleSearch}
            className="opportunity-lens-search"
            role="search"
          >
            <Search aria-hidden="true" className="h-4 w-4" />
            <label htmlFor="opportunity-search" className="sr-only">
              Cerca nella mappa
            </label>
            <input
              id="opportunity-search"
              list="opportunity-search-options"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cerca materia, skill o professione…"
            />
            <datalist id="opportunity-search-options">
              {OPPORTUNITY_NODES.map((node) => (
                <option key={node.id} value={node.label} />
              ))}
            </datalist>
          </form>
          <button
            type="button"
            className="opportunity-quiet-control"
            onClick={resetMap}
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
            Ricomincia
          </button>
          <button
            type="button"
            aria-pressed={networkView}
            className="opportunity-quiet-control"
            onClick={() => setNetworkView((current) => !current)}
          >
            <Network aria-hidden="true" className="h-4 w-4" />
            {networkView ? 'Torna alla vista guidata' : 'Vista rete completa'}
          </button>
        </div>
      </header>

      <div className="opportunity-lens-workspace">
        <section
          className="opportunity-lens-main"
          aria-labelledby="opportunity-view-heading"
        >
          <div className="opportunity-lens-view-heading">
            <div>
              <p className="opportunity-lens-eyebrow">
                {networkView ? 'Vista rete' : 'Dove sei ora'}
              </p>
              <h2 id="opportunity-view-heading">
                {networkView
                  ? 'Tutte le connessioni'
                  : `${visibleDoors.length} prossime possibilità`}
              </h2>
            </div>
            {!networkView && previousId && (
              <button
                type="button"
                className="opportunity-previous-step"
                onClick={() => selectNode(previousId, true)}
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                {NODE_BY_ID.get(previousId)?.label}
              </button>
            )}
          </div>

          {networkView ? (
            <div
              ref={graphWrapRef}
              className="opportunity-network-canvas"
              role="application"
              aria-label="Vista completa della rete di opportunità"
            >
              <ForceGraph2D
                graphRef={graphRef}
                width={networkSize.width}
                height={networkSize.height}
                graphData={graphData}
                backgroundColor="#fbfcfa"
                nodeCanvasObjectMode={() => 'replace'}
                nodeCanvasObject={renderNetworkNode}
                nodePointerAreaPaint={paintNetworkNode}
                nodeLabel={(node) =>
                  `${TYPE_LABEL[node.type]} · ${node.label}\n${node.curiosityHook}`
                }
                onNodeClick={(node) => selectNode(String(node.id), true)}
                linkColor={(link) => {
                  const source = endpointId(link.source);
                  const target = endpointId(link.target);
                  return source === selectedId || target === selectedId
                    ? '#0e5c52'
                    : 'rgba(150, 163, 155, 0.15)';
                }}
                linkWidth={(link) => {
                  const source = endpointId(link.source);
                  const target = endpointId(link.target);
                  return source === selectedId || target === selectedId
                    ? 1.8
                    : 0.6;
                }}
                minZoom={0.6}
                maxZoom={2.8}
                d3AlphaDecay={0.07}
                d3VelocityDecay={0.5}
                cooldownTicks={90}
                enableNodeDrag
              />
            </div>
          ) : (
            <div className="opportunity-orbit" key={selectedId}>
              <svg
                className="opportunity-orbit-paths"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {visibleDoors.map((door, index) => {
                  const position = ORBIT_POSITIONS[index]!;
                  const controlX = (50 + position.x) / 2;
                  const controlY = position.y < 50 ? 42 : 62;
                  return (
                    <path
                      key={door.id}
                      d={`M 50 51 Q ${controlX} ${controlY} ${position.x} ${position.y}`}
                      pathLength="1"
                    />
                  );
                })}
              </svg>

              <div className="opportunity-focus-wrap">
                <div
                  className="opportunity-focus-halo"
                  style={
                    {
                      '--opportunity-radius': `${selectedNode.opportunityRadius}%`,
                    } as CSSProperties
                  }
                  aria-hidden="true"
                />
                <article className="opportunity-focus-card">
                  <span>{TYPE_LABEL[selectedNode.type]}</span>
                  <h3>{selectedNode.label}</h3>
                  <p>{selectedNode.subtitle}</p>
                  <strong>Apre {allDoors.length} porte</strong>
                </article>
              </div>

              {visibleDoors.map((door, index) => {
                const position = ORBIT_POSITIONS[index]!;
                return (
                  <button
                    key={door.id}
                    type="button"
                    className={`opportunity-door-card is-${door.type}`}
                    style={
                      {
                        '--door-x': `${position.x}%`,
                        '--door-y': `${position.y}%`,
                        '--door-delay': `${index * 55}ms`,
                      } as CSSProperties
                    }
                    onClick={() => selectNode(door.id)}
                  >
                    <span className="opportunity-door-type">
                      {TYPE_LABEL[door.type]}
                    </span>
                    <strong>{door.label}</strong>
                    <span className="opportunity-door-metric">
                      {doorMetric(door)}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="opportunity-door-arrow"
                    />
                  </button>
                );
              })}

              {extraDoors.length > 0 && (
                <button
                  type="button"
                  className="opportunity-more-button"
                  aria-expanded={showMore}
                  onClick={() => setShowMore((current) => !current)}
                >
                  <ListPlus aria-hidden="true" className="h-4 w-4" />+
                  {extraDoors.length} altre possibilità
                </button>
              )}
            </div>
          )}
        </section>

        <aside className="opportunity-lens-detail" aria-live="polite">
          <div className="opportunity-detail-heading">
            <span className={`opportunity-type is-${selectedNode.type}`}>
              {TYPE_LABEL[selectedNode.type]}
            </span>
            <Sparkles aria-hidden="true" className="h-4 w-4" />
          </div>
          <h2>{selectedNode.label}</h2>
          <p>{selectedNode.description}</p>

          <dl className="opportunity-key-insights">
            <div>
              <dt>Porte collegate</dt>
              <dd>{allDoors.length}</dd>
            </div>
            <div>
              <dt>Raggio</dt>
              <dd>{selectedNode.opportunityRadius >= 80 ? 'Alto' : 'Medio'}</dd>
            </div>
            <div>
              <dt>Connette</dt>
              <dd>{connectionSummary(allDoors)}</dd>
            </div>
          </dl>

          {showMore && extraDoors.length > 0 && (
            <section
              className="opportunity-more-list"
              aria-labelledby="more-opportunities-heading"
            >
              <h3 id="more-opportunities-heading">Altre possibilità</h3>
              {extraDoors.map((door) => (
                <button
                  key={door.id}
                  type="button"
                  onClick={() => selectNode(door.id)}
                >
                  <span>
                    <strong>{door.label}</strong>
                    <small>{TYPE_LABEL[door.type]}</small>
                  </span>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              ))}
            </section>
          )}

          <div className="opportunity-lens-actions">
            {primaryDoor && (
              <button
                type="button"
                className="button-primary"
                onClick={() => selectNode(primaryDoor.id)}
              >
                <Compass aria-hidden="true" className="h-4 w-4" />
                Esplora {primaryDoor.label}
              </button>
            )}
            {selectedNode.careerSlug ? (
              <form
                action={addCareerToComparison.bind(
                  null,
                  selectedNode.careerSlug,
                )}
              >
                <button
                  type="submit"
                  disabled={compared || comparedSlugs.length >= 3}
                  className="opportunity-panel-action"
                >
                  {compared ? (
                    <Check aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Columns3 aria-hidden="true" className="h-4 w-4" />
                  )}
                  {compared ? 'Nel confronto' : 'Aggiungi al confronto'}
                </button>
              </form>
            ) : (
              <Link
                href="/student/reflection"
                className="opportunity-panel-action"
              >
                <ListPlus aria-hidden="true" className="h-4 w-4" />
                Aggiungi una nota
              </Link>
            )}
            {previousId && (
              <button
                type="button"
                className="opportunity-panel-back"
                onClick={() => selectNode(previousId, true)}
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Torna a {NODE_BY_ID.get(previousId)?.label}
              </button>
            )}
          </div>
        </aside>
      </div>

      <nav className="opportunity-journey" aria-label="Percorso esplorato">
        <span>Il tuo percorso</span>
        <ol>
          {trail.map((id, index) => {
            const node = NODE_BY_ID.get(id);
            if (!node) return null;
            return (
              <li key={id}>
                {index > 0 && <ArrowRight aria-hidden="true" />}
                <button
                  type="button"
                  aria-current={id === selectedId ? 'location' : undefined}
                  onClick={() => selectNode(id, true)}
                >
                  {node.label}
                </button>
              </li>
            );
          })}
        </ol>
        {comparedSlugs.length > 0 && (
          <Link href="/student/compare">
            {comparedSlugs.length} nel confronto
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </main>
  );
}
