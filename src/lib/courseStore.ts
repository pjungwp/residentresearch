/**
 * Academy progress and assignments. Stored separately from Concierge projects
 * (localStorage key `rf.course`), so the course and the Concierge never overwrite each other.
 */
import { useSyncExternalStore } from 'react';
import { COURSE } from '@/content/course';
import { createProject, persist, setField, getProjectCached } from './store';

export type AssignmentStatus = 'not_started' | 'in_progress' | 'submitted';

export interface WeekWork {
  values: Record<string, string>;
  updatedAt?: string;
  submittedAt?: string;
  /** last submitted snapshot (kept even when reopened for edits) */
  submitted?: Record<string, string>;
  submissions: number;
  editing?: boolean;
  aiFeedback?: string;
  aiFeedbackAt?: string;
}

export interface CourseState {
  schema: 1;
  weeks: Record<number, WeekWork>;
  slide: Record<number, number>;
  slidesDone: Record<number, boolean>;
  answers: Record<string, number>;
  linkedProjectId?: string;
}

const KEY = 'rf.course';
const blank = (): CourseState => ({ schema: 1, weeks: {}, slide: {}, slidesDone: {}, answers: {} });

function read(): CourseState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const s = JSON.parse(raw);
    return { ...blank(), ...s };
  } catch {
    return blank();
  }
}

let snap = read();
let saveError = false;
const listeners = new Set<() => void>();

export function updateCourse(fn: (s: CourseState) => void) {
  const next = structuredClone(snap);
  fn(next);
  snap = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(snap));
    saveError = false;
  } catch {
    saveError = true;
  }
  listeners.forEach((l) => l());
}

export function useCourse(): CourseState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snap,
    () => snap
  );
}
export const courseSaveFailed = () => saveError;
export const readCourse = () => snap;

export function work(s: CourseState, n: number): WeekWork {
  return s.weeks[n] ?? { values: {}, submissions: 0 };
}

export function setValue(n: number, key: string, value: string) {
  updateCourse((s) => {
    const w = (s.weeks[n] ??= { values: {}, submissions: 0 });
    w.values[key] = value;
    w.updatedAt = new Date().toISOString();
  });
}

export function assignmentStatus(s: CourseState, n: number): AssignmentStatus {
  const w = s.weeks[n];
  if (!w) return 'not_started';
  if (w.submittedAt && !w.editing) return 'submitted';
  return Object.values(w.values).some((v) => v.trim()) ? 'in_progress' : 'not_started';
}

export function missingRequired(s: CourseState, n: number): string[] {
  const def = COURSE[n - 1];
  const w = work(s, n);
  return def.assignment.fields.filter((f) => f.required && !(w.values[f.key] ?? '').trim()).map((f) => f.label);
}

export function submit(n: number) {
  updateCourse((s) => {
    const w = (s.weeks[n] ??= { values: {}, submissions: 0 });
    w.submittedAt = new Date().toISOString();
    w.submitted = { ...w.values };
    w.submissions += 1;
    w.editing = false;
  });
}

export function reopen(n: number) {
  updateCourse((s) => {
    const w = (s.weeks[n] ??= { values: {}, submissions: 0 });
    w.editing = true;
  });
}

/** Plain-text version of a week's assignment (for email and AI feedback). */
export function assignmentText(s: CourseState, n: number, values?: Record<string, string>): string {
  const def = COURSE[n - 1];
  const v = values ?? work(s, n).values;
  const lines = [`Week ${n} — ${def.assignment.title}`, ''];
  for (const f of def.assignment.fields) {
    const val = (v[f.key] ?? '').trim();
    if (val) lines.push(`${f.label}: ${val}`);
  }
  return lines.join('\n');
}

/**
 * Copy assignment answers into a Concierge project. Creates a project the first time.
 * Never overwrites a Concierge field the user already filled differently; returns counts.
 */
export async function bringToConcierge(weeks: number[], title?: string): Promise<{ projectId: string; filled: number; kept: number }> {
  const s = snap;
  let project = s.linkedProjectId ? await getProjectCached(s.linkedProjectId) : undefined;
  if (!project) {
    const q = work(s, 1).values.question?.trim();
    project = await createProject(title || (q ? q.slice(0, 70) : 'My Academy project'), '');
    project.startMode = 'refine';
  }
  let filled = 0;
  let kept = 0;
  for (const n of weeks) {
    const def = COURSE[n - 1];
    const v = work(s, n).values;
    for (const f of def.assignment.fields) {
      const val = (v[f.key] ?? '').trim();
      if (!val || !f.concierge) continue;
      const cur = (project.fields[f.concierge]?.value ?? '').trim();
      if (cur && cur !== val) {
        kept++;
        continue;
      }
      if (cur === val) continue;
      setField(project, f.concierge, val, { origin: 'resident', status: 'confirmed' });
      filled++;
    }
  }
  if (!project.fields.framework?.value && work(s, 1).values.question) setField(project, 'framework', 'PICOT', { origin: 'resident', status: 'confirmed' });
  project.updatedAt = new Date().toISOString();
  await persist(project);
  const id = project.id;
  updateCourse((x) => void (x.linkedProjectId = id));
  return { projectId: id, filled, kept };
}

export function exportCourseJson(): string {
  return JSON.stringify({ kind: 'researchforge-academy', ...snap }, null, 2);
}
export function importCourseJson(text: string) {
  const j = JSON.parse(text);
  if (j?.kind !== 'researchforge-academy' || j.schema !== 1) throw new Error('This file is not a ResearchForge Academy backup.');
  const { kind: _k, ...rest } = j;
  updateCourse((s) => Object.assign(s, blank(), rest));
}
