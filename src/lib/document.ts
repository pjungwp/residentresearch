/**
 * Deterministic proposal assembly. The protocol is built from Blueprint fields with fixed
 * templates (no AI layout). Resident edits are stored as overrides with a hash of the Blueprint
 * text they were based on, so later Blueprint changes trigger reconciliation instead of silent overwrite.
 */
import { fieldByKey } from '@/content/fields';
import type { FieldStatus, Project } from './types';
import { fstatus, fv } from './store';
import { activeFramework } from './progress';
import { amaCitation, STATUS_LABEL, ACCESS_LABEL } from './verify';

export const DRAFT_LABEL = 'Draft — Pending Faculty and Institutional Review';

export interface Issue {
  key: string;
  label: string;
  status: FieldStatus | 'flag';
}

export interface DocSection {
  id: string;
  title: string;
  generated: string;
  text: string;
  edited: boolean;
  /** Blueprint changed after the resident edited this section */
  stale: boolean;
  issues: Issue[];
  keys: string[];
}

export function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

const v = (p: Project, k: string) => fv(p, k).trim();

function refMarks(p: Project, keys: string[]): string {
  const inc = p.sources.filter((s) => s.include);
  const nums = new Set<number>();
  for (const k of keys) for (const r of p.fields[k]?.refs ?? []) {
    const i = inc.findIndex((s) => s.id === r);
    if (i >= 0) nums.add(i + 1);
  }
  return nums.size ? ` [${[...nums].sort((a, b) => a - b).join(', ')}]` : '';
}

const para = (p: Project, label: string, key: string) => (v(p, key) ? `${label ? `${label}: ` : ''}${v(p, key)}${refMarks(p, [key])}` : '');
const join = (...parts: string[]) => parts.filter(Boolean).join('\n\n');

interface Template {
  id: string;
  title: string;
  keys: string[];
  build: (p: Project) => string;
}

