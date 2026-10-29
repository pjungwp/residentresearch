import { FIELDS, SECTIONS, WEEKS, fieldByKey } from '@/content/fields';
import type { ChatMessage, Project, SourceRecord } from './types';
import { fv, fstatus, getSettings } from './store';
import { activeFramework, sectionFields } from './progress';
import { amaCitation, ACCESS_LABEL, STATUS_LABEL } from './verify';

/* ───────── project context sent with each request ───────── */

const STATUS_WORD = { confirmed: 'CONFIRMED', proposed: 'PROPOSED', unknown: 'UNKNOWN', verify: 'NEEDS VERIFICATION' } as const;

export function buildContext(p: Project, week: number): string {
  const lines: string[] = [];
  lines.push(`Project: ${p.title}`);
  lines.push(`Workflow: free Concierge (7 stages, user may jump). Current stage: ${week} — ${WEEKS[week - 1].title}`);
  lines.push(`Framework in use: ${activeFramework(p)}`);
  lines.push('');
  lines.push('## Blueprint (current-week sections in full; others summarized)');
  for (const s of SECTIONS) {
    const current = s.week === week || week === 7;
    const fs = sectionFields(p, s.id);
    const rows = fs
      .map((f) => {
        const v = fv(p, f.key).trim();
        const st = fstatus(p, f.key);
        if (!current && !v) return null;
        const flag = p.fields[f.key]?.flag ? ' [FLAGGED: question changed]' : '';
        return `- ${f.label} [${f.key}] (${STATUS_WORD[st]})${flag}: ${current ? v || '—' : v.slice(0, 280)}`;
      })
      .filter(Boolean) as string[];
    if (!rows.length) continue;
    lines.push(`### ${s.title} (week ${s.week})`, ...rows);
  }
  const story = FIELDS.filter((f) => f.key.startsWith('story.') && fv(p, f.key).trim()).map((f) => `${f.label} ${fv(p, f.key).trim()}`);
  if (story.length && week <= 2) lines.push('', '## Once Upon a Time story', ...story);
  if (fv(p, 'backups').trim()) lines.push('', `Backup questions: ${fv(p, 'backups')}`);

  const inc = p.sources.filter((s) => s.include);
  if (inc.length) {
    lines.push('', `## Bibliography (${inc.length} included)`);
    inc.forEach((s, i) => lines.push(`${i + 1}. ${sourceLine(s)}`));
  }
  if (p.lists.searchLog.length) {
    lines.push('', '## Search log');
    p.lists.searchLog.slice(-8).forEach((r) => lines.push(`- ${r.db}: ${r.string} → ${r.hits} hits, ${r.kept} kept`));
  }
  if (p.lists.milestones.some((m) => m.date)) lines.push('', '## Timeline', ...p.lists.milestones.filter((m) => m.date).map((m) => `- ${m.name}: ${m.date}`));
  if (p.lists.risks.length) lines.push('', '## Risks', ...p.lists.risks.map((r) => `- ${r.risk} → ${r.fallback}`));
  if (p.lists.dissemination.length) lines.push('', '## Dissemination', ...p.lists.dissemination.map((d) => `- ${d.output}: ${d.target} (${d.deadline || 'no date'})`));
  if (p.lists.budget.length) lines.push('', '## Budget', ...p.lists.budget.map((b) => `- ${b.item}: ${b.qty} × ${b.unit} (${b.source})`));
  const open = p.comments.filter((n) => !n.resolved && n.role === 'mentor');
  if (open.length) lines.push('', '## Open mentor comments', ...open.slice(-10).map((n) => `- [${n.target}] ${n.author}: ${n.text}`));

  lines.push('', '## Field keys you may propose', FIELDS.filter((f) => (!f.key.startsWith('story.') || week === 1) && (!f.framework || f.framework === activeFramework(p)))
    .map((f) => `${f.key}${f.options ? ` (one of: ${f.options.join(' | ')})` : ''}`)
    .join('; '));
  return lines.join('\n');
}

