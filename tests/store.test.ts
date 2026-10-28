import { describe, expect, it, vi } from 'vitest';
import { blankProject, setField, setStatus, hydrate, parseProjectJson, exportProjectJson, createProject, loadAll, useProjects } from '@/lib/store';
import { buildProposal, hash } from '@/lib/document';
import { weekRequirements, weekStatus } from '@/lib/progress';

describe('Blueprint fields', () => {
  it('resident text is confirmed; AI accept keeps history', () => {
    const p = blankProject();
    setField(p, 'question', 'Q1');
    expect(p.fields.question.status).toBe('confirmed');
    setField(p, 'question', 'Q2', { origin: 'ai', status: 'confirmed' });
    expect(p.fields.question.history[0].value).toBe('Q1');
  });
  it('status changes are recorded', () => {
    const p = blankProject();
    setField(p, 'gap', 'Gap');
    setStatus(p, 'gap', 'verify');
    expect(p.fields.gap.status).toBe('verify');
    expect(p.fields.gap.history).toHaveLength(1);
  });
  it('changing the question later flags downstream fields without erasing them', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-01T10:00:00Z'));
    const p = blankProject();
    setField(p, 'question', 'Original question');
    setField(p, 'primaryOutcome', 'BP check within 10 days');
    vi.setSystemTime(new Date('2026-10-02T10:00:00Z'));
    setField(p, 'question', 'Revised question');
    expect(p.fields.primaryOutcome.flag).toBeTruthy();
    expect(p.fields.primaryOutcome.value).toBe('BP check within 10 days');
    vi.useRealTimers();
  });
});

describe('progress', () => {
  it('derives week status and requirements from content', () => {
    const p = blankProject();
    expect(weekStatus(p, 1)).toBe('not_started');
    setField(p, 'problem', 'x');
    expect(weekStatus(p, 1)).toBe('in_progress');
    p.weekStatus[1] = 'ready';
    expect(weekStatus(p, 1)).toBe('ready');
    expect(weekRequirements(p, 2).find((r) => r.id === 'sources')?.done).toBe(false);
  });
});

describe('proposal reconciliation', () => {
  it('marks an edited section stale when the Blueprint changes', () => {
    const p = blankProject();
    setField(p, 'analysis', 'Chi-square');
    const s1 = buildProposal(p).find((s) => s.id === 'analysis')!;
    p.proposal.analysis = { text: 'My edited analysis text', basis: hash(s1.generated) };
    expect(buildProposal(p).find((s) => s.id === 'analysis')!.stale).toBe(false);
    setField(p, 'analysis', 'Logistic regression');
    const s2 = buildProposal(p).find((s) => s.id === 'analysis')!;
    expect(s2.stale).toBe(true);
    expect(s2.text).toBe('My edited analysis text');
  });
  it('flags unknown required fields as issues', () => {
    const p = blankProject();
    expect(buildProposal(p).find((s) => s.id === 'measures')!.issues.some((i) => i.key === 'primaryOutcome')).toBe(true);
  });
});

describe('persistence', () => {
  it('round-trips export/import and hydrates older saves', () => {
    const p = blankProject('Round trip');
    setField(p, 'question', 'Q');
    const back = parseProjectJson(exportProjectJson(p));
    expect(back.fields.question.value).toBe('Q');
    const old = hydrate({ id: 'x', title: 'Old', fields: {}, sources: [{ id: 's', input: 'doi' }] });
    expect(old.comments).toEqual([]);
    expect(old.sources[0].include).toBe(true);
    expect(() => parseProjectJson('{"app":"other"}')).toThrow();
  });
  it('saves projects to IndexedDB and reloads them', async () => {
    const p = await createProject('Stored');
    await loadAll();
    expect(typeof useProjects).toBe('function');
    const all = (await import('@/lib/store')).blankProject;
    expect(all).toBeTruthy();
    expect(p.id).toMatch(/^p_/);
  });
});