const TEMPLATES: Template[] = [
  {
    id: 'title',
    title: 'Title and investigators',
    keys: ['mentor.name'],
    build: (p) => join(`Project title: ${p.title}`, p.resident ? `Resident investigator: ${p.resident}${p.pgy ? ` (${p.pgy})` : ''}` : '', v(p, 'mentor.name') ? `Faculty mentor: ${v(p, 'mentor.name')}` : '', p.lists.team.filter((t) => t.name).length ? `Team: ${p.lists.team.filter((t) => t.name).map((t) => `${t.name} (${t.role})`).join('; ')}` : '')
  },
  {
    id: 'background',
    title: 'Background and significance',
    keys: ['problem', 'significance', 'gap', 'purpose'],
    build: (p) => join(para(p, '', 'problem'), para(p, '', 'significance'), para(p, '', 'gap'), para(p, 'Purpose', 'purpose'))
  },
  {
    id: 'objectives',
    title: 'Research question and objectives',
    keys: ['revisedQuestion', 'question', 'hypothesis'],
    build: (p) => {
      const q = v(p, 'revisedQuestion') || v(p, 'question');
      const fw = activeFramework(p);
      const parts =
        fw === 'PICOT'
          ? [['Population', 'fw.P'], ['Intervention/exposure', 'fw.I'], ['Comparison', 'fw.C'], ['Outcome', 'fw.O'], ['Time', 'fw.T']]
          : fw === 'PEO'
            ? [['Population', 'peo.P'], ['Exposure', 'peo.E'], ['Outcomes', 'peo.O']]
            : [['Sample', 'sp.S'], ['Phenomenon of interest', 'sp.PI'], ['Design', 'sp.D'], ['Evaluation', 'sp.E'], ['Research type', 'sp.R']];
      const fwText = parts.filter(([, k]) => v(p, k)).map(([l, k]) => `${l}: ${v(p, k)}`).join('; ');
      return join(q ? `Research question: ${q}` : '', fwText ? `${fw}: ${fwText}` : '', para(p, 'Hypothesis', 'hypothesis'));
    }
  },
  {
    id: 'literature',
    title: 'Literature review',
    keys: ['gap'],
    build: (p) => {
      const inc = p.sources.filter((s) => s.include);
      const lines = inc.map((s, i) => {
        const a = s.annotation;
        return `[${i + 1}] ${s.authors[0]?.split(' ')[0] ?? ''}${s.authors.length > 1 ? ' et al.' : ''} (${s.year ?? 'n.d.'})${a.level ? `, ${a.level}` : ''}: ${a.findings || 'Annotation pending.'}${a.limitations ? ` Limitation: ${a.limitations}` : ''}`;
      });
      return join(lines.join('\n'), v(p, 'gap') ? `Evidence gap: ${v(p, 'gap')}` : '');
    }
  },
  {
    id: 'framework',
    title: 'Theoretical and conceptual framework',
    keys: ['theory', 'theoryWhy', 'mechanism', 'conceptualFramework', 'logic.inputs', 'logic.activities', 'logic.outputs', 'logic.outcomes'],
    build: (p) => {
      const logic = [['Inputs', 'logic.inputs'], ['Activities', 'logic.activities'], ['Outputs', 'logic.outputs'], ['Outcomes', 'logic.outcomes']].filter(([, k]) => v(p, k)).map(([l, k]) => `${l}: ${v(p, k)}`).join('\n');
      return join(para(p, 'Guiding theory', 'theory'), para(p, 'Fit', 'theoryWhy'), para(p, 'Mechanism', 'mechanism'), para(p, 'Conceptual framework', 'conceptualFramework'), logic ? `Logic model\n${logic}` : '');
    }
  },
  {
    id: 'methods',
    title: 'Methods',
    keys: ['design', 'inference', 'rationale', 'designAlternatives', 'setting', 'exposure', 'comparator', 'dataSource', 'procedures', 'bias'],
    build: (p) => join(para(p, 'Design', 'design'), para(p, 'This design supports', 'inference'), para(p, 'Rationale', 'rationale'), para(p, 'Designs considered', 'designAlternatives'), para(p, 'Setting and dates', 'setting'), para(p, 'Intervention/exposure', 'exposure'), para(p, 'Comparator', 'comparator'), para(p, 'Data source', 'dataSource'), para(p, 'Procedures and timeline', 'procedures'), para(p, 'Confounders and bias', 'bias'))
  },
  {
    id: 'population',
    title: 'Population and recruitment',
    keys: ['population', 'inclusion', 'exclusion', 'recruitment', 'logistics.recruitment'],
    build: (p) => join(para(p, 'Population', 'population'), para(p, 'Inclusion criteria', 'inclusion'), para(p, 'Exclusion criteria', 'exclusion'), para(p, 'Sampling and recruitment', 'recruitment'), para(p, 'Recruitment logistics', 'logistics.recruitment'))
  },
  {
    id: 'measures',
    title: 'Measures and instruments',
    keys: ['primaryOutcome', 'outcomeLevel', 'secondaryOutcomes', 'variables', 'instrument', 'validityPlan', 'raterPlan'],
    build: (p) => join(para(p, 'Primary outcome', 'primaryOutcome'), para(p, 'Outcome level', 'outcomeLevel'), para(p, 'Secondary outcomes', 'secondaryOutcomes'), para(p, 'Variables', 'variables'), para(p, 'Instruments', 'instrument'), para(p, 'Validity evidence plan', 'validityPlan'), para(p, 'Rater training and reliability', 'raterPlan'))
  },
  {
    id: 'analysis',
    title: 'Analysis plan',
    keys: ['analysis', 'missingData'],
    build: (p) => join(para(p, '', 'analysis'), para(p, 'Missing data', 'missingData'))
  },
  {
    id: 'samplesize',
    title: 'Sample-size rationale',
    keys: ['sampleSize'],
    build: (p) => para(p, '', 'sampleSize')
  },
  {
    id: 'logistics',
    title: 'Logistics, resources and timeline',
    keys: ['logistics.dataAccess', 'logistics.resources', 'training.course', 'training.date', 'feasibility', 'feasibilityReason', 'risksSummary', 'timeline'],
    build: (p) => {
      const budget = p.lists.budget.filter((b) => b.item);
      const total = budget.reduce((s, b) => s + (Number(b.qty) || 0) * (Number(String(b.unit).replace(/[$,]/g, '')) || 0), 0);
      return join(
        para(p, 'Timeline', 'timeline'),
        para(p, 'Data access', 'logistics.dataAccess'),
        para(p, 'Resources and data storage', 'logistics.resources'),
        v(p, 'training.course') ? `Human subjects training: ${v(p, 'training.course')}${v(p, 'training.date') ? `, completed ${v(p, 'training.date')}` : ' (not yet completed)'}` : '',
        budget.length ? `Budget (preliminary): ${budget.map((b) => `${b.item} ${b.qty} × $${b.unit}${b.source ? ` (${b.source})` : ''}`).join('; ')}. Estimated total $${total.toLocaleString()}.` : '',
        p.lists.milestones.some((m) => m.date) ? `Timeline: ${p.lists.milestones.filter((m) => m.date).map((m) => `${m.name} — ${m.date}`).join('; ')}.` : '',
        p.lists.risks.length ? `Risks and contingencies: ${p.lists.risks.map((r) => `${r.risk} → ${r.fallback}`).join('; ')}.` : para(p, 'Risks and contingencies', 'risksSummary'),
        v(p, 'feasibility') ? `Feasibility assessment: ${v(p, 'feasibility')}${v(p, 'feasibilityReason') ? ` — ${v(p, 'feasibilityReason')}` : ''}` : ''
      );
    }
  },
  { id: 'risks', title: 'Risks and benefits', keys: ['risksBenefits', 'reviewCategory'], build: (p) => join(para(p, '', 'risksBenefits'), v(p, 'reviewCategory') ? `Anticipated review category (for IRB determination): ${v(p, 'reviewCategory')}` : '') },
  { id: 'privacy', title: 'Privacy and data protection', keys: ['privacy'], build: (p) => para(p, '', 'privacy') },
  { id: 'consent', title: 'Consent approach', keys: ['consent', 'coi'], build: (p) => join(para(p, '', 'consent'), para(p, 'Conflicts of interest and power imbalances', 'coi')) },
  {
    id: 'dissemination',
    title: 'Dissemination',
    keys: ['authorship', 'abstract'],
    build: (p) => join(p.lists.dissemination.length ? `Targets: ${p.lists.dissemination.map((d) => `${d.output} — ${d.target}${d.deadline ? ` (deadline ${d.deadline})` : ''}`).join('; ')}.` : '', para(p, 'Authorship plan', 'authorship'), v(p, 'abstract') ? `Preliminary abstract (results pending):\n${v(p, 'abstract')}` : '')
  },
  {
    id: 'references',
    title: 'References',
    keys: [],
    build: (p) =>
      p.sources
        .filter((s) => s.include)
        .map((s, i) => `${i + 1}. ${amaCitation(s)}${s.pdfUrl || s.fullTextUrl ? ` Available at: ${s.pdfUrl ?? s.fullTextUrl}` : ''} [${STATUS_LABEL[s.verification.status]}; ${ACCESS_LABEL[s.access]}]`)
        .join('\n')
  },
  {
    id: 'attachments',
    title: 'Supporting attachments and outstanding requirements',
    keys: ['outstanding'],
    build: (p) =>
      join(
        'Attachments to prepare: data collection form / data dictionary; survey or interview guide (if used); recruitment materials (if used); consent document or waiver request; human subjects training certificates.',
        para(p, 'Outstanding issues and institutional requirements', 'outstanding')
      )
  }
];

