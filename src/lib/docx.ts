/**
 * DOCX exports (lazy-loaded). Deterministic layout; content comes from the Blueprint
 * and approved proposal text. Every document is labeled as a draft.
 */
import { AlignmentType, Document, Footer, Header, HeadingLevel, Packer, PageNumber, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { FIELDS, SECTIONS, WEEKS } from '@/content/fields';
import type { Project } from './types';
import { fstatus, fv } from './store';
import { fieldsForWeek, sectionFields, weekRequirements } from './progress';
import { buildProposal, DRAFT_LABEL } from './document';
import { amaCitation, ACCESS_LABEL, STATUS_LABEL } from './verify';

const STATUS_WORD = { confirmed: 'Confirmed', proposed: 'Proposed — not yet confirmed', unknown: 'Not yet defined', verify: 'Needs verification' } as const;
const FONT = 'Calibri';

const p = (text: string, opts: { bold?: boolean; italics?: boolean; size?: number; color?: string; spacingAfter?: number } = {}) =>
  new Paragraph({
    spacing: { after: opts.spacingAfter ?? 120 },
    children: text.split('\n').flatMap((line, i) => [...(i ? [new TextRun({ break: 1 })] : []), new TextRun({ text: line, bold: opts.bold, italics: opts.italics, size: opts.size ?? 22, color: opts.color, font: FONT })])
  });
const h = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) => new Paragraph({ heading: level, spacing: { before: 240, after: 120 }, children: [new TextRun({ text, font: FONT })] });
const flagNote = (text: string) => p(`⚑ ${text}`, { italics: true, color: '8A5A12', size: 20 });