function sourceLine(s: SourceRecord) {
  const a = s.annotation;
  return `${amaCitation(s)} — Verification: ${STATUS_LABEL[s.verification.status]}; Access: ${ACCESS_LABEL[s.access]}${a.findings ? `; Findings: ${a.findings.slice(0, 300)}` : ''}${a.limitations ? `; Limitations: ${a.limitations.slice(0, 200)}` : ''}`;
}

/* ───────── proposals ───────── */

export interface Proposal {
  id: string;
  field: string;
  value: string;
  note?: string;
  valid: boolean;
  problem?: string;
}

const PROPOSAL_RE = /```proposal\s*\n([\s\S]*?)```/g;

export function parseProposals(text: string): Proposal[] {
  const out: Proposal[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  PROPOSAL_RE.lastIndex = 0;
  while ((m = PROPOSAL_RE.exec(text))) {
    const id = `pr${i++}`;
    try {
      const raw = JSON.parse(m[1].trim());
      const items = Array.isArray(raw) ? raw : [raw];
      for (const r of items) {
        const field = String(r.field ?? '');
        const value = String(r.value ?? '');
        const def = fieldByKey[field];
        let problem: string | undefined;
        if (!def) problem = `Unknown field “${field}”`;
        else if (def.options && !def.options.includes(value)) problem = `“${value}” is not an option for ${def.label}`;
        else if (!value.trim()) problem = 'Empty value';
        out.push({ id: items.length > 1 ? `${id}.${out.length}` : id, field, value, note: r.note ? String(r.note) : undefined, valid: !problem, problem });
      }
    } catch {
      out.push({ id, field: '', value: m[1].trim(), valid: false, problem: 'Could not read this suggestion' });
    }
  }
  return out;
}

/** Splits assistant text into markdown chunks and proposal placeholders, in order. */
export function splitWithProposals(text: string): ({ kind: 'md'; text: string } | { kind: 'proposal'; index: number })[] {
  const parts: ({ kind: 'md'; text: string } | { kind: 'proposal'; index: number })[] = [];
  let last = 0;
  let idx = 0;
  PROPOSAL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PROPOSAL_RE.exec(text))) {
    if (m.index > last) parts.push({ kind: 'md', text: text.slice(last, m.index) });
    parts.push({ kind: 'proposal', index: idx++ });
    last = m.index + m[0].length;
  }
  const tail = text.slice(last);
  // hide a half-streamed proposal fence
  const open = tail.indexOf('```proposal');
  parts.push({ kind: 'md', text: open >= 0 ? tail.slice(0, open) : tail });
  return parts.filter((p) => p.kind === 'proposal' || p.text.trim());
}