export const PROPOSAL_SECTIONS = TEMPLATES.map((t) => ({ id: t.id, title: t.title }));

function issuesFor(p: Project, keys: string[]): Issue[] {
  const out: Issue[] = [];
  const fw = activeFramework(p);
  for (const k of keys) {
    const def = fieldByKey[k];
    if (!def || (def.framework && def.framework !== fw)) continue;
    if (k === 'question' && v(p, 'revisedQuestion')) continue;
    const st = fstatus(p, k);
    const f = p.fields[k];
    if (f?.flag && f.value.trim()) out.push({ key: k, label: def.label, status: 'flag' });
    else if (st === 'unknown' && (def.required || ['problem', 'question', 'primaryOutcome', 'analysis'].includes(k))) out.push({ key: k, label: def.label, status: 'unknown' });
    else if (st === 'proposed' || st === 'verify') out.push({ key: k, label: def.label, status: st });
  }
  return out;
}

export function buildProposal(p: Project): DocSection[] {
  return TEMPLATES.map((t) => {
    const generated = t.build(p);
    const o = p.proposal[t.id];
    const edited = o?.text !== undefined;
    const issues = issuesFor(p, t.keys);
    if (t.id === 'references') {
      const bad = p.sources.filter((s) => s.include && s.verification.status !== 'verified');
      for (const s of bad) issues.push({ key: s.id, label: `Reference not fully verified: ${(s.title ?? s.input).slice(0, 60)}`, status: 'verify' });
    }
    return {
      id: t.id,
      title: t.title,
      generated,
      text: edited ? o!.text! : generated,
      edited,
      stale: edited && o!.basis !== hash(generated),
      issues,
      keys: t.keys
    };
  });
}

export function proposalIssueCount(p: Project) {
  return buildProposal(p).reduce((n, s) => n + s.issues.length + (s.stale ? 1 : 0) + (!s.text.trim() ? 1 : 0), 0);
}
