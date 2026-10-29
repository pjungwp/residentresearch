import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ShieldCheck, AlertTriangle, MessageSquare, Flag, GraduationCap, Info } from 'lucide-react';
import { useProjectCtx, PageHeader } from '@/components/shell';
import { SECTIONS, WEEKS, TONE_CLASSES } from '@/content/fields';
import type { Readiness, Signoff } from '@/lib/types';
import { fv, setSettings, useSettings } from '@/lib/store';
import { weekProgress, weekStatus, WEEK_STATUS_LABEL, openItems, sectionFields } from '@/lib/progress';
import { StatusText, CommentThread, addComment, resolveComment } from '@/components/fields';
import { ReadinessText } from '@/components/blueprint';
import { usePageTitle } from '@/lib/usePageTitle';
import { fstatus } from '@/lib/store';

const CHECKPOINTS: { id: 'w2' | 'w4' | 'w5'; label: string; week: number; sections: string[] }[] = [
  { id: 'w2', label: 'Question & evidence gap', week: 2, sections: ['problem', 'question', 'gap'] },
  { id: 'w4', label: 'Theory, design & measurement', week: 5, sections: ['theory', 'design', 'participants', 'outcomes'] },
  { id: 'w5', label: 'Protocol readiness', week: 7, sections: ['analysis', 'ethics', 'feasibility', 'references'] }
];

