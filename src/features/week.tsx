import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Sparkles, Download, ExternalLink, BookOpen, FileText, Send, MessageSquare, ShieldCheck, ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useProjectCtx } from '@/components/shell';
import { WEEKS, TONE_CLASSES, SECTIONS } from '@/content/fields';
import { FieldEditor, ListEditor, CommentThread, addComment, resolveComment } from '@/components/fields';
import { fieldsForWeek, weekRequirements, weekStatus, WEEK_STATUS_LABEL } from '@/lib/progress';
import { fv, useSettings } from '@/lib/store';
import { isOpen, STATUS_LABEL } from '@/lib/verify';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/components/ui/Toast';
import type { WeekStatus } from '@/lib/types';

const THEORY_GUIDE = [
  { t: 'Adult learning', w: 'Self-directed, relevance-driven learners' },
  { t: 'Experiential (Kolb)', w: 'Learning by doing + reflection (simulation, debrief)' },
  { t: 'Cognitive load', w: 'Complex tasks; worked examples, scaffolding' },
  { t: 'Constructivism', w: 'Learners build meaning; cases, discussion' },
  { t: 'Situated learning', w: 'Learning in clinical communities of practice' },
  { t: 'Self-determination', w: 'Motivation: autonomy, competence, relatedness' }
];
const DESIGN_GUIDE = [
  { q: 'Does it work?', d: 'Randomized, crossover, controlled pre–post' },
  { q: 'Did they improve?', d: 'Single-group pre–post (weakest causal claim)' },
  { q: 'How/why does it work?', d: 'Interviews, focus groups (qualitative)' },
  { q: 'Both?', d: 'Mixed methods' },
  { q: 'How common / related?', d: 'Survey, cohort, chart review' }
];

