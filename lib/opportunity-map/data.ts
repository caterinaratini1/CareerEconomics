export type OpportunityNodeType =
  'root' | 'subject' | 'career' | 'skill' | 'industry' | 'study_path';

export interface OpportunityMetric {
  label: string;
  value: string;
}

export interface OpportunityNode {
  id: string;
  type: OpportunityNodeType;
  label: string;
  subtitle: string;
  description: string;
  curiosityHook: string;
  opportunityRadius: number;
  careerSlug?: string;
  metrics?: OpportunityMetric[];
}

export interface OpportunityEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  strength: number;
}

export const OPPORTUNITY_NODES: OpportunityNode[] = [
  {
    id: 'future',
    type: 'root',
    label: 'Il tuo futuro',
    subtitle: 'Scegli una direzione',
    description:
      'Non è un percorso già deciso: è il punto da cui iniziare a vedere quante strade possono incontrarsi.',
    curiosityHook: 'Ogni scelta apre nuove porte, senza chiudere le altre.',
    opportunityRadius: 92,
  },
  {
    id: 'business',
    type: 'subject',
    label: 'Economia Aziendale',
    subtitle: 'Strategia, numeri e persone',
    description:
      'Collega l’organizzazione delle imprese all’analisi, alla comunicazione e alle decisioni economiche.',
    curiosityHook:
      'Può portare tanto ai dati quanto alla creatività commerciale.',
    opportunityRadius: 84,
  },
  {
    id: 'science',
    type: 'subject',
    label: 'Scienze e Ingegneria',
    subtitle: 'Capire e progettare sistemi',
    description:
      'Un’area ampia che unisce metodo scientifico, progettazione e soluzione di problemi complessi.',
    curiosityHook:
      'Le stesse basi servono nella salute, nell’energia e nel software.',
    opportunityRadius: 89,
  },
  {
    id: 'health',
    type: 'subject',
    label: 'Salute',
    subtitle: 'Cura, ricerca e prevenzione',
    description:
      'Comprende professioni cliniche, ricerca, organizzazione sanitaria e tecnologie per la cura.',
    curiosityHook:
      'Non tutte le professioni sanitarie lavorano direttamente con i pazienti.',
    opportunityRadius: 78,
  },
  {
    id: 'technology',
    type: 'subject',
    label: 'Tecnologia e Design',
    subtitle: 'Costruire esperienze utili',
    description:
      'Mette insieme logica, creatività e comprensione delle persone per creare prodotti e servizi.',
    curiosityHook: 'Il design è anche ricerca, strategia e misurazione.',
    opportunityRadius: 90,
  },
  {
    id: 'law',
    type: 'subject',
    label: 'Diritto e Istituzioni',
    subtitle: 'Regole, diritti e società',
    description:
      'Apre percorsi nella giustizia, nella pubblica amministrazione e nelle relazioni internazionali.',
    curiosityHook:
      'Le competenze giuridiche sono centrali anche nelle aziende tecnologiche.',
    opportunityRadius: 74,
  },
  {
    id: 'communication',
    type: 'subject',
    label: 'Comunicazione',
    subtitle: 'Idee, linguaggi e relazioni',
    description:
      'Trasforma analisi e creatività in messaggi, prodotti editoriali e relazioni con pubblici diversi.',
    curiosityHook:
      'Saper spiegare bene i dati è una competenza sempre più trasversale.',
    opportunityRadius: 80,
  },
  {
    id: 'data-analyst',
    type: 'career',
    label: 'Data Analyst',
    subtitle: 'Dai dati alle decisioni',
    description:
      'Raccoglie, pulisce e interpreta dati per aiutare organizzazioni e team a prendere decisioni più solide.',
    curiosityHook:
      'È un ponte tra domande di business, matematica e tecnologia.',
    opportunityRadius: 88,
    metrics: [
      { label: 'Ingresso indicativo', value: '3–5 anni' },
      { label: 'Domanda', value: 'Medio-alta' },
      { label: 'Mobilità', value: 'Molti settori' },
    ],
  },
  {
    id: 'consulting',
    type: 'career',
    label: 'Consulenza',
    subtitle: 'Problemi diversi, metodo comune',
    description:
      'Aiuta organizzazioni diverse ad analizzare problemi, scegliere priorità e realizzare cambiamenti.',
    curiosityHook: 'È un percorso che espone rapidamente a molti settori.',
    opportunityRadius: 76,
    metrics: [
      { label: 'Ingresso indicativo', value: '3–5 anni' },
      { label: 'Varietà', value: 'Alta' },
    ],
  },
  {
    id: 'marketing',
    type: 'career',
    label: 'Marketing',
    subtitle: 'Mercati, persone e crescita',
    description:
      'Studia bisogni e comportamenti per progettare offerte, messaggi e strategie di crescita.',
    curiosityHook: 'Oggi mescola creatività, psicologia e analisi dei dati.',
    opportunityRadius: 81,
    metrics: [
      { label: 'Competenze', value: 'Creative + analitiche' },
      { label: 'Settori', value: 'Trasversali' },
    ],
  },
  {
    id: 'software-engineer',
    type: 'career',
    label: 'Sviluppatore software',
    subtitle: 'Progetta sistemi digitali',
    description:
      'Progetta, costruisce e mantiene software traducendo problemi reali in sistemi affidabili.',
    curiosityHook:
      'Si può lavorare in quasi ogni settore, non solo nelle aziende tech.',
    opportunityRadius: 91,
    careerSlug: 'software-engineer',
    metrics: [
      { label: 'Ingresso indicativo', value: '2–5 anni' },
      { label: 'Domanda', value: 'Alta' },
      { label: 'Mobilità', value: 'Internazionale' },
    ],
  },
  {
    id: 'doctor',
    type: 'career',
    label: 'Medico',
    subtitle: 'Diagnosi, cura e ricerca',
    description:
      'Previene, riconosce e tratta problemi di salute, con percorsi di specializzazione molto diversi.',
    curiosityHook:
      'La medicina unisce relazione umana e apprendimento scientifico continuo.',
    opportunityRadius: 72,
    careerSlug: 'doctor',
    metrics: [
      { label: 'Ingresso indicativo', value: '6+ anni' },
      { label: 'Formazione', value: 'Regolamentata' },
      { label: 'Specializzazioni', value: 'Molte' },
    ],
  },
  {
    id: 'diplomat',
    type: 'career',
    label: 'Diplomatico',
    subtitle: 'Relazioni tra paesi',
    description:
      'Rappresenta il proprio paese e lavora su negoziazione, cooperazione e analisi internazionale.',
    curiosityHook:
      'Richiede insieme diritto, lingue, economia e comprensione culturale.',
    opportunityRadius: 66,
    careerSlug: 'diplomat',
    metrics: [
      { label: 'Accesso', value: 'Selettivo' },
      { label: 'Mobilità', value: 'Internazionale' },
      { label: 'Lingue', value: 'Centrali' },
    ],
  },
  {
    id: 'ux-designer',
    type: 'career',
    label: 'UX Designer',
    subtitle: 'Prodotti a misura di persona',
    description:
      'Studia bisogni e comportamenti per progettare servizi digitali comprensibili e accessibili.',
    curiosityHook:
      'Usa ricerca qualitativa, prototipi e dati nello stesso progetto.',
    opportunityRadius: 83,
    metrics: [
      { label: 'Portfolio', value: 'Importante' },
      { label: 'Settori', value: 'Trasversali' },
    ],
  },
  {
    id: 'statistics',
    type: 'skill',
    label: 'Statistica',
    subtitle: 'Leggere l’incertezza',
    description:
      'Aiuta a distinguere segnali, variazioni e limiti nei dati prima di arrivare a una conclusione.',
    curiosityHook: 'È utile dalla ricerca medica al marketing.',
    opportunityRadius: 86,
  },
  {
    id: 'python',
    type: 'skill',
    label: 'Python',
    subtitle: 'Automazione e analisi',
    description:
      'Un linguaggio usato per dati, automazione, intelligenza artificiale e sviluppo di servizi.',
    curiosityHook:
      'La stessa skill compare in percorsi scientifici e aziendali.',
    opportunityRadius: 90,
  },
  {
    id: 'negotiation',
    type: 'skill',
    label: 'Negoziazione',
    subtitle: 'Costruire accordi',
    description:
      'Permette di capire interessi diversi, gestire conflitti e costruire soluzioni sostenibili.',
    curiosityHook:
      'Conta nella diplomazia, nelle imprese e nella vita quotidiana.',
    opportunityRadius: 75,
  },
  {
    id: 'research',
    type: 'skill',
    label: 'Ricerca con le persone',
    subtitle: 'Osservare prima di progettare',
    description:
      'Interviste, test e osservazione aiutano a capire bisogni reali prima di scegliere una soluzione.',
    curiosityHook:
      'È una competenza condivisa da design, salute e comunicazione.',
    opportunityRadius: 77,
  },
  {
    id: 'fintech',
    type: 'industry',
    label: 'Fintech',
    subtitle: 'Finanza + tecnologia',
    description:
      'Un settore che crea servizi finanziari digitali combinando software, dati, regole e design.',
    curiosityHook: 'Ha bisogno sia di profili tecnici sia economico-giuridici.',
    opportunityRadius: 82,
  },
  {
    id: 'public-sector',
    type: 'industry',
    label: 'Pubblica amministrazione',
    subtitle: 'Servizi per la collettività',
    description:
      'Progetta e gestisce servizi, regole e programmi che hanno un impatto diretto sulla società.',
    curiosityHook:
      'Anche il settore pubblico cerca dati, design e competenze digitali.',
    opportunityRadius: 68,
  },
  {
    id: 'computer-science',
    type: 'study_path',
    label: 'Ingegneria Informatica',
    subtitle: 'Percorso di studio',
    description:
      'Approfondisce software, architetture, matematica e progettazione di sistemi complessi.',
    curiosityHook: 'Può aprire ruoli tecnici, di prodotto e di ricerca.',
    opportunityRadius: 85,
  },
];

