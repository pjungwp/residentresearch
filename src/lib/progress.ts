import { FIELDS, SECTIONS, WEEKS, fieldByKey } from '@/content/fields';
import type { Project } from './types';
import { fv } from './store';

/**
 * Progress = deliverables actually completed (required fields filled, checklist items ticked,
 * required lists populated). No AI-generated percentages.
 */
export interface Req {
  id: string;
  label: string;
  done: boolean;
}

export function activeFramework(p: Project): 'PICOT' | 'PEO' | 'SPIDER' {
  const f = fv(p, 'framework');
  return f === 'PEO' || f === 'SPIDER' ? f : 'PICOT';
}

export function fieldsForWeek(p: Project, week: number) {
  const fw = activeFramework(p);
  return FIELDS.filter((f) => f.week === week && (!f.framework || f.framework === fw));
}

export function weekRequirements(p: Project, week: number): Req[] {
  const reqs: Req[] = fieldsForWeek(p, week)
    .filter((f) => f.required)
    .map((f) => ({ id: f.key, label: f.label, done: !!fv(p, f.key).trim() }));
  if (week === 1) {
    const storyDone = ['story.believed', 'story.wondered', 'story.propose', 'story.anticipate', 'story.change'].filter((k) => fv(p, k).trim()).length >= 4;
    reqs.unshift({ id: 'story', label: 'Once upon a time story', done: storyDone });
  }
  if (week === 2) {
    const included = p.sources.filter((s) => s.include);
    const verified = included.filter((s) => s.verification.status === 'verified' || s.verification.status === 'partial');
    reqs.unshift(
      { id: 'searchLog', label: 'Search log (at least 2 searches)', done: p.lists.searchLog.length >= 2 },
      { id: 'sources', label: 'At least 3 relevant sources included', done: included.length >= 3 },
      { id: 'verified', label: 'All included sources verified', done: included.length > 0 && verified.length === included.length },
      { id: 'annotated', label: 'All included sources annotated', done: included.length > 0 && included.every((s) => s.annotation.findings.trim() && s.annotation.limitations.trim()) },
      { id: 'recheck', label: 'Recheck pass run', done: included.length > 0 && included.every((s) => !!s.verification.recheckedAt) }
    );
  }
  if (week === 4) {
    reqs.push(
      { id: 'milestones', label: 'Timeline dates set', done: p.lists.milestones.filter((m) => m.date).length >= 3 },
      { id: 'risks', label: 'Top risks with fallbacks', done: p.lists.risks.length >= 1 },
      { id: 'dissemination', label: 'Dissemination target', done: p.lists.dissemination.length >= 1 }
    );
  }
  for (const c of WEEKS[week - 1].checklist) reqs.push({ id: c.id, label: c.text, done: !!p.checks[c.id] });
  return reqs;
}

export function weekProgress(p: Project, week: number) {
  const r = weekRequirements(p, week);
  const done = r.filter((x) => x.done).length;
  return { done, total: r.length, complete: done === r.length };
}

export function weeksComplete(p: Project) {
  return WEEKS.filter((w) => weekProgress(p, w.n).complete).length;
}

/** Fields shown in the Live Blueprint for a section, with resolved statuses. */
export function sectionFields(p: Project, sectionId: string) {
  const fw = activeFramework(p);
  return FIELDS.filter((f) => f.section === sectionId && !f.workingOnly && (!f.framework || f.framework === fw));
}

export function blueprintCounts(p: Project) {
  const keys = SECTIONS.flatMap((s) => sectionFields(p, s.id)).map((f) => f.key);
  const counts = { confirmed: 0, proposed: 0, unknown: 0, verify: 0 };
  for (const k of keys) {
    const f = p.fields[k];
    if (!f || !f.value.trim()) counts.unknown++;
    else counts[f.status]++;
  }
  return { ...counts, total: keys.length };
}

/** Decisions still open: proposed or needs-verification fields, plus unverified included sources. */
export function openItems(p: Project) {
  const items: { key: string; label: string; status: string; week: number }[] = [];
  for (const [k, f] of Object.entries(p.fields)) {
    if (!fieldByKey[k] || fieldByKey[k].workingOnly) continue;
    if (f.flag && f.value.trim()) items.push({ key: k, label: `${fieldByKey[k].label}: recheck after question change`, status: 'flag', week: fieldByKey[k].week });
    else if (f.value.trim() && (f.status === 'proposed' || f.status === 'verify')) items.push({ key: k, label: fieldByKey[k].label, status: f.status, week: fieldByKey[k].week });
  }
  const unverified = p.sources.filter((s) => s.include && !['verified', 'partial'].includes(s.verification.status)).length;
  if (unverified) items.push({ key: 'sources', label: `${unverified} source${unverified > 1 ? 's' : ''} not verified`, status: 'verify', week: 2 });
  return items;
}

import type { WeekStatus } from './types';
/** Resident/mentor-set status wins; otherwise derive not started / in progress from content. */
export function weekStatus(p: Project, week: number): WeekStatus {
  const set = p.weekStatus[week];
  if (set && set !== 'not_started' && set !== 'in_progress') return set;
  const any = FIELDS.some((f) => f.week === week && fv(p, f.key).trim()) || (week === 2 && p.sources.length > 0);
  return any ? 'in_progress' : 'not_started';
}

export const WEEK_STATUS_LABEL: Record<WeekStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  ready: 'Ready for mentor review',
  revision: 'Revision requested',
  completed: 'Completed'
};