export function ReviewPage() {
  const { project, update } = useProjectCtx();
  usePageTitle(`Mentor review · ${project.title}`);
  const { role, mentorName } = useSettings();
  const author = role === 'mentor' ? mentorName || 'Mentor' : project.resident || 'Resident';
  const items = openItems(project);
  const q = fv(project, 'revisedQuestion') || fv(project, 'question');

  return (
    <div className="mx-auto max-w-[1100px] px-[var(--gutter)] py-4">
      <PageHeader
        eyebrow="Faculty mentor review"
        title="Mentor Review"
        actions={
          <div className="flex rounded-full border border-line-strong bg-surface p-0.5 text-[0.9375rem] font-semibold" role="radiogroup" aria-label="View as">
            {(['resident', 'mentor'] as const).map((r) => (
              <button key={r} role="radio" aria-checked={role === r} className={`min-h-[36px] rounded-full px-3 ${role === r ? 'bg-primary text-white' : 'text-ink'}`} onClick={() => setSettings({ role: r })}>
                {r === 'mentor' ? 'Mentor view' : 'Resident view'}
              </button>
            ))}
          </div>
        }
      >
        Review the proposal itself — no need to read the AI conversation. Faculty review is not IRB approval.
      </PageHeader>

      {role === 'mentor' && !mentorName && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-line bg-surface-2 p-3 text-[1rem]">
          <Info size={16} className="mt-0.5 text-teal" aria-hidden />
          <span>
            Add your name in <Link to="/settings">Settings</Link> so comments and sign-offs show who wrote them. This is a local review workflow: send the resident your edited copy with Proposal → Export → Backup.
          </span>
        </div>
      )}

      {/* Snapshot */}
      <section className="card mt-4 p-4" aria-label="Project snapshot">
        <dl className="grid gap-x-6 gap-y-2 text-[1rem] sm:grid-cols-2">
          <div><dt className="text-slate">Resident</dt><dd className="m-0 font-semibold">{project.resident || '—'} {project.pgy && `(${project.pgy})`}</dd></div>
          <div><dt className="text-slate">Current stage</dt><dd className="m-0 font-semibold">Stage {Math.min(project.currentWeek, WEEKS.length)}: {WEEKS[Math.min(project.currentWeek, WEEKS.length) - 1].title}</dd></div>
          <div className="sm:col-span-2"><dt className="text-slate">Research question</dt><dd className="m-0 font-semibold">{q || '—'}</dd></div>
        </dl>
        <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {WEEKS.map((w) => {
            const st = weekStatus(project, w.n);
            const pr = weekProgress(project, w.n);
            const t = TONE_CLASSES[w.tone];
            return (
              <li key={w.n} className={`rounded-lg border border-line p-2.5 ${t.soft}`}>
                <Link to={`/p/${project.id}/stage/${w.n}`} className="block text-ink no-underline hover:no-underline">
                  <span className={`text-[0.8125rem] font-bold uppercase ${t.text}`}>Stage {w.n}</span>
                  <span className="block text-[0.9375rem] font-semibold leading-tight">{w.short}</span>
                  <span className="mt-1 block text-[0.875rem] text-slate">{WEEK_STATUS_LABEL[st]} · {pr.done}/{pr.total}</span>
                </Link>
              </li>
            );
          })}
        </ol>
        {items.length > 0 && (
          <div className="mt-4 rounded-lg border border-w4 bg-warn-soft p-3 text-[0.9375rem]">
            <p className="flex items-center gap-1.5 font-semibold text-warn"><Flag size={14} aria-hidden /> Outstanding issues ({items.length})</p>
            <ul className="mt-1 list-disc pl-5">{items.map((i) => <li key={i.key}>{i.label}</li>)}</ul>
          </div>
        )}
      </section>

      {/* Checkpoints */}
      <h2 className="mt-6 text-[1.25rem] font-bold">Review checkpoints</h2>
      <div className="mt-2 space-y-3">
        {CHECKPOINTS.map((c) => (
          <Checkpoint key={c.id} c={c} />
        ))}
      </div>

      {/* Capstone */}
      {project.signoffs.w5?.status === 'ready' && (
        <section className="card mt-4 flex flex-wrap items-center gap-3 border-w3 p-4">
          <GraduationCap size={22} className="text-w3-text" aria-hidden />
          <p className="min-w-0 flex-1 text-[1.0625rem]">
            {project.capstone ? <><strong>Continuing as residency capstone.</strong> Implementation tracking will come in a future version.</> : 'The IRB draft passed faculty review. The resident may continue this project as their residency capstone.'}
          </p>
          {role === 'resident' && !project.capstone && fv(project, 'decision').startsWith('Go') && (
            <button className="btn btn-primary btn-sm" onClick={() => update((p) => void (p.capstone = true))}>Continue as Capstone</button>
          )}
        </section>
      )}

      {/* All section comments */}
      <h2 className="mt-6 text-[1.25rem] font-bold">Sections</h2>
      <div className="mt-2 space-y-2">
        {SECTIONS.map((s) => {
          const r = project.readiness[s.id] ?? 'pending';
          const cs = project.comments.filter((x) => x.target === s.id || sectionFields(project, s.id).some((f) => x.target === `field:${f.key}`));
          const open = cs.filter((x) => !x.resolved).length;
          return (
            <details key={s.id} className="card overflow-hidden">
              <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
                <span className="min-w-0 flex-1 text-[1.0625rem] font-semibold">{s.title}</span>
                {open > 0 && <span className="flex items-center gap-1 text-[0.875rem] font-semibold text-terra"><MessageSquare size={13} aria-hidden /> {open} open</span>}
                <ReadinessText r={r} />
              </summary>
              <div className="border-t border-line p-4">
                <ul className="space-y-2 text-[1rem]">
                  {sectionFields(project, s.id).map((f) => (
                    <li key={f.key} className="grid grid-cols-[minmax(0,1fr)] gap-1 sm:grid-cols-[200px_minmax(0,1fr)_auto] sm:gap-3">
                      <span className="text-slate">{f.label}</span>
                      <span className="whitespace-pre-wrap">{fv(project, f.key) || <em className="text-slate">Not yet defined</em>}</span>
                      <StatusText status={fstatus(project, f.key)} />
                    </li>
                  ))}
                </ul>
                {role === 'mentor' && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label={`Readiness for ${s.title}`}>
                    <span className="text-[0.9375rem] font-semibold">Readiness:</span>
                    {(['pending', 'revise', 'ready'] as Readiness[]).map((x) => (
                      <button key={x} role="radio" aria-checked={r === x} className="chip !min-h-[34px] text-[0.9375rem]" aria-pressed={r === x} onClick={() => update((p) => void (p.readiness[s.id] = x))}>
                        {x === 'pending' ? 'Pending review' : x === 'revise' ? 'Needs revision' : 'Ready'}
                      </button>
                    ))}
                  </div>
                )}
                <CommentThread
                  comments={cs}
                  open
                  showResolved
                  label={s.title}
                  placeholder={role === 'mentor' ? 'Comment or requested revision…' : 'Reply or note…'}
                  onAdd={(t) => update((p) => addComment(p, s.id, t, role, author))}
                  onResolve={(id) => update((p) => resolveComment(p, id))}
                />
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function Checkpoint({ c }: { c: (typeof CHECKPOINTS)[number] }) {
  const { project, update } = useProjectCtx();
  const { role, mentorName } = useSettings();
  const s = project.signoffs[c.id];
  const [note, setNote] = useState(s?.note ?? '');
  const st = weekStatus(project, c.week);
  const sign = (status: Readiness) =>
    update((p) => {
      const so: Signoff = { status, by: mentorName || 'Mentor', at: new Date().toISOString(), note };
      p.signoffs[c.id] = so;
      p.weekStatus[c.week] = status === 'ready' ? 'completed' : status === 'revise' ? 'revision' : p.weekStatus[c.week];
    });
  return (
    <section className="card p-4" aria-labelledby={`cp-${c.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[0.8125rem] font-semibold uppercase tracking-wide text-slate">After stage {c.week}</p>
          <h3 id={`cp-${c.id}`} className="text-[1.125rem] font-bold">{c.label}</h3>
          <p className="text-[0.9375rem] text-slate">Stage {c.week} status: {WEEK_STATUS_LABEL[st]}</p>
        </div>
        {s ? (
          <p className={`flex items-center gap-1.5 text-[1rem] font-semibold ${s.status === 'ready' ? 'text-ok' : s.status === 'revise' ? 'text-warn' : 'text-slate'}`}>
            {s.status === 'ready' ? <ShieldCheck size={17} aria-hidden /> : <AlertTriangle size={17} aria-hidden />}
            {s.status === 'ready' ? 'Signed off' : s.status === 'revise' ? 'Revision requested' : 'Pending'} · {s.by}, {new Date(s.at).toLocaleDateString()}
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-[1rem] text-slate"><UserCheck size={16} aria-hidden /> Not yet reviewed</p>
        )}
      </div>
      {s?.note && role === 'resident' && <p className="mt-2 rounded-lg bg-terra-soft px-3 py-2 text-[1rem]">“{s.note}”</p>}
      <p className="mt-2 text-[0.9375rem]">
        Sections: {c.sections.map((id) => SECTIONS.find((x) => x.id === id)?.title).join(' · ')}
      </p>
      {role === 'mentor' && (
        <div className="mt-3">
          <label className="text-[0.9375rem] font-semibold" htmlFor={`note-${c.id}`}>Note to resident</label>
          <textarea id={`note-${c.id}`} className="input mt-1 min-h-[64px] text-[1rem]" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => sign('ready')}><ShieldCheck size={15} aria-hidden /> Sign off as ready</button>
            <button className="btn btn-secondary btn-sm" onClick={() => sign('revise')}>Request revision</button>
          </div>
        </div>
      )}
    </section>
  );
}
