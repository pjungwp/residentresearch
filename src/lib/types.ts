export type Framework = 'PICOT' | 'PEO' | 'SPIDER';
export type Access = 'pmc' | 'publisher' | 'repository' | 'preprint' | 'subscription' | 'unknown';
export type VStatus = 'verified' | 'partial' | 'unverified' | 'notfound' | 'retracted';

/** Blueprint field state, from the Master Prompt. */
export type FieldStatus = 'confirmed' | 'proposed' | 'unknown' | 'verify';
export type Origin = 'resident' | 'ai' | 'mentor';

export interface FieldValue {
  value: string;
  status: FieldStatus;
  origin: Origin;
  updatedAt: string;
  history: { value: string; status: FieldStatus; origin: Origin; at: string }[];
  /** source ids supporting this field */
  refs?: string[];
  /** downstream flag, e.g. set when the research question changes */
  flag?: { reason: string; at: string };
}

export interface SourceRecord {
  id: string;
  input: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  title?: string;
  authors: string[];
  journal?: string;
  journalAbbrev?: string;
  year?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  pubTypes: string[];
  abstract?: string;
  access: Access;
  oaStatus?: string;
  fullTextUrl?: string;
  pdfUrl?: string;
  landingUrl?: string;
  /** id of a PDF the resident attached (stored locally in IndexedDB) */
  fileId?: string;
  fileName?: string;
  include: boolean;
  addedBy: Origin;
  addedAt: string;
  verification: {
    status: VStatus;
    checkedAt?: string;
    method: string[];
    mismatches: string[];
    notes: string[];
    recheckedAt?: string;
  };
  annotation: {
    level: string;
    design: string;
    sample: string;
    findings: string;
    strengths: string;
    limitations: string;
    relevance: string;
    /** human verification: the resident opened and read the source */
    readFullText: boolean;
    aiDrafted?: boolean;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: { url: string; title: string }[];
  searches?: string[];
  at: string;
  week?: number;
  error?: string;
  /** proposal id → what the resident did with it */
  handled?: Record<string, 'accepted' | 'edited' | 'dismissed'>;
}

export type WeekStatus = 'not_started' | 'in_progress' | 'ready' | 'revision' | 'completed';
export type Readiness = 'pending' | 'revise' | 'ready';

export interface Comment {
  id: string;
  /** section id, `field:<key>`, `week:<n>` or `proposal:<sectionId>` */
  target: string;
  author: string;
  role: 'resident' | 'mentor';
  text: string;
  at: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface Signoff {
  status: Readiness;
  by: string;
  at: string;
  note: string;
}

export interface ProposalSection {
  /** resident-edited narrative; undefined = generated from the Blueprint */
  text?: string;
  /** hash of the Blueprint source text when the resident last edited / reconciled */
  basis?: string;
  editedAt?: string;
}

export interface Project {
  id: string;
  title: string;
  resident: string;
  pgy: string;
  mentorName: string;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
  archived: boolean;
  startMode: 'explore' | 'refine' | 'critique';
  currentWeek: number;
  weekStatus: Record<number, WeekStatus>;
  fields: Record<string, FieldValue>;
  lists: {
    concepts: { name: string; terms: string }[];
    searchLog: { date: string; db: string; string: string; filters: string; hits: string; kept: string }[];
    team: { name: string; role: string; contact: string }[];
    budget: { item: string; qty: string; unit: string; source: string }[];
    milestones: { name: string; date: string }[];
    risks: { risk: string; fallback: string }[];
    dissemination: { output: string; target: string; deadline: string }[];
  };
  sources: SourceRecord[];
  checks: Record<string, boolean>;
  readiness: Record<string, Readiness>;
  signoffs: Record<'w2' | 'w4' | 'w5', Signoff | undefined>;
  comments: Comment[];
  proposal: Record<string, ProposalSection>;
  chat: ChatMessage[];
  capstone: boolean;
  exports: { kind: string; at: string }[];
}
