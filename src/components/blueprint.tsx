import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, BookOpen, Pencil, Check, AlertTriangle, MessageSquare } from 'lucide-react';
import { SECTIONS, TONE_CLASSES, WEEKS, type FieldDef } from '@/content/fields';
import type { Project, Readiness } from '@/lib/types';
import { fstatus, fv, setField, setStatus, useSettings } from '@/lib/store';
import { blueprintCounts, openItems, sectionFields } from '@/lib/progress';
import { StatusMenu, FieldEditor, CommentThread, addComment, resolveComment } from './fields';
import { STATUS_LABEL, amaCitation } from '@/lib/verify';

const READY_META: Record<Readiness, { label: string; cls: string }> = {
  pending: { label: 'Pending review', cls: 'text-slate' },
  revise: { label: 'Needs revision', cls: 'text-warn' },
  ready: { label: 'Ready', cls: 'text-ok' }
};

export function ReadinessText({ r }: { r: Readiness }) {
  return <span className={`text-[12.5px] font-semibold ${READY_META[r].cls}`}>Mentor: {READY_META[r].label}</span>;
}

export function CountsBar({ project }: { project: Project }) {
  const c = blueprintCounts(project);
  const seg = (n: number, color: string, label: string) => n > 0 && <span style={{ width: `${(n / c.total) * 100}%`, background: color }} className="h-full" title={`${label}: ${n}`} />;
  return (
    <div>
      <div className="flex h-2 overflow-hidden rounded-full bg-sage" aria-hidden>
        {seg(c.confirmed, 'var(--w3)', 'Confirmed')}
        {seg(c.proposed, 'var(--w1)', 'Proposed')}
        {seg(c.verify, 'var(--w4)', 'Needs verification')}
      </div>
      <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] text-slate">
        <span><strong className="text-ok">{c.confirmed}</strong> confirmed</span>
        <span><strong className="text-teal">{c.proposed}</strong> proposed</span>
        <span><strong className="text-warn">{c.verify}</strong> to verify</span>
        <span><strong className="text-ink">{c.unknown}</strong> unknown</span>
      </p>
    </div>
  );
}

