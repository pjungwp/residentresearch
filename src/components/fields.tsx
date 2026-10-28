import { useEffect, useId, useRef, useState } from 'react';
import { CheckCircle2, CircleDashed, HelpCircle, Sparkles, History, MessageSquare, X, Link2, AlertTriangle } from 'lucide-react';
import type { Comment, FieldStatus, Project } from '@/lib/types';
import { fieldByKey, type FieldDef } from '@/content/fields';
import { clearFlag, fstatus, fv, setField, setStatus, useSettings, uid } from '@/lib/store';
import { formatDate } from '@/lib/format';

export const STATUS_META: Record<FieldStatus, { label: string; text: string; Icon: typeof CheckCircle2 }> = {
  confirmed: { label: 'Confirmed', text: 'text-ok', Icon: CheckCircle2 },
  proposed: { label: 'Proposed', text: 'text-teal', Icon: Sparkles },
  unknown: { label: 'Unknown', text: 'text-slate', Icon: CircleDashed },
  verify: { label: 'Needs verification', text: 'text-warn', Icon: HelpCircle }
};

/** Compact status: icon + text, no heavy pill. */
export function StatusText({ status }: { status: FieldStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold ${m.text}`}>
      <m.Icon size={13} aria-hidden /> {m.label}
    </span>
  );
}

export function StatusMenu({ project, fieldKey, onChange }: { project: Project; fieldKey: string; onChange: (s: FieldStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const status = fstatus(project, fieldKey);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', k);
    };
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="flex min-h-[32px] items-center rounded-md px-1.5 hover:bg-sage"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Status: ${STATUS_META[status].label}. Change status`}
        onClick={() => setOpen((o) => !o)}
      >
        <StatusText status={status} />
      </button>
      {open && (
        <ul id={id} role="menu" className="absolute right-0 z-30 mt-1 w-[210px] rounded-xl border border-line bg-surface p-1 shadow-lg">
          {(['confirmed', 'proposed', 'verify', 'unknown'] as FieldStatus[]).map((s) => (
            <li key={s} role="none">
              <button
                role="menuitemradio"
                aria-checked={s === status}
                type="button"
                className={`flex min-h-[40px] w-full items-center gap-2 rounded-lg px-2.5 text-left hover:bg-sage ${s === status ? 'bg-sage' : ''}`}
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
              >
                <StatusText status={s} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Update = (fn: (p: Project) => void) => void;

export function addComment(p: Project, target: string, text: string, role: 'resident' | 'mentor', author: string) {
  p.comments.push({ id: uid('c'), target, author, role, text, at: new Date().toISOString(), resolved: false });
}

/** One Blueprint field: label, status, editor, linked sources, history, comments, downstream flag. */
export function FieldEditor({ project, update, def, compact = false }: { project: Project; update: Update; def: FieldDef; compact?: boolean }) {
  const id = useId();
  const value = fv(project, def.key);
  const f = project.fields[def.key];
  const [panel, setPanel] = useState<'' | 'history' | 'refs' | 'comment'>('');
  const comments = project.comments.filter((n) => n.target === `field:${def.key}` && !n.resolved);
  const { role, mentorName } = useSettings();
  const author = role === 'mentor' ? mentorName || 'Mentor' : project.resident || 'Resident';
  const included = project.sources.filter((s) => s.include);
  const refs = f?.refs ?? [];

  const onChange = (v: string) => update((p) => setField(p, def.key, v, { origin: role === 'mentor' ? 'mentor' : 'resident' }));
  const toggle = (k: typeof panel) => setPanel((x) => (x === k ? '' : k));
  const common = {
    id,
    value,
    'aria-describedby': def.hint ? `${id}-hint` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(e.target.value)
  };

  return (
    <div className="min-w-0 scroll-mt-28" id={`f-${def.key}`} data-field={def.key}>
      <div className="flex flex-wrap items-center justify-between gap-x-2">
        <label htmlFor={id} className="field-label py-1">
          {def.label}
          {def.required && <span className="sr-only"> (required)</span>}
        </label>
        <div className="-mr-1.5 flex items-center">
          {f?.origin === 'ai' && <span className="mr-1 text-[12px] text-slate">AI-drafted</span>}
          {included.length > 0 && def.kind !== 'select' && (
            <IconBtn label={`Link sources to ${def.label}${refs.length ? `, ${refs.length} linked` : ''}`} pressed={panel === 'refs'} onClick={() => toggle('refs')} badge={refs.length}>
              <Link2 size={15} aria-hidden />
            </IconBtn>
          )}
          {(f?.history.length ?? 0) > 0 && (
            <IconBtn label={`Revision history for ${def.label}`} pressed={panel === 'history'} onClick={() => toggle('history')}>
              <History size={15} aria-hidden />
            </IconBtn>
          )}
          <IconBtn label={`Comments on ${def.label}${comments.length ? `, ${comments.length} open` : ''}`} pressed={panel === 'comment'} onClick={() => toggle('comment')} badge={comments.length} badgeTone="terra">
            <MessageSquare size={15} aria-hidden />
          </IconBtn>
          <StatusMenu project={project} fieldKey={def.key} onChange={(s) => update((p) => setStatus(p, def.key, s))} />
        </div>
      </div>
      {def.hint && !compact && (
        <span id={`${id}-hint`} className="field-hint -mt-0.5 mb-1">
          {def.hint}
        </span>
      )}
      {f?.flag && value.trim() && (
        <div className="mb-1.5 flex items-start gap-2 rounded-lg border border-w4 bg-warn-soft px-2.5 py-1.5 text-[13px]">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warn" aria-hidden />
          <span className="flex-1">{f.flag.reason}</span>
          <button type="button" className="shrink-0 text-[12.5px] font-semibold text-warn underline" onClick={() => update((p) => clearFlag(p, def.key))}>
            Still fits
          </button>
        </div>
      )}
      {def.kind === 'select' ? (
        <select {...common} className="input">
          <option value="">Choose…</option>
          {def.options!.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : def.kind === 'long' ? (
        <textarea {...common} className="input min-h-[84px]" rows={compact ? 2 : 3} placeholder={def.placeholder} />
      ) : (
        <input {...common} className="input" placeholder={def.placeholder} />
      )}
      {refs.length > 0 && panel !== 'refs' && (
        <p className="mt-1 text-[12.5px] text-slate">
          Sources: {refs.map((r) => included.findIndex((s) => s.id === r) + 1).filter((n) => n > 0).map((n) => `[${n}]`).join(' ')}
        </p>
      )}

      {panel === 'refs' && (
        <fieldset className="mt-2 rounded-lg border border-line bg-surface-2 p-2.5">
          <legend className="px-1 text-[13px] font-semibold">Supporting sources</legend>
          <ul className="max-h-48 space-y-1 overflow-y-auto">
            {included.map((s, i) => (
              <li key={s.id}>
                <label className="flex min-h-[36px] cursor-pointer items-start gap-2 rounded px-1 text-[13.5px] hover:bg-sage">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[var(--btn-primary)]"
                    checked={refs.includes(s.id)}
                    onChange={() =>
                      update((p) => {
                        const cur = p.fields[def.key] ?? { value: '', status: 'unknown', origin: 'resident', updatedAt: new Date().toISOString(), history: [] };
                        const r = new Set(cur.refs ?? []);
                        r.has(s.id) ? r.delete(s.id) : r.add(s.id);
                        p.fields[def.key] = { ...cur, refs: [...r] };
                      })
                    }
                  />
                  <span>
                    [{i + 1}] {s.title ?? s.input}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}
      {panel === 'history' && f && (
        <div className="mt-2 rounded-lg border border-line bg-surface-2 p-2.5 text-[13px]">
          <p className="mb-1 font-semibold">Earlier versions</p>
          <ul className="space-y-1.5">
            {f.history.map((h, i) => (
              <li key={i} className="flex items-start justify-between gap-2">
                <span className="min-w-0">
                  <span className="text-slate">
                    {formatDate(h.at, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · {h.origin} · {STATUS_META[h.status].label}:{' '}
                  </span>
                  {h.value.slice(0, 260)}
                  {h.value.length > 260 && '…'}
                </span>
                <button type="button" className="shrink-0 text-[12.5px] font-semibold text-teal" onClick={() => update((p) => setField(p, def.key, h.value, { origin: 'resident', status: 'confirmed' }))}>
                  Restore
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {(panel === 'comment' || comments.length > 0) && (
        <CommentThread
          comments={comments}
          open={panel === 'comment'}
          placeholder={role === 'mentor' ? 'Mentor comment…' : 'Note for your mentor…'}
          label={def.label}
          onAdd={(t) => update((p) => addComment(p, `field:${def.key}`, t, role, author))}
          onResolve={(cid) => update((p) => resolveComment(p, cid))}
          onClose={() => setPanel('')}
        />
      )}
    </div>
  );
}

export function resolveComment(p: Project, cid: string) {
  const c = p.comments.find((x) => x.id === cid);
  if (c) {
    c.resolved = !c.resolved;
    c.resolvedAt = c.resolved ? new Date().toISOString() : undefined;
  }
}

function IconBtn({ label, pressed, onClick, children, badge = 0, badgeTone = 'teal' }: { label: string; pressed: boolean; onClick: () => void; children: React.ReactNode; badge?: number; badgeTone?: 'teal' | 'terra' }) {
  return (
    <button type="button" className={`relative grid h-8 w-8 place-items-center rounded-md hover:bg-sage ${pressed ? 'bg-sage text-ink' : 'text-slate'}`} aria-label={label} aria-pressed={pressed} title={label} onClick={onClick}>
      {children}
      {badge > 0 && (
        <span className={`absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white ${badgeTone === 'terra' ? 'bg-[var(--terra-ui)]' : 'bg-primary'}`}>{badge}</span>
      )}
    </button>
  );
}

export function CommentThread({
  comments,
  open,
  placeholder,
  label,
  onAdd,
  onResolve,
  onClose,
  showResolved = false
}: {
  comments: Comment[];
  open: boolean;
  placeholder: string;
  label: string;
  onAdd: (t: string) => void;
  onResolve: (id: string) => void;
  onClose?: () => void;
  showResolved?: boolean;
}) {
  const [t, setT] = useState('');
  const id = useId();
  return (
    <div className="mt-2 space-y-1.5">
      {comments
        .filter((c) => showResolved || !c.resolved)
        .map((n) => (
          <div key={n.id} className={`flex items-start gap-2 rounded-lg px-2.5 py-2 text-[13.5px] ${n.resolved ? 'bg-sage text-slate' : n.role === 'mentor' ? 'bg-terra-soft' : 'bg-lavender'}`}>
            <MessageSquare size={14} className={`mt-0.5 shrink-0 ${n.role === 'mentor' ? 'text-terra' : 'text-teal'}`} aria-hidden />
            <p className={`min-w-0 flex-1 ${n.resolved ? 'line-through' : ''}`}>
              <span className="font-semibold">{n.author}</span>
              <span className="text-slate"> · {n.role === 'mentor' ? 'Mentor' : 'Resident'} · {formatDate(n.at, { month: 'short', day: 'numeric' })}</span>
              <br />
              {n.text}
            </p>
            <button type="button" className="shrink-0 rounded px-1.5 py-1 text-[12.5px] font-semibold text-teal hover:bg-surface" onClick={() => onResolve(n.id)}>
              {n.resolved ? 'Reopen' : 'Resolve'}
            </button>
          </div>
        ))}
      {open && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!t.trim()) return;
            onAdd(t.trim());
            setT('');
          }}
        >
          <label htmlFor={id} className="sr-only">
            Comment on {label}
          </label>
          <input id={id} className="input !min-h-[40px] text-[14px]" placeholder={placeholder} value={t} onChange={(e) => setT(e.target.value)} autoFocus />
          <button className="btn btn-secondary btn-sm" type="submit">
            Add
          </button>
          {onClose && (
            <button className="grid h-10 w-10 shrink-0 place-items-center rounded-md hover:bg-sage" type="button" aria-label="Close comments" onClick={onClose}>
              <X size={16} aria-hidden />
            </button>
          )}
        </form>
      )}
    </div>
  );
}

export function FieldByKey(props: { project: Project; update: Update; k: string; compact?: boolean }) {
  const def = fieldByKey[props.k];
  if (!def) return null;
  return <FieldEditor project={props.project} update={props.update} def={def} compact={props.compact} />;
}

/** Editable table for list data. Stacks to cards below 768px. */
export function ListEditor<T extends Record<string, string>>({
  rows,
  columns,
  onChange,
  addLabel,
  empty,
  caption
}: {
  rows: T[];
  columns: { key: keyof T & string; label: string; type?: 'text' | 'date' | 'number'; width?: string; placeholder?: string }[];
  onChange: (rows: T[]) => void;
  addLabel: string;
  empty: T;
  caption: string;
}) {
  const set = (i: number, k: keyof T, v: string) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  return (
    <div className="min-w-0">
      <div className="hidden overflow-x-auto rounded-xl border border-line bg-surface md:block">
        <table className="w-full border-collapse text-[14px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="bg-sage text-left">
              {columns.map((c) => (
                <th key={c.key} scope="col" className="px-2.5 py-2 font-semibold" style={{ width: c.width }}>
                  {c.label}
                </th>
              ))}
              <th className="w-10">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-3 text-slate">
                  Nothing yet.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line align-top">
                {columns.map((c) => (
                  <td key={c.key} className="px-1.5 py-1.5">
                    <input
                      aria-label={`${c.label}, row ${i + 1}`}
                      type={c.type ?? 'text'}
                      className="input !min-h-[38px] !px-2 !py-1 text-[14px]"
                      value={r[c.key] ?? ''}
                      placeholder={c.placeholder}
                      onChange={(e) => set(i, c.key, e.target.value)}
                    />
                  </td>
                ))}
                <td className="px-1 py-1.5">
                  <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-slate hover:bg-err-soft hover:text-err" aria-label={`Remove row ${i + 1}`} onClick={() => onChange(rows.filter((_, j) => j !== i))}>
                    <X size={16} aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-2 md:hidden" aria-label={caption}>
        {rows.length === 0 && <li className="text-[14px] text-slate">Nothing yet.</li>}
        {rows.map((r, i) => (
          <li key={i} className="card space-y-2 p-3">
            {columns.map((c) => (
              <label key={c.key} className="block text-[13px] font-semibold">
                {c.label}
                <input type={c.type ?? 'text'} className="input mt-1" value={r[c.key] ?? ''} placeholder={c.placeholder} onChange={(e) => set(i, c.key, e.target.value)} />
              </label>
            ))}
            <button type="button" className="btn btn-ghost btn-sm !text-err" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={() => onChange([...rows, { ...empty }])}>
        + {addLabel}
      </button>
    </div>
  );
}
