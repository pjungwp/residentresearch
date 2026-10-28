import { describe, expect, it } from 'vitest';
import { parseProposals, splitWithProposals, extractIdentifiers, phiWarnings, buildContext } from '@/lib/ai';
import { blankProject, setField } from '@/lib/store';

describe('proposal parsing', () => {
  it('parses valid proposals and rejects unknown fields or invalid options', () => {
    const text = 'Here.\n\n```proposal\n{"field":"question","value":"Among X, does Y?","note":"tighter"}\n```\n\n```proposal\n{"field":"design","value":"Banana"}\n```\n\n```proposal\n{"field":"nope","value":"x"}\n```';
    const ps = parseProposals(text);
    expect(ps).toHaveLength(3);
    expect(ps[0]).toMatchObject({ field: 'question', valid: true });
    expect(ps[1].valid).toBe(false);
    expect(ps[2].problem).toMatch(/Unknown field/);
  });
  it('treats malformed JSON as invalid, never applying it', () => {
    expect(parseProposals('```proposal\n{bad json\n```')[0].valid).toBe(false);
  });
  it('splits markdown around proposals and hides half-streamed fences', () => {
    const parts = splitWithProposals('A\n```proposal\n{"field":"question","value":"Q"}\n```\nB\n```proposal\n{"fie');
    expect(parts.map((p) => p.kind)).toEqual(['md', 'proposal', 'md']);
    expect((parts[2] as any).text).not.toContain('```');
  });
});

describe('identifiers and PHI', () => {
  it('extracts DOIs, PMIDs and PMCIDs from AI text', () => {
    const ids = extractIdentifiers('See DOI: 10.1097/AOG.0000000000004514. Also PMID: 35797481 and PMC9876543.');
    expect(ids).toEqual(expect.arrayContaining(['doi:10.1097/aog.0000000000004514', 'pmid:35797481', 'pmcid:PMC9876543']));
  });
  it('warns on likely PHI but not on citation identifiers', () => {
    expect(phiWarnings('Patient Mrs. Smith, MRN 12345678, DOB 03/14/1985').length).toBeGreaterThan(1);
    expect(phiWarnings('PMID 35797481 and doi 10.1097/GME.0000000000002028')).toEqual([]);
  });
});

describe('context', () => {
  it('includes statuses and field keys, and marks flagged fields', () => {
    const p = blankProject('Test');
    setField(p, 'question', 'Does X improve Y?');
    setField(p, 'design', 'Retrospective cohort / chart review');
    p.fields.design.flag = { reason: 'changed', at: '' };
    p.currentWeek = 3;
    const ctx = buildContext(p, 3);
    expect(ctx).toContain('[question] (CONFIRMED)');
    expect(ctx).toContain('FLAGGED');
    expect(ctx).toContain('Field keys you may propose');
  });
});