/** One editable row in the Live Blueprint panel. */
function LiveField({ project, update, def }: { project: Project; update: (fn: (p: Project) => void) => void; def: FieldDef }) {
  const [editing, setEditing] = useState(false);
  const v = fv(project, def.key);
  const f = project.fields[def.key];
  const { role } = useSettings();
  return (
    <li className="rounded-lg px-1 py-1">
      <div className="flex items-center justify-between gap-1">
        <span className="min-w-0 truncate text-[12.5px] font-semibold text-slate">{def.label}</span>
        <div className="flex shrink-0 items-center">
          <StatusMenu project={project} fieldKey={def.key} onChange={(s) => update((p) => setStatus(p, def.key, s))} />
          <button type="button" className="grid h-8 w-8 place-items-center rounded-md text-slate hover:bg-sage" aria-label={editing ? `Done editing ${def.label}` : `Edit ${def.label}`} onClick={() => setEditing((e) => !e)}>
            {editing ? <Check size={15} aria-hidden /> : <Pencil size={14} aria-hidden />}
          </button>
        </div>
      </div>
      {editing ? (
        def.kind === 'select' ? (
          <select className="input mt-1 !min-h-[38px] text-[14px]" value={v} aria-label={def.label} onChange={(e) => update((p) => setField(p, def.key, e.target.value, { origin: role === 'mentor' ? 'mentor' : 'resident' }))}>
            <option value="">Choose…</option>
            {def.options!.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : (
          <textarea className="input mt-1 min-h-[72px] text-[14px]" value={v} aria-label={def.label} autoFocus onChange={(e) => update((p) => setField(p, def.key, e.target.value, { origin: role === 'mentor' ? 'mentor' : 'resident' }))} />
        )
      ) : (
        <button type="button" onClick={() => setEditing(true)} className={`mt-0.5 block w-full rounded px-0.5 text-left text-[13.5px] hover:bg-sage ${v.trim() ? 'text-ink' : 'italic text-slate'}`}>
          <span className="line-clamp-4 whitespace-pre-wrap">{v.trim() || 'Not yet defined'}</span>
        </button>
      )}
      {f?.flag && v.trim() && (
        <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-warn">
          <AlertTriangle size={12} aria-hidden /> Recheck: the question changed
        </p>
      )}
    </li>
  );
}

/** Live Blueprint for the side panel / drawer — editable, current week's sections open. */
export function LiveBlueprint({ project, update, onNavigate }: { project: Project; update: (fn: (p: Project) => void) => void; onNavigate?: () => void }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const items = openItems(project);
  return (
    <div className="space-y-3">
      <CountsBar project={project} />
      {items.length > 0 && (
        <div className="rounded-xl border border-w4 bg-warn-soft px-3 py-2 text-[13px]">
          <p className="font-semibold text-warn">{items.length} item{items.length > 1 ? 's' : ''} need attention</p>
          <ul className="mt-1 space-y-0.5">
            {items.slice(0, 4).map((i) => (
              <li key={i.key}>
                <Link to={i.key === 'sources' ? `/p/${project.id}/evidence` : `/p/${project.id}/week/${i.week}#f-${i.key}`} onClick={onNavigate} className="text-ink">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="space-y-2">
        {SECTIONS.map((s) => {
          const fs = sectionFields(project, s.id);
          const isOpen = open[s.id] ?? s.week === project.currentWeek;
          const filled = fs.filter((f) => fv(project, f.key).trim()).length;
          const tone = TONE_CLASSES[WEEKS[s.week - 1].tone];
          return (
            <li key={s.id} className="overflow-hidden rounded-xl border border-line bg-surface">
              <button type="button" className="flex w-full items-center gap-2 px-3 py-2.5 text-left" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [s.id]: !isOpen }))}>
                <span className={`h-6 w-1.5 shrink-0 rounded-full ${tone.bg}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold leading-tight">{s.title}</span>
                  <span className="text-[12px] text-slate">
                    Week {s.week}
                    {fs.length > 0 && ` · ${filled}/${fs.length} filled`}
                    {s.id === 'references' && ` · ${project.sources.filter((x) => x.include).length} sources`}
                  </span>
                </span>
                <ChevronDown size={16} className="shrink-0 text-slate transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : undefined }} aria-hidden />
              </button>
              {isOpen && (
                <div className="border-t border-line px-2 py-2">
                  {s.id === 'references' && <RefSummary project={project} onNavigate={onNavigate} />}
                  <ul className="space-y-1">
                    {fs.map((f) => (
                      <LiveField key={f.key} project={project} update={update} def={f} />
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <Link to={`/p/${project.id}/blueprint`} onClick={onNavigate} className="btn btn-secondary w-full">
        Open full Blueprint
      </Link>
    </div>
  );
}

function RefSummary({ project, onNavigate }: { project: Project; onNavigate?: () => void }) {
  const inc = project.sources.filter((s) => s.include);
  const ver = inc.filter((s) => s.verification.status === 'verified').length;
  return (
    <Link to={`/p/${project.id}/evidence`} onClick={onNavigate} className="mb-2 flex items-center gap-2 rounded-lg bg-w2-soft px-2.5 py-2 text-[13px] text-ink no-underline hover:no-underline">
      <BookOpen size={15} className="text-w2-text" aria-hidden />
      <span>
        {inc.length} sources · {ver} verified · Evidence Library
      </span>
    </Link>
  );
}

/** Full Blueprint page: every section editable, mentor readiness, section comments. */
export function FullBlueprint({ project, update }: { project: Project; update: (fn: (p: Project) => void) => void }) {
  const { role, mentorName } = useSettings();
  const author = role === 'mentor' ? mentorName || 'Mentor' : project.resident || 'Resident';
  const inc = project.sources.filter((s) => s.include);
  return (
    <div className="space-y-4">
      {SECTIONS.map((s) => {
        const fs = sectionFields(project, s.id);
        const r = project.readiness[s.id] ?? 'pending';
        const comments = project.comments.filter((n) => n.target === s.id);
        const tone = TONE_CLASSES[WEEKS[s.week - 1].tone];
        return (
          <section key={s.id} id={`s-${s.id}`} className="card scroll-mt-24 overflow-hidden" aria-labelledby={`h-${s.id}`}>
            <div className={`flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 ${tone.soft}`}>
              <div>
                <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${tone.text}`}>Week {s.week} · {s.steps}</p>
                <h2 id={`h-${s.id}`} className="text-[17px] font-bold">{s.title}</h2>
              </div>
              <ReadinessText r={r} />
            </div>
            <div className="p-4">
              {s.id === 'references' && (
                <div className="mb-4">
                  <h3 className="text-[14px] font-semibold">References ({inc.length})</h3>
                  {inc.length === 0 ? (
                    <p className="mt-1 text-[14px] text-slate">No sources yet. Add and verify them in the <Link to={`/p/${project.id}/evidence`}>Evidence Library</Link>.</p>
                  ) : (
                    <ol className="mt-1 list-decimal space-y-1 pl-5 text-[13.5px]">
                      {inc.map((x) => (
                        <li key={x.id}>
                          {amaCitation(x)} <span className="font-semibold text-slate">[{STATUS_LABEL[x.verification.status]}]</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  <OpenItemsList project={project} />
                </div>
              )}
              <div className="grid gap-4 lg:grid-cols-2">
                {fs.map((f) => (
                  <div key={f.key} className={f.kind === 'long' ? 'lg:col-span-2' : ''}>
                    <FieldEditor project={project} update={update} def={f} compact />
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-line pt-3">
                <p className="flex items-center gap-1.5 text-[13.5px] font-semibold">
                  <MessageSquare size={15} aria-hidden /> Section comments
                </p>
                <CommentThread
                  comments={comments}
                  open
                  showResolved
                  label={s.title}
                  placeholder={role === 'mentor' ? 'Mentor comment on this section…' : 'Comment or question for your mentor…'}
                  onAdd={(t) => update((p) => addComment(p, s.id, t, role, author))}
                  onResolve={(id) => update((p) => resolveComment(p, id))}
                />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function OpenItemsList({ project }: { project: Project }) {
  const items = openItems(project);
  const unknownRequired = SECTIONS.flatMap((s) => sectionFields(project, s.id)).filter((f) => f.required && fstatus(project, f.key) === 'unknown');
  if (!items.length && !unknownRequired.length) return <p className="mt-3 text-[13.5px] text-ok">No outstanding Blueprint issues.</p>;
  return (
    <div className="mt-3 rounded-lg border border-w4 bg-warn-soft p-3 text-[13.5px]">
      <p className="font-semibold text-warn">Outstanding issues</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        {items.map((i) => (
          <li key={i.key}>{i.label} ({i.status === 'flag' ? 'recheck' : i.status === 'verify' ? 'needs verification' : 'proposed'})</li>
        ))}
        {unknownRequired.map((f) => (
          <li key={f.key}>{f.label}: not yet defined</li>
        ))}
      </ul>
    </div>
  );
}
