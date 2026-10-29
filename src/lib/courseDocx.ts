/** Word exports for Academy assignments and the combined proposal (lazy-loaded). */
import { AlignmentType, Document, Footer, Header, HeadingLevel, Packer, PageNumber, Paragraph, TextRun } from 'docx';
import { COURSE, READINGS } from '@/content/course';
import { getSettings } from './store';
import { readCourse, work } from './courseStore';

const FONT = 'Calibri';
const para = (text: string, o: { bold?: boolean; italics?: boolean; size?: number; color?: string } = {}) =>
  new Paragraph({
    spacing: { after: 140 },
    children: text.split('\n').flatMap((line, i) => [...(i ? [new TextRun({ break: 1 })] : []), new TextRun({ text: line, bold: o.bold, italics: o.italics, size: o.size ?? 23, color: o.color, font: FONT })])
  });
const head = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) => new Paragraph({ heading: level, spacing: { before: 240, after: 120 }, children: [new TextRun({ text, font: FONT })] });

function doc(title: string, children: Paragraph[]) {
  const s = getSettings();
  return new Document({
    creator: 'ResearchForge',
    title,
    styles: { default: { document: { run: { font: FONT, size: 23 } } } },
    sections: [{
      properties: { page: { margin: { top: 1080, bottom: 1080, left: 1200, right: 1200 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'ResearchForge · Research Design Academy', size: 16, color: '6A6158', font: FONT })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${s.learnerName || 'Learner'} · ${new Date().toLocaleDateString()} · page `, size: 16, color: '6A6158', font: FONT }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6A6158', font: FONT })] })] }) },
      children: [new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: title, font: FONT })] }), ...(s.learnerName ? [para(s.learnerName, { bold: true })] : []), ...children]
    }]
  });
}

async function save(d: Document, name: string) {
  const blob = await Packer.toBlob(d);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function weekBody(n: number, useSubmitted: boolean): Paragraph[] {
  const s = readCourse();
  const w = work(s, n);
  const values = useSubmitted && w.submitted && !w.editing ? w.submitted : w.values;
  const def = COURSE[n - 1];
  const out: Paragraph[] = [];
  for (const f of def.assignment.fields) {
    const v = (values[f.key] ?? '').trim();
    out.push(new Paragraph({ spacing: { before: 120, after: 40 }, children: [new TextRun({ text: f.label, bold: true, font: FONT, size: 23 })] }));
    out.push(para(v || '— not completed —', v ? {} : { italics: true, color: '8A5D17' }));
  }
  return out;
}

export async function exportAssignment(n: number) {
  const s = readCourse();
  const w = work(s, n);
  const def = COURSE[n - 1];
  const meta = w.submittedAt && !w.editing ? `Submitted ${new Date(w.submittedAt).toLocaleString()}${w.submissions > 1 ? ` (version ${w.submissions})` : ''}` : 'Draft — not yet submitted';
  await save(doc(`Week ${n}: ${def.assignment.title}`, [para(meta, { italics: true, color: '6A6158' }), para(`Expected output: ${def.assignment.output}`, { italics: true }), ...weekBody(n, true)]), `researchforge-week${n}.docx`);
}

export async function exportProtocol() {
  const children: Paragraph[] = [para('Draft research proposal assembled from Research Design Academy assignments. For faculty review; not an IRB submission.', { italics: true, color: '6A6158' })];
  const titles = ['1. Research story and question', '2. Literature and evidence gap', '3. Design, measures and analysis', '4. Mentor, logistics and dissemination', '5. Ethics and IRB preparation'];
  COURSE.forEach((w, i) => {
    children.push(head(titles[i], HeadingLevel.HEADING_1));
    children.push(...weekBody(w.n, false));
  });
  children.push(head('Key references', HeadingLevel.HEADING_1));
  const ids = [...new Set(COURSE.flatMap((w) => w.readings))];
  ids.forEach((id, i) => children.push(para(`${i + 1}. ${READINGS[id].cite}`, { size: 20 })));
  await save(doc('Research proposal (draft)', children), 'researchforge-proposal.docx');
}