/** DOIs / PMIDs mentioned in assistant text, for "Add & verify". */
export function extractIdentifiers(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/\b(10\.\d{4,9}\/[^\s"<>)\]]+)/g)) found.add(`doi:${m[1].replace(/[.,;:]+$/, '').toLowerCase()}`);
  for (const m of text.matchAll(/\bPMID[:\s]*?(\d{5,9})\b/gi)) found.add(`pmid:${m[1]}`);
  for (const m of text.matchAll(/\b(PMC\d{4,9})\b/g)) found.add(`pmcid:${m[1]}`);
  return [...found];
}

/* ───────── PHI guard ───────── */

export function phiWarnings(text: string): string[] {
  const w: string[] = [];
  if (/\b(MRN|medical record (number|#))\b/i.test(text) || /\b\d{7,10}\b/.test(text.replace(/\b(10\.\d{4,9}\/\S+|PMID[:\s]*\d+|PMC\d+)\b/gi, ''))) w.push('a record number');
  if (/\b(DOB|date of birth)\b/i.test(text) || /\b(0?[1-9]|1[0-2])[/-](0?[1-9]|[12]\d|3[01])[/-](19|20)\d{2}\b/.test(text)) w.push('a date of birth or full date');
  if (/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(text)) w.push('a phone number');
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(text)) w.push('an SSN-like number');
  if (/\b(Mrs?|Ms)\.\s+[A-Z][a-z]+/.test(text)) w.push('a patient name');
  return w;
}

/* ───────── streaming client ───────── */

export interface StreamHandlers {
  onText: (delta: string) => void;
  onCitation?: (c: { url: string; title: string }) => void;
  onSearch?: (query: string) => void;
}

export class AIError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}

export async function askConcierge(
  opts: { mode: 'chat' | 'annotate'; messages: { role: 'user' | 'assistant'; content: string }[]; context?: string; signal?: AbortSignal },
  h: StreamHandlers
): Promise<{ stopReason?: string }> {
  const { accessCode } = getSettings();
  let res: Response;
  try {
    res = await fetch('/api/concierge', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-access-code': accessCode },
      body: JSON.stringify({ mode: opts.mode, messages: opts.messages, context: opts.context }),
      signal: opts.signal
    });
  } catch (e) {
    if ((e as Error).name === 'AbortError') throw e;
    throw new AIError('offline', 'Could not reach the concierge. Check your connection and try again.');
  }
  if (!res.ok || !res.body) {
    let msg = `The concierge returned an error (${res.status}).`;
    let code = 'http';
    try {
      const j = await res.json();
      msg = j.message ?? msg;
      code = j.error ?? code;
    } catch {
      if (res.status === 404) {
        code = 'not_deployed';
        msg = 'The AI service is not available here. It runs on the deployed Netlify site (or `netlify dev`).';
      }
    }
    if (res.status === 429) msg = 'Too many requests right now. Wait a minute and try again.';
    throw new AIError(code, msg);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let stopReason: string | undefined;
  const blockTypes: Record<number, string> = {};
  let toolJson = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n\n')) >= 0) {
      const raw = buf.slice(0, nl);
      buf = buf.slice(nl + 2);
      const dataLine = raw.split('\n').find((l) => l.startsWith('data:'));
      if (!dataLine) continue;
      let ev: any;
      try {
        ev = JSON.parse(dataLine.slice(5).trim());
      } catch {
        continue;
      }
      switch (ev.type) {
        case 'content_block_start':
          blockTypes[ev.index] = ev.content_block?.type;
          if (ev.content_block?.type === 'server_tool_use') toolJson = '';
          if (ev.content_block?.type === 'text' && ev.content_block.text) h.onText(ev.content_block.text);
          break;
        case 'content_block_delta':
          if (ev.delta?.type === 'text_delta') h.onText(ev.delta.text);
          else if (ev.delta?.type === 'citations_delta' && ev.delta.citation?.url) h.onCitation?.({ url: ev.delta.citation.url, title: ev.delta.citation.title ?? ev.delta.citation.url });
          else if (ev.delta?.type === 'input_json_delta' && blockTypes[ev.index] === 'server_tool_use') toolJson += ev.delta.partial_json ?? '';
          break;
        case 'content_block_stop':
          if (blockTypes[ev.index] === 'server_tool_use') {
            try {
              h.onSearch?.(JSON.parse(toolJson).query ?? '');
            } catch {
              /* ignore */
            }
          }
          break;
        case 'message_delta':
          stopReason = ev.delta?.stop_reason ?? stopReason;
          break;
        case 'error':
          throw new AIError(ev.error?.type ?? 'stream', ev.error?.message ?? 'The response was interrupted.');
      }
    }
  }
  return { stopReason };
}

/** Recent plain-text history for the API (text only; citations dropped; last 14 turns). */
export function historyForApi(chat: ChatMessage[]) {
  return chat
    .filter((m) => !m.error && m.text.trim())
    .slice(-14)
    .map((m) => ({ role: m.role, content: m.text }));
}

export async function checkService(): Promise<{ ok: boolean; configured?: boolean; needsCode?: boolean; model?: string; message?: string }> {
  try {
    const r = await fetch('/api/concierge', { method: 'GET' });
    if (!r.ok) return { ok: false, message: r.status === 404 ? 'AI service not deployed at this address.' : `HTTP ${r.status}` };
    const j = await r.json();
    return { ok: true, ...j };
  } catch {
    return { ok: false, message: 'Could not reach the AI service.' };
  }
}