export function WeekPage() {
  const { n: nParam } = useParams();
  const n = Math.min(Math.max(Number(nParam) || 1, 1), WEEKS.length);
  const { project, update } = useProjectCtx();
  const w = WEEKS[n - 1];
  const tone = TONE_CLASSES[w.tone];
  const navigate = useNavigate();
  const toast = useToast();
  const { role, mentorName } = useSettings();
  usePageTitle(`Stage ${n} · ${w.title}`);
  const [more, setMore] = useState(false);

  useEffect(() => {
    if (project.currentWeek !== n) update((p) => void (p.currentWeek = n));
    setMore(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const reqs = weekRequirements(project, n);
  const done = reqs.filter((r) => r.done).length;
  const status = weekStatus(project, n);
  const fields = fieldsForWeek(project, n);
  const story = fields.filter((f) => f.key.startsWith('story.'));
  const rest = fields.filter((f) => !f.key.startsWith('story.'));
  const core = rest.filter((f) => f.required || f.framework);
  const optional = rest.filter((f) => !f.required && !f.framework);
  const stageSections = SECTIONS.filter((s) => s.week === n).map((s) => s.id);
  const feedback = project.comments.filter((c) => c.role === 'mentor' && (c.target === `week:${n}` || stageSections.includes(c.target) || rest.some((f) => c.target === `field:${f.key}`)));
  const stageComments = project.comments.filter((c) => c.target === `week:${n}`);
  const signoff = w.checkpoint ? project.signoffs[w.checkpoint.id] : undefined;
  const setStatus = (s: WeekStatus) => update((p) => void (p.weekStatus[n] = s));

  const exportStage = async () => {
    const { exportWeekly } = await import('@/lib/docx');
    try {
      await exportWeekly(project, n);
      update((p) => p.exports.push({ kind: `stage${n}`, at: new Date().toISOString() }));
    } catch {
      toast('Export failed — your work is safe. Try again.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-[960px] px-[var(--gutter)] py-4">
      <nav aria-label="Stages" className="scroll-x-chips mb-3">
        {WEEKS.map((x) => {
          const st = weekStatus(project, x.n);
          const t = TONE_CLASSES[x.tone];
          const cur = x.n === n;
          return (
            <Link key={x.n} to={`/p/${project.id}/stage/${x.n}`} aria-current={cur ? 'page' : undefined} className={`chip !min-h-[42px] ${cur ? `!border-transparent ${t.soft} font-bold ${t.text}` : ''}`}>
              {st === 'completed' ? <CheckCircle2 size={16} aria-hidden /> : <span className={`h-2.5 w-2.5 rounded-full ${t.bg}`} aria-hidden />}
              {x.n}. {x.short}
            </Link>
          );
        })}
      </nav>

      <header className={`rounded-card px-4 py-4 sm:px-5 ${tone.soft}`}>
        <p className={`text-[0.9375rem] font-bold uppercase tracking-[0.08em] ${tone.text}`}>Stage {n} of {WEEKS.length}</p>
        <h1 className="mt-0.5 text-[1.75rem] leading-tight">{w.title}</h1>
        <p className="mt-1 text-[1.1875rem]">{w.goal}</p>
        <ol className="mt-3 flex flex-wrap gap-2">
          {w.instructions.map((i, k) => (
            <li key={i} className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[1rem]">
              <span className={`grid h-6 w-6 place-items-center rounded-full text-[0.8125rem] font-bold ${tone.bg} text-ink`}>{k + 1}</span>
              {i}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[0.9375rem] text-slate">
          {done}/{reqs.length} decisions made · {WEEK_STATUS_LABEL[status]}
        </p>
      </header>

      <div className="mt-4 grid gap-4">
        {n === 3 && (
          <section aria-label="Theory guide" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {THEORY_GUIDE.map((g) => (
              <div key={g.t} className="rounded-xl border border-line bg-surface p-3">
                <p className="text-[1.0625rem] font-semibold">{g.t}</p>
                <p className="text-[0.9375rem] text-slate">{g.w}</p>
              </div>
            ))}
          </section>
        )}
        {n === 4 && (
          <section aria-label="Design guide" className="card overflow-hidden">
            <table className="w-full text-left text-[1rem]">
              <thead className="bg-surface-2"><tr><th className="px-3 py-2">Your question</th><th className="px-3 py-2">Fitting designs</th></tr></thead>
              <tbody>
                {DESIGN_GUIDE.map((g) => (
                  <tr key={g.q} className="border-t border-line"><td className="px-3 py-2 font-semibold">{g.q}</td><td className="px-3 py-2">{g.d}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <section className="card p-4 sm:p-5" aria-labelledby="draft-h">
          <h2 id="draft-h" className="text-[1.375rem]">Your decisions</h2>
          {story.length > 0 && (
            <details className={`mt-3 rounded-xl border border-line p-3 ${tone.soft}`} open={!fields.some((f) => f.key === 'problem' && fv(project, 'problem'))}>
              <summary className="cursor-pointer text-[1.0625rem] font-semibold">Start with a story (optional)</summary>
              <div className="mt-2 grid gap-3">
                {story.map((f) => (
                  <FieldEditor key={f.key} project={project} update={update} def={f} />
                ))}
              </div>
            </details>
          )}
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {core.map((f) => (
              <div key={f.key} className={f.kind === 'long' ? 'md:col-span-2' : ''}>
                <FieldEditor project={project} update={update} def={f} />
              </div>
            ))}
          </div>
          {optional.length > 0 && (
            <div className="mt-4">
              <button type="button" className="btn btn-ghost btn-sm" aria-expanded={more} onClick={() => setMore((m) => !m)}>
                {more ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />} {more ? 'Fewer details' : `More details (${optional.length})`}
              </button>
              {more && (
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  {optional.map((f) => (
                    <div key={f.key} className={f.kind === 'long' ? 'md:col-span-2' : ''}>
                      <FieldEditor project={project} update={update} def={f} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {n === 2 && <SearchBuilder />}
          {n === 2 && <EvidenceSummary />}
          {n === 6 && <TrainingLinks />}
          {n === 6 && <PlanningLists />}
          {n === 7 && <DisseminationList />}
          {n === 7 && (
            <Link to={`/p/${project.id}/proposal`} className="btn btn-primary mt-4">
              <FileText size={20} aria-hidden /> Open the protocol &amp; export
            </Link>
          )}
        </section>

        {reqs.length > 0 && (
          <section className="card p-4" aria-labelledby="check-h">
            <h2 id="check-h" className="text-[1.25rem]">Checklist</h2>
            <ul className="mt-2 grid gap-1 sm:grid-cols-2">
              {reqs.map((r) => {
                const manual = w.checklist.some((c) => c.id === r.id);
                return (
                  <li key={r.id}>
                    {manual ? (
                      <label className="flex min-h-[44px] cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1.5 text-[1.0625rem] hover:bg-sage">
                        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--btn-primary)]" checked={!!project.checks[r.id]} onChange={(e) => update((p) => void (p.checks[r.id] = e.target.checked))} />
                        <span>{r.label}</span>
                      </label>
                    ) : (
                      <p className="flex min-h-[44px] items-start gap-2.5 px-1.5 py-1.5 text-[1.0625rem]">
                        {r.done ? <CheckCircle2 size={22} className="shrink-0 text-ok" aria-hidden /> : <Circle size={22} className="shrink-0 text-slate" aria-hidden />}
                        <span>{r.label}<span className="sr-only">{r.done ? ' (done)' : ' (not done)'}</span></span>
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <AiOptional actions={w.actions} onPick={(prompt) => navigate(`/p/${project.id}/mentor`, { state: { prompt } })} />

        {(feedback.length > 0 || signoff) && (
          <section className="card border-terra-ui p-4" aria-labelledby="fb-h">
            <h2 id="fb-h" className="flex items-center gap-1.5 text-[1.25rem]"><MessageSquare size={20} className="text-terra" aria-hidden /> Faculty feedback</h2>
            {signoff && (
              <p className="mt-1.5 text-[1.0625rem]">
                <ShieldCheck size={18} className="mr-1 inline text-ok" aria-hidden />
                {w.checkpoint!.label}: <strong>{signoff.status === 'ready' ? 'Ready' : signoff.status === 'revise' ? 'Needs revision' : 'Pending'}</strong> — {signoff.by}{signoff.note && `: ${signoff.note}`}
              </p>
            )}
            <ul className="mt-2 space-y-1.5">
              {feedback.map((c) => (
                <li key={c.id} className={`rounded-lg px-3 py-2 text-[1.0625rem] ${c.resolved ? 'bg-sage text-slate line-through' : 'bg-terra-soft'}`}><strong>{c.author}</strong>: {c.text}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {n > 1 && <Link to={`/p/${project.id}/stage/${n - 1}`} className="btn btn-secondary"><ArrowLeft size={18} aria-hidden /> Stage {n - 1}</Link>}
          {n < WEEKS.length && <Link to={`/p/${project.id}/stage/${n + 1}`} className="btn btn-primary">Stage {n + 1}: {WEEKS[n].short} <ArrowRight size={18} aria-hidden /></Link>}
          <span className="flex-1" />
          <button type="button" className="btn btn-ghost btn-sm" onClick={exportStage}><Download size={18} aria-hidden /> Export stage</button>
          {role === 'resident' && status !== 'ready' && status !== 'completed' && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setStatus('ready'); toast('Marked ready for review'); }}><Send size={18} aria-hidden /> Ready for review</button>
          )}
          {status === 'ready' && role === 'resident' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus('in_progress')}>Withdraw from review</button>}
          {role === 'mentor' && (
            <label className="flex items-center gap-2 text-[1rem]">Status
              <select className="input !min-h-[40px] !w-auto !py-0.5" value={status} onChange={(e) => setStatus(e.target.value as WeekStatus)}>
                {Object.entries(WEEK_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
          )}
        </div>

        <details className="card p-4">
          <summary className="cursor-pointer text-[1.0625rem] font-semibold">Notes on this stage ({stageComments.length})</summary>
          <CommentThread
            comments={stageComments}
            open
            showResolved
            label={`Stage ${n}`}
            placeholder={role === 'mentor' ? 'Feedback…' : 'Question or note for your mentor…'}
            onAdd={(t) => update((p) => addComment(p, `week:${n}`, t, role, role === 'mentor' ? mentorName || 'Mentor' : p.resident || 'Resident'))}
            onResolve={(id) => update((p) => resolveComment(p, id))}
          />
        </details>
      </div>
    </div>
  );
}

/** Optional AI prompts — always labeled as optional and as using paid credits. */
export function AiOptional({ actions, onPick, title = 'Optional AI help' }: { actions: { label: string; prompt: string }[]; onPick: (prompt: string) => void; title?: string }) {
  return (
    <section className="rounded-card border border-dashed border-line-strong bg-surface-2 p-4" aria-label={title}>
      <p className="flex flex-wrap items-center gap-2 text-[1.0625rem] font-semibold">
        <Sparkles size={18} className="text-teal" aria-hidden /> {title}
        <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-[0.8125rem] font-semibold text-warn">Uses paid API credits</span>
      </p>
      <p className="mt-1 text-[0.9375rem] text-slate">Not required. Everything here works without AI.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {actions.map((a) => (
          <button key={a.label} type="button" className="chip" onClick={() => onPick(a.prompt)}>{a.label}</button>
        ))}
      </div>
    </section>
  );
}

function SearchBuilder() {
  const { project, update } = useProjectCtx();
  const query = useMemo(() => {
    const blocks = project.lists.concepts
      .filter((c) => c.terms.trim())
      .map((c) => {
        const terms = c.terms
          .split(/[,;\n]/)
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t) => (/\[.+\]$/.test(t) ? t : /\s/.test(t) ? `"${t}"[tiab]` : `${t}[tiab]`));
        return terms.length > 1 ? `(${terms.join(' OR ')})` : terms[0];
      });
    return blocks.join(' AND ');
  }, [project.lists.concepts]);
  return (
    <div className="mt-3 rounded-xl border border-line bg-w2-soft p-3">
      <h3 className="text-[1.0625rem] font-semibold">Search strategy</h3>
      <p className="text-[0.9375rem] text-slate">One row per concept from your question. List synonyms and MeSH terms, separated by commas (add [mh] for MeSH, e.g. Hypertension, Pregnancy-Induced[mh]).</p>
      <div className="mt-2">
        <ListEditor
          caption="Search concepts"
          rows={project.lists.concepts}
          columns={[
            { key: 'name', label: 'Concept', width: '30%', placeholder: 'e.g. Postpartum' },
            { key: 'terms', label: 'Keywords, synonyms, MeSH', placeholder: 'postpartum, puerperium, Postpartum Period[mh]' }
          ]}
          empty={{ name: '', terms: '' }}
          addLabel="Add concept"
          onChange={(rows) => update((p) => void (p.lists.concepts = rows))}
        />
      </div>
      {query && (
        <div className="mt-3">
          <p className="text-[0.9375rem] font-semibold">PubMed search string</p>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-surface p-2.5 text-[0.9375rem]">{query}</pre>
          <a className="btn btn-secondary btn-sm mt-2" href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer">
            Run in PubMed <ExternalLink size={14} aria-hidden />
          </a>
        </div>
      )}
      <h3 className="mt-4 text-[1.0625rem] font-semibold">Search log</h3>
      <div className="mt-2">
        <ListEditor
          caption="Search log"
          rows={project.lists.searchLog}
          columns={[
            { key: 'date', label: 'Date', type: 'date', width: '130px' },
            { key: 'db', label: 'Database', width: '120px', placeholder: 'PubMed' },
            { key: 'string', label: 'Search string' },
            { key: 'filters', label: 'Filters', width: '120px' },
            { key: 'hits', label: 'Hits', width: '70px' },
            { key: 'kept', label: 'Kept', width: '70px' }
          ]}
          empty={{ date: new Date().toISOString().slice(0, 10), db: 'PubMed', string: query, filters: '', hits: '', kept: '' }}
          addLabel="Log a search"
          onChange={(rows) => update((p) => void (p.lists.searchLog = rows))}
        />
      </div>
    </div>
  );
}

function EvidenceSummary() {
  const { project } = useProjectCtx();
  const inc = project.sources.filter((s) => s.include);
  const oa = inc.filter((s) => isOpen(s.access)).length;
  return (
    <div className="mt-4 rounded-xl border border-w2 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-[1.0625rem] font-semibold">
          <BookOpen size={16} className="text-w2-text" aria-hidden /> Annotated bibliography ({inc.length})
        </h3>
        <Link to={`/p/${project.id}/evidence`} className="btn btn-secondary btn-sm">
          Open Evidence Library
        </Link>
      </div>
      {inc.length === 0 ? (
        <p className="mt-1 text-[1rem] text-slate">Add sources by DOI, PMID or PubMed search in the Evidence Library; each one is checked against Crossref, PubMed and Europe PMC.</p>
      ) : (
        <>
          <p className="mt-1 text-[0.9375rem] text-slate">{oa} of {inc.length} open access</p>
          <ul className="mt-2 space-y-1 text-[1rem]">
            {inc.map((s, i) => (
              <li key={s.id}>
                [{i + 1}] {s.title ?? s.input} <span className="text-slate">· {STATUS_LABEL[s.verification.status]}{s.annotation.readFullText ? ' · read' : ''}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function TrainingLinks() {
  return (
    <div className="mt-3 rounded-xl border border-w4 bg-w4-soft p-3 text-[1rem]">
      <h3 className="text-[1.0625rem] font-semibold">Human subjects research training</h3>
      <p className="mt-1">Take the course your IRB requires — usually the CITI Program (free through an institutional subscription). If your IRB accepts it, the free HHS course works too.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <a className="btn btn-secondary btn-sm" href="https://about.citiprogram.org/" target="_blank" rel="noopener noreferrer">
          CITI Program <ExternalLink size={14} aria-hidden />
        </a>
        <a className="btn btn-secondary btn-sm" href="https://www.hhs.gov/ohrp/education-and-outreach/human-research-protection-training/index.html" target="_blank" rel="noopener noreferrer">
          OHRP free training <ExternalLink size={14} aria-hidden />
        </a>
      </div>
    </div>
  );
}

function PlanningLists() {
  const { project, update } = useProjectCtx();
  const total = project.lists.budget.reduce((s, b) => s + (Number(b.qty) || 0) * (Number(String(b.unit).replace(/[$,]/g, '')) || 0), 0);
  return (
    <div className="mt-4 space-y-5">
      <div>
        <h3 className="text-[1.0625rem] font-semibold">Team and collaborators</h3>
        <div className="mt-2">
          <ListEditor caption="Team" rows={project.lists.team} columns={[{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role (mentor, statistician, nursing lead…)' }, { key: 'contact', label: 'Contact / notes' }]} empty={{ name: '', role: '', contact: '' }} addLabel="Add person" onChange={(rows) => update((p) => void (p.lists.team = rows))} />
        </div>
      </div>
      <div>
        <h3 className="text-[1.0625rem] font-semibold">Preliminary budget</h3>
        <p className="text-[0.9375rem] text-slate">Mark estimates as estimates. Don’t guess prices you can look up.</p>
        <div className="mt-2">
          <ListEditor caption="Budget" rows={project.lists.budget} columns={[{ key: 'item', label: 'Expense' }, { key: 'qty', label: 'Qty', width: '80px' }, { key: 'unit', label: 'Unit cost ($)', width: '120px' }, { key: 'source', label: 'Funding / in-kind' }]} empty={{ item: '', qty: '1', unit: '', source: '' }} addLabel="Add expense" onChange={(rows) => update((p) => void (p.lists.budget = rows))} />
        </div>
        {project.lists.budget.length > 0 && <p className="mt-1 text-[1rem] font-semibold">Estimated total: ${total.toLocaleString()}</p>}
      </div>
      <div>
        <h3 className="text-[1.0625rem] font-semibold">Timeline to graduation</h3>
        <div className="mt-2">
          <ListEditor caption="Milestones" rows={project.lists.milestones} columns={[{ key: 'name', label: 'Milestone' }, { key: 'date', label: 'Target date', type: 'date', width: '170px' }]} empty={{ name: '', date: '' }} addLabel="Add milestone" onChange={(rows) => update((p) => void (p.lists.milestones = rows))} />
        </div>
      </div>
      <div>
        <h3 className="text-[1.0625rem] font-semibold">Risks and fallbacks</h3>
        <div className="mt-2">
          <ListEditor caption="Risks" rows={project.lists.risks} columns={[{ key: 'risk', label: 'Risk' }, { key: 'fallback', label: 'Fallback' }]} empty={{ risk: '', fallback: '' }} addLabel="Add risk" onChange={(rows) => update((p) => void (p.lists.risks = rows))} />
        </div>
      </div>
      {fv(project, 'mentor.name') && <p className="text-[0.9375rem] text-slate">Optional AI tip: ask the AI mentor to draft a request to {fv(project, 'mentor.name')}.</p>}
    </div>
  );
}

function DisseminationList() {
  const { project, update } = useProjectCtx();
  return (
    <div className="mt-4">
      <h3 className="text-[1.1875rem] font-semibold">Dissemination targets</h3>
      <div className="mt-2">
        <ListEditor caption="Dissemination" rows={project.lists.dissemination} columns={[{ key: 'output', label: 'Output (abstract, poster, paper)' }, { key: 'target', label: 'Meeting / journal' }, { key: 'deadline', label: 'Verified deadline', type: 'date', width: '170px' }]} empty={{ output: '', target: '', deadline: '' }} addLabel="Add target" onChange={(rows) => update((p) => void (p.lists.dissemination = rows))} />
      </div>
    </div>
  );
}
