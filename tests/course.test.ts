import { beforeEach, describe, expect, it } from 'vitest';
import { COURSE, READINGS } from '@/content/course';
import { FIELDS, fieldByKey, SECTIONS, WEEKS } from '@/content/fields';
import { assignmentStatus, bringToConcierge, missingRequired, readCourse, reopen, setValue, submit, updateCourse } from '@/lib/courseStore';
import { getProjectCached, loadAll } from '@/lib/store';

describe('course content', () => {
  it('has five weeks with 5–8 slides, a check and a running-example slide each', () => {
    expect(COURSE.map((w) => w.n)).toEqual([1, 2, 3, 4, 5]);
    for (const w of COURSE) {
      expect(w.slides.length).toBeGreaterThanOrEqual(5);
      expect(w.slides.length).toBeLessThanOrEqual(8);
      expect(w.slides.some((s) => s.kind === 'check')).toBe(true);
      expect(w.slides.some((s) => s.kind === 'case')).toBe(true);
      const check = w.slides.find((s) => s.kind === 'check');
      if (check?.kind === 'check') expect(check.options.filter((o) => o.correct)).toHaveLength(1);
    }
  });
  it('every reading referenced exists and has a link', () => {
    for (const w of COURSE) {
      for (const id of [...w.readings, ...w.practice.map((p) => p.cite)]) {
        expect(READINGS[id], id).toBeTruthy();
        expect(READINGS[id].url).toMatch(/^https:\/\//);
      }
    }
  });
  it('every assignment field maps to a real Concierge field', () => {
    for (const w of COURSE) for (const f of w.assignment.fields) if (f.concierge) expect(fieldByKey[f.concierge], f.concierge).toBeTruthy();
  });
  it('Concierge has seven stages and every section belongs to one', () => {
    expect(WEEKS.map((w) => w.n)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const s of SECTIONS) expect(s.week).toBeGreaterThanOrEqual(1);
    for (const f of FIELDS) expect(SECTIONS.some((s) => s.id === f.section), f.key).toBe(true);
  });
});

describe('assignment workflow', () => {
  beforeEach(() => updateCourse((s) => { s.weeks = {}; s.linkedProjectId = undefined; }));
  it('requires required fields, submits, and reopens', () => {
    expect(missingRequired(readCourse(), 1).length).toBeGreaterThan(0);
    for (const f of COURSE[0].assignment.fields) if (f.required) setValue(1, f.key, f.kind === 'select' ? f.options![0] : `x ${f.key}`);
    expect(missingRequired(readCourse(), 1)).toEqual([]);
    submit(1);
    expect(assignmentStatus(readCourse(), 1)).toBe('submitted');
    expect(readCourse().weeks[1].submitted?.question).toBe('x question');
    reopen(1);
    expect(assignmentStatus(readCourse(), 1)).toBe('in_progress');
  });
  it('brings answers into the Concierge without overwriting edits there', async () => {
    await loadAll();
    setValue(1, 'question', 'Does A improve B?');
    setValue(1, 'problem', 'P');
    const r1 = await bringToConcierge([1]);
    const p = await getProjectCached(r1.projectId);
    expect(p?.fields.question.value).toBe('Does A improve B?');
    expect(p?.fields.question.status).toBe('confirmed');
    setValue(1, 'question', 'Changed in course');
    const { persist, setField } = await import('@/lib/store');
    setField(p!, 'question', 'Edited in Concierge', { origin: 'resident' });
    await persist(p!);
    const r2 = await bringToConcierge([1]);
    expect(r2.projectId).toBe(r1.projectId);
    expect(r2.kept).toBe(1);
    expect((await getProjectCached(r1.projectId))?.fields.question.value).toBe('Edited in Concierge');
  });
});

describe('question starters follow the question type', () => {
  it('switches starter for PEO/SPIDER and treats any unedited starter as blank', async () => {
    const { COURSE, starterFor, isBlankAnswer } = await import('@/content/course');
    const q = COURSE[0].assignment.fields.find((f) => f.key === 'question')!;
    expect(starterFor(q, { framework: 'PICOT' })).toMatch(/compared with/);
    expect(starterFor(q, { framework: 'PEO' })).toMatch(/experience/);
    expect(isBlankAnswer(q, starterFor(q, { framework: 'SPIDER' })!)).toBe(true);
    expect(isBlankAnswer(q, 'How do residents experience night float?')).toBe(false);
  });
});
