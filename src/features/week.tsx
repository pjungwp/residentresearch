import { useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Sparkles, Download, ExternalLink, BookOpen, FileText, Send, MessageSquare, ShieldCheck } from 'lucide-react';
import { useProjectCtx, PageHeader } from '@/components/shell';
import { WEEKS, TONE_CLASSES, SECTIONS } from '@/content/fields';
import { FieldEditor, ListEditor, CommentThread, addComment, resolveComment } from '@/components/fields';
import { fieldsForWeek, weekRequirements, weekStatus, WEEK_STATUS_LABEL } from '@/lib/progress';
import { fv, useSettings } from '@/lib/store';
import { isOpen, STATUS_LABEL } from '@/lib/verify';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/components/ui/Toast';
import type { WeekStatus } from '@/lib/types';

export function WeekPage() {
  const { n: nParam } = useParams();
  const n = Math.min(Math.max(Number(nParam) || 1, 1), 5);
  const { project, update } = useProjectCtx();
  const w = WEEKS[n - 1];
  const tone = TONE_CLASSES[w.tone];
  const navigate = useNavigate();
  const toast = useToast();
  const { role, mentorName } = useSettings();
  usePageTitle(`Week ${n} · ${w.title}`);

  useEffect(() => {
    if (project.currentWeek !== n) update((p) => void (p.currentWeek = n));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const reqs = weekRequirements(project, n);
  const done = reqs.filter((r) => r.done).length;
  const status = weekStatus(project, n);
  const fields = fieldsForWeek(project, n);
  const story = fields.filter((f) => f.key.startsWith('story.'));
  const rest = fields.filter((f) => !f.key.startsWith('story.'));
  const weekSections = SECTIONS.filter((s) => s.week === n).map((s) => s.id);
  const feedback = project.comments.filter((c) => c.role === 'mentor' && (c.target === `week:${n}` || weekSections.includes(c.target) || rest.some((f) => c.target === `field:${f.key}`)));
  const weekComments = project.comments.filter((c) => c.target === `week:${n}`);
  const signoff = w.checkpoint ? project.signoffs[w.checkpoint.id] : undefined;

  const setStatus = (s: WeekStatus) => update((p) => void (p.weekStatus[n] = s));

  const exportWeek = async () => {
    const { exportWeekly } = await import('@/lib/docx');
    try {
      await exportWeekly(project, n);
      update((p) => p.exports.push({ kind: `week${n}`, at: new Date().toISOString() }));
    } catch {
      toast('Export failed — your work is safe. Try again.', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-[920px] px-[var(--gutter)] py-4">
      {/* Week switcher */}
      <nav aria-label="Weeks" className="scroll-x-chips mb-3">
        {WEEKS.map((x) => {
          const st = weekStatus(project, x.n);
          const t = TONE_CLASSES[x.tone];
          return (
            <Link
              key={x.n}
              to={`/p/${project.id}/week/${x.n}`}
              aria-current={x.n === n ? 'page' : undefined}
              className={`chip !min-h-[38px] ${x.n === n ? `!border-transparent !text-white ${t.bg}` : ''}`}
              style={x.n === n ? { background: `var(--${x.tone}-text)` } : undefined}
            >
              {st === 'completed' ? <CheckCircle2 size={14} aria-hidden /> : <span className={`h-2 w-2 rounded-full ${t.bg}`} aria-hidden />}
              {x.n}. {x.short}
            </Link>
          );
        })}
      </nav>

      <div className={`overflow-hidden rounded-xl border border-line ${tone.soft}`}>
        <div className="px-4 py-3">
          <PageHeader
            eyebrow={`Week ${n} of 5 · ${w.steps}`}
            tone={tone.text}
            title={w.title}
            actions={
              <>
                <button type="button" className="btn btn-secondary btn-sm" onClick={exportWeek}>
                  <Download size={16} aria-hidden /> Export week
                </button>
                {role === 'resident' && status !== 'ready' && status !== 'completed' && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => { setStatus('ready'); toast('Marked ready for mentor review'); }}>
                    <Send size={16} aria-hidden /> Mark ready for review
                  </button>
                )}
              </>
            }
          >
            {w.goal}
          </PageHeader>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13.5px]">
            <span>
              <strong>{WEEK_STATUS_LABEL[status]}</strong>
            </span>
            <span className="text-slate">
              {done}/{reqs.length} deliverables done
            </span>
            {role === 'mentor' && (
              <label className="flex items-center gap-2">
                Set status
                <select className="input !min-h-[34px] !w-auto !py-0.5 text-[13.5px]" value={status} onChange={(e) => setStatus(e.target.value as WeekStatus)}>
                  {Object.entries(WEEK_STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
            )}
            {status === 'ready' && role === 'resident' && (
              <button type="button" className="text-[13px] font-semibold text-teal underline" onClick={() => setStatus('in_progress')}>
                Withdraw from review
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {/* Assignment + checklist */}
        <section className="card p-4" aria-labelledby="assign-h">
          <h2 id="assign-h" className="text-[16px] font-bold">Assignment</h2>
          <ul className="mt-2 space-y-1.5 text-[15px]">
            {w.instructions.map((i) => (
              <li key={i} className="flex gap-2">
                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${tone.bg}`} aria-hidden />
                {i}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[14px]">
            <strong>Deliverable:</strong> {w.deliverable}
          </p>
          <h3 className="mt-4 text-[14px] font-semibold">Deliverable checklist</h3>
          <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
            {reqs.map((r) => {
              const manual = w.checklist.some((c) => c.id === r.id);
              return (
                <li key={r.id}>
                  {manual ? (
                    <label className="flex min-h-[40px] cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1.5 text-[14px] hover:bg-sage">
                      <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--btn-primary)]" checked={!!project.checks[r.id]} onChange={(e) => update((p) => void (p.checks[r.id] = e.target.checked))} />
                      <span>{r.label}</span>
                    </label>
                  ) : (
                    <p className="flex min-h-[40px] items-start gap-2.5 px-1.5 py-1.5 text-[14px]">
                      {r.done ? <CheckCircle2 size={20} className="shrink-0 text-ok" aria-hidden /> : <Circle size={20} className="shrink-0 text-slate" aria-hidden />}
                      <span>
                        {r.label}
                        <span className="sr-only">{r.done ? ' (done)' : ' (not done)'}</span>
                      </span>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Contextual AI guidance */}
        <section className="rounded-xl border border-w1 bg-w1-soft p-3" aria-label="AI mentor for this week">
          <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-w1-text">
            <Sparkles size={15} aria-hidden /> Ask your AI mentor
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {w.actions.map((a) => (
              <button key={a.label} type="button" className="chip !min-h-[36px] text-[13.5px]" onClick={() => navigate(`/p/${project.id}`, { state: { prompt: a.prompt } })}>
                {a.label}
              </button>
            ))}
          </div>
        </section>

        {/* Faculty feedback */}
        {(feedback.length > 0 || signoff) && (
          <section className="card border-terra-ui p-4" aria-labelledby="fb-h">
            <h2 id="fb-h" className="flex items-center gap-1.5 text-[16px] font-bold">
              <MessageSquare size={17} className="text-terra" aria-hidden /> Faculty feedback
            </h2>
            {signoff && (
              <p className="mt-1.5 text-[14px]">
                <ShieldCheck size={15} className="mr-1 inline text-ok" aria-hidden />
                Checkpoint “{w.checkpoint!.label}”: <strong>{signoff.status === 'ready' ? 'Ready' : signoff.status === 'revise' ? 'Needs revision' : 'Pending'}</strong> — {signoff.by}
                {signoff.note && `: ${signoff.note}`}
              </p>
            )}
            <ul className="mt-2 space-y-1.5">
              {feedback.map((c) => (
                <li key={c.id} className={`rounded-lg px-3 py-2 text-[14px] ${c.resolved ? 'bg-sage text-slate line-through' : 'bg-terra-soft'}`}>
                  <strong>{c.author}</strong>: {c.text}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Working draft */}
        <section className="card p-4" aria-labelledby="draft-h">
          <h2 id="draft-h" className="text-[16px] font-bold">Working draft</h2>
          <p className="text-[13.5px] text-slate">Saved automatically. Everything here feeds your Blueprint and proposal.</p>

          {story.length > 0 && (
            <div className={`mt-3 rounded-xl border border-line p-3 ${tone.soft}`}>
              <h3 className="text-[15px] font-semibold">Once Upon a Time research story</h3>
              <div className="mt-2 grid gap-3">
                {story.map((f) => (
                  <FieldEditor key={f.key} project={project} update={update} def={f} />
                ))}
              </div>
            </div>
          )}

          {n === 2 && <SearchBuilder />}
          {n === 4 && <TrainingLinks />}

          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {rest.map((f) => (
              <div key={f.key} className={f.kind === 'long' || f.key.startsWith('finer') ? (f.kind === 'long' ? 'md:col-span-2' : '') : ''}>
                <FieldEditor project={project} update={update} def={f} />
              </div>
            ))}
          </div>

          {n === 2 && <EvidenceSummary />}
          {n === 4 && <PlanningLists />}
          {n === 5 && (
            <Link to={`/p/${project.id}/proposal`} className="btn btn-primary mt-4">
              <FileText size={18} aria-hidden /> Open the Proposal & IRB editor
            </Link>
          )}
        </section>

        <section className="card p-4" aria-labelledby="wc-h">
          <h2 id="wc-h" className="text-[15px] font-semibold">Notes on this week</h2>
          <CommentThread
            comments={weekComments}
            open
            showResolved
            label={`Week ${n}`}
            placeholder={role === 'mentor' ? 'Feedback on this week…' : 'Question or note for your mentor…'}
            onAdd={(t) => update((p) => addComment(p, `week:${n}`, t, role, role === 'mentor' ? mentorName || 'Mentor' : p.resident || 'Resident'))}
            onResolve={(id) => update((p) => resolveComment(p, id))}
          />
        </section>
      </div>
    </div>
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
      <h3 className="text-[15px] font-semibold">Search strategy</h3>
      <p className="text-[13.5px] text-slate">One row per concept from your question. List synonyms and MeSH terms, separated by commas (add [mh] for MeSH, e.g. Hypertension, Pregnancy-Induced[mh]).</p>
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
          <p className="text-[13px] font-semibold">PubMed search string</p>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-surface p-2.5 text-[13px]">{query}</pre>
          <a className="btn btn-secondary btn-sm mt-2" href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer">
            Run in PubMed <ExternalLink size={14} aria-hidden />
          </a>
        </div>
      )}
      <h3 className="mt-4 text-[15px] font-semibold">Search log</h3>
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
        <h3 className="flex items-center gap-1.5 text-[15px] font-semibold">
          <BookOpen size={16} className="text-w2-text" aria-hidden /> Annotated bibliography ({inc.length})
        </h3>
        <Link to={`/p/${project.id}/evidence`} className="btn btn-secondary btn-sm">
          Open Evidence Library
        </Link>
      </div>
      {inc.length === 0 ? (
        <p className="mt-1 text-[14px] text-slate">Add sources by DOI, PMID or PubMed search in the Evidence Library; each one is checked against Crossref, PubMed and Europe PMC.</p>
      ) : (
        <>
          <p className="mt-1 text-[13.5px] text-slate">{oa} of {inc.length} open access</p>
          <ul className="mt-2 space-y-1 text-[14px]">
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
    <div className="mt-3 rounded-xl border border-w4 bg-w4-soft p-3 text-[14px]">
      <h3 className="text-[15px] font-semibold">Human subjects research training</h3>
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
        <h3 className="text-[15px] font-semibold">Team and collaborators</h3>
        <div className="mt-2">
          <ListEditor caption="Team" rows={project.lists.team} columns={[{ key: 'name', label: 'Name' }, { key: 'role', label: 'Role (mentor, statistician, nursing lead…)' }, { key: 'contact', label: 'Contact / notes' }]} empty={{ name: '', role: '', contact: '' }} addLabel="Add person" onChange={(rows) => update((p) => void (p.lists.team = rows))} />
        </div>
      </div>
      <div>
        <h3 className="text-[15px] font-semibold">Preliminary budget</h3>
        <p className="text-[13px] text-slate">Mark estimates as estimates. Don’t guess prices you can look up.</p>
        <div className="mt-2">
          <ListEditor caption="Budget" rows={project.lists.budget} columns={[{ key: 'item', label: 'Expense' }, { key: 'qty', label: 'Qty', width: '80px' }, { key: 'unit', label: 'Unit cost ($)', width: '120px' }, { key: 'source', label: 'Funding / in-kind' }]} empty={{ item: '', qty: '1', unit: '', source: '' }} addLabel="Add expense" onChange={(rows) => update((p) => void (p.lists.budget = rows))} />
        </div>
        {project.lists.budget.length > 0 && <p className="mt-1 text-[14px] font-semibold">Estimated total: ${total.toLocaleString()}</p>}
      </div>
      <div>
        <h3 className="text-[15px] font-semibold">Timeline to graduation</h3>
        <div className="mt-2">
          <ListEditor caption="Milestones" rows={project.lists.milestones} columns={[{ key: 'name', label: 'Milestone' }, { key: 'date', label: 'Target date', type: 'date', width: '170px' }]} empty={{ name: '', date: '' }} addLabel="Add milestone" onChange={(rows) => update((p) => void (p.lists.milestones = rows))} />
        </div>
      </div>
      <div>
        <h3 className="text-[15px] font-semibold">Risks and fallbacks</h3>
        <div className="mt-2">
          <ListEditor caption="Risks" rows={project.lists.risks} columns={[{ key: 'risk', label: 'Risk' }, { key: 'fallback', label: 'Fallback' }]} empty={{ risk: '', fallback: '' }} addLabel="Add risk" onChange={(rows) => update((p) => void (p.lists.risks = rows))} />
        </div>
      </div>
      <div>
        <h3 className="text-[15px] font-semibold">Dissemination targets</h3>
        <div className="mt-2">
          <ListEditor caption="Dissemination" rows={project.lists.dissemination} columns={[{ key: 'output', label: 'Output (abstract, poster, manuscript)' }, { key: 'target', label: 'Meeting / journal' }, { key: 'deadline', label: 'Verified deadline', type: 'date', width: '170px' }]} empty={{ output: '', target: '', deadline: '' }} addLabel="Add target" onChange={(rows) => update((p) => void (p.lists.dissemination = rows))} />
        </div>
      </div>
      {fv(project, 'mentor.name') && <p className="text-[13.5px] text-slate">Tip: ask the AI mentor to “Draft a mentor request” for {fv(project, 'mentor.name')}.</p>}
    </div>
  );
}