function docShell(project: Project, title: string, children: Paragraph[] | (Paragraph | Table)[]) {
  return new Document({
    creator: 'ResearchForge (MedEd Forge)',
    title,
    styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [
      {
        properties: { page: { margin: { top: 1080, bottom: 1080, left: 1200, right: 1200 } } },
        headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `ResearchForge · ${DRAFT_LABEL}`, size: 16, color: '626579', font: FONT })] })] }) },
        footers: {
          default: new Footer({
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${project.title} · generated ${new Date().toLocaleDateString()} · page `, size: 16, color: '626579', font: FONT }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '626579', font: FONT })] })]
          })
        },
        children: [
          new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: title, font: FONT })] }),
          p(project.title, { bold: true, size: 26 }),
          p([project.resident && `Resident: ${project.resident}${project.pgy ? ` (${project.pgy})` : ''}`, fv(project, 'mentor.name') && `Mentor: ${fv(project, 'mentor.name')}`].filter(Boolean).join(' · ') || ' '),
          p(DRAFT_LABEL, { bold: true, color: 'A93D74' }),
          p('This document was prepared with an AI-assisted planning tool. It is a draft for faculty review, not an IRB submission or approval. Items marked ⚑ are unresolved.', { italics: true, size: 18, color: '626579', spacingAfter: 240 }),
          ...children
        ]
      }
    ]
  });
}

async function save(doc: Document, name: string) {
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'project';

function fieldParas(project: Project, keys: string[]) {
  const out: Paragraph[] = [];
  for (const k of keys) {
    const def = FIELDS.find((f) => f.key === k)!;
    const val = fv(project, k).trim();
    const st = fstatus(project, k);
    out.push(p(def.label, { bold: true, spacingAfter: 40 }));
    out.push(p(val || '—'));
    if (st !== 'confirmed' && val) out.push(flagNote(STATUS_WORD[st]));
    else if (!val && def.required) out.push(flagNote('Required — not yet defined'));
    if (project.fields[k]?.flag && val) out.push(flagNote('Recheck: the research question changed after this was written'));
  }
  return out;
}

function sourcesTable(project: Project) {
  const inc = project.sources.filter((s) => s.include);
  const cell = (t: string, bold = false) => new TableCell({ children: [p(t, { bold, size: 18, spacingAfter: 40 })], width: { size: 1, type: WidthType.AUTO } });
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'D3D7E4' };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border },
    rows: [
      new TableRow({ tableHeader: true, children: ['#', 'Citation & access', 'Design / sample', 'Findings', 'Limitations', 'Relevance', 'Verification'].map((t) => cell(t, true)) }),
      ...inc.map(
        (s, i) =>
          new TableRow({
            children: [
              cell(String(i + 1)),
              cell(`${amaCitation(s)}\n${ACCESS_LABEL[s.access]}${s.pdfUrl || s.fullTextUrl ? `\n${s.pdfUrl ?? s.fullTextUrl}` : ''}`),
              cell([s.annotation.level, s.annotation.design, s.annotation.sample].filter(Boolean).join('\n')),
              cell(s.annotation.findings),
              cell(s.annotation.limitations),
              cell(s.annotation.relevance),
              cell(`${STATUS_LABEL[s.verification.status]}${s.verification.checkedAt ? ` (${new Date(s.verification.checkedAt).toLocaleDateString()})` : ''}${s.annotation.readFullText ? '\nRead in full' : ''}${s.annotation.aiDrafted ? '\nAI-drafted from abstract' : ''}`)
            ]
          })
      )
    ]
  });
}

export async function exportWeekly(project: Project, n: number) {
  const w = WEEKS[n - 1];
  const reqs = weekRequirements(project, n);
  const children: (Paragraph | Table)[] = [h(`Stage ${n}: ${w.title}`, HeadingLevel.HEADING_1), p(`Deliverable: ${w.deliverable}`, { italics: true })];
  const fields = fieldsForWeek(project, n);
  const story = fields.filter((f) => f.key.startsWith('story.'));
  if (story.length) {
    children.push(h('Once Upon a Time research story', HeadingLevel.HEADING_2));
    for (const f of story) children.push(p(`${f.label} ${fv(project, f.key).trim() || '—'}`));
  }
  const groups = SECTIONS.filter((s) => s.week === n);
  for (const g of groups) {
    const keys = fields.filter((f) => f.section === g.id && !f.key.startsWith('story.')).map((f) => f.key);
    if (!keys.length && g.id !== 'gap') continue;
    children.push(h(g.title, HeadingLevel.HEADING_2), ...fieldParas(project, keys));
  }
  if (n === 2) {
    children.push(h('Search log', HeadingLevel.HEADING_2));
    project.lists.searchLog.forEach((r) => children.push(p(`${r.date} · ${r.db} · ${r.string} · ${r.filters} · ${r.hits} hits, ${r.kept} kept`, { size: 20 })));
    if (!project.lists.searchLog.length) children.push(flagNote('No searches logged yet'));
    children.push(h('Annotated bibliography', HeadingLevel.HEADING_2), sourcesTable(project));
  }
  if (n === 4) {
    children.push(h('Team', HeadingLevel.HEADING_2), ...project.lists.team.map((t) => p(`${t.name} — ${t.role}${t.contact ? ` (${t.contact})` : ''}`)));
    children.push(h('Preliminary budget', HeadingLevel.HEADING_2), ...project.lists.budget.map((b) => p(`${b.item}: ${b.qty} × $${b.unit} — ${b.source}`)));
    children.push(h('Timeline', HeadingLevel.HEADING_2), ...project.lists.milestones.map((m) => p(`${m.name}: ${m.date || 'date not set'}`)));
    children.push(h('Risks and fallbacks', HeadingLevel.HEADING_2), ...project.lists.risks.map((r) => p(`${r.risk} → ${r.fallback}`)));
    children.push(h('Dissemination', HeadingLevel.HEADING_2), ...project.lists.dissemination.map((d) => p(`${d.output}: ${d.target}${d.deadline ? ` (deadline ${d.deadline})` : ''}`)));
  }
  children.push(h('Deliverable checklist', HeadingLevel.HEADING_2), ...reqs.map((r) => p(`${r.done ? '☑' : '☐'} ${r.label}`)));
  const fb = project.comments.filter((c) => c.role === 'mentor' && (c.target === `week:${n}` || groups.some((g) => g.id === c.target)));
  if (fb.length) children.push(h('Faculty feedback', HeadingLevel.HEADING_2), ...fb.map((c) => p(`${c.author} (${new Date(c.at).toLocaleDateString()}): ${c.text}${c.resolved ? ' — resolved' : ''}`)));
  await save(docShell(project, `Stage ${n}`, children), `${slug(project.title)}-stage${n}.docx`);
}

export async function exportBlueprint(project: Project) {
  const children: (Paragraph | Table)[] = [];
  for (const s of SECTIONS) {
    children.push(h(s.title, HeadingLevel.HEADING_1));
    if (s.id === 'references') {
      if (project.sources.some((x) => x.include)) children.push(sourcesTable(project));
      else children.push(flagNote('No references yet'));
    }
    children.push(...fieldParas(project, sectionFields(project, s.id).map((f) => f.key)));
    const r = project.readiness[s.id];
    if (r && r !== 'pending') children.push(p(`Mentor readiness: ${r === 'ready' ? 'Ready' : 'Needs revision'}`, { italics: true, size: 20 }));
  }
  await save(docShell(project, 'Research Blueprint', children), `${slug(project.title)}-blueprint.docx`);
}

export async function exportProtocol(project: Project) {
  const secs = buildProposal(project);
  const children: Paragraph[] = [];
  for (const s of secs) {
    children.push(h(s.title, HeadingLevel.HEADING_1));
    if (s.text.trim()) for (const block of s.text.split(/\n{2,}/)) children.push(p(block));
    else children.push(flagNote('Section not yet written'));
    for (const i of s.issues) children.push(flagNote(`${i.label}: ${i.status === 'unknown' ? 'not yet defined' : i.status === 'flag' ? 'recheck after question change' : i.status === 'verify' ? 'needs verification' : 'proposed, not confirmed'}`));
    if (s.stale) children.push(flagNote('Blueprint changed after this section was edited — reconcile before submission'));
  }
  const so = project.signoffs;
  children.push(h('Review status', HeadingLevel.HEADING_1));
  for (const [k, label] of [['w2', 'Research question & evidence gap'], ['w4', 'Methodological feasibility'], ['w5', 'IRB-draft readiness']] as const) {
    const x = so[k];
    children.push(p(`${label}: ${x ? `${x.status === 'ready' ? 'Ready' : x.status === 'revise' ? 'Needs revision' : 'Pending'} — ${x.by}, ${new Date(x.at).toLocaleDateString()}${x.note ? ` (${x.note})` : ''}` : 'Not yet reviewed'}`));
  }
  children.push(p('Faculty review is not IRB approval. Do not recruit participants or collect research data until all required institutional reviews are complete.', { italics: true, size: 20 }));
  await save(docShell(project, 'Preliminary Research Protocol', children), `${slug(project.title)}-protocol-draft.docx`);
}