export const OPPORTUNITY_EDGES: OpportunityEdge[] = [
  ['future-business', 'future', 'business', 'puoi partire da', 5],
  ['future-science', 'future', 'science', 'puoi partire da', 5],
  ['future-health', 'future', 'health', 'puoi partire da', 5],
  ['future-technology', 'future', 'technology', 'puoi partire da', 5],
  ['future-law', 'future', 'law', 'puoi partire da', 5],
  ['future-communication', 'future', 'communication', 'puoi partire da', 5],
  ['business-data', 'business', 'data-analyst', 'porta a', 5],
  ['business-consulting', 'business', 'consulting', 'porta a', 4],
  ['business-marketing', 'business', 'marketing', 'porta a', 5],
  ['business-fintech', 'business', 'fintech', 'apre il settore', 4],
  ['science-data', 'science', 'data-analyst', 'porta a', 4],
  ['science-doctor', 'science', 'doctor', 'porta a', 5],
  ['science-statistics', 'science', 'statistics', 'sviluppa', 5],
  ['science-computer', 'science', 'computer-science', 'porta a', 4],
  ['health-doctor', 'health', 'doctor', 'porta a', 5],
  ['health-research', 'health', 'research', 'richiede', 4],
  ['health-statistics', 'health', 'statistics', 'usa', 3],
  ['technology-software', 'technology', 'software-engineer', 'porta a', 5],
  ['technology-ux', 'technology', 'ux-designer', 'porta a', 5],
  ['technology-python', 'technology', 'python', 'sviluppa', 5],
  ['technology-computer', 'technology', 'computer-science', 'porta a', 4],
  ['law-diplomat', 'law', 'diplomat', 'porta a', 5],
  ['law-negotiation', 'law', 'negotiation', 'sviluppa', 4],
  ['law-public', 'law', 'public-sector', 'apre il settore', 5],
  ['communication-marketing', 'communication', 'marketing', 'porta a', 5],
  ['communication-ux', 'communication', 'ux-designer', 'porta a', 4],
  ['communication-research', 'communication', 'research', 'sviluppa', 4],
  ['data-statistics', 'data-analyst', 'statistics', 'richiede', 5],
  ['data-python', 'data-analyst', 'python', 'richiede', 5],
  ['data-fintech', 'data-analyst', 'fintech', 'apre il settore', 4],
  [
    'data-computer',
    'data-analyst',
    'computer-science',
    'percorso possibile',
    3,
  ],
  ['software-python', 'software-engineer', 'python', 'usa', 4],
  ['software-fintech', 'software-engineer', 'fintech', 'lavora in', 3],
  ['ux-research', 'ux-designer', 'research', 'richiede', 5],
  ['diplomat-negotiation', 'diplomat', 'negotiation', 'richiede', 5],
  ['diplomat-public', 'diplomat', 'public-sector', 'lavora nel', 4],
  ['consulting-negotiation', 'consulting', 'negotiation', 'richiede', 4],
  ['marketing-research', 'marketing', 'research', 'usa', 4],
  ['marketing-statistics', 'marketing', 'statistics', 'usa', 3],
].map(([id, source, target, label, strength]) => ({
  id: id as string,
  source: source as string,
  target: target as string,
  label: label as string,
  strength: strength as number,
}));

export const NODE_BY_ID = new Map(
  OPPORTUNITY_NODES.map((node) => [node.id, node]),
);

export function connectedNodeIds(nodeId: string): string[] {
  return OPPORTUNITY_EDGES.flatMap((edge) => {
    if (edge.source === nodeId) return [edge.target];
    if (edge.target === nodeId) return [edge.source];
    return [];
  });
}
