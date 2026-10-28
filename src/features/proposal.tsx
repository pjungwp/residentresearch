import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Pencil, RotateCcw, Check, Download, Printer, FileJson, Upload, Eye, ListTree, FileText, ClipboardList, Loader2 } from 'lucide-react';
import { useProjectCtx, PageHeader } from '@/components/shell';
import { buildProposal, DRAFT_LABEL, hash, type DocSection } from '@/lib/document';
import { exportProjectJson, parseProjectJson, importProject } from '@/lib/store';
import { fieldByKey } from '@/content/fields';
import { downloadFile } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/components/ui/Toast';
import { slug } from './evidence';
import { useNavigate } from 'react-router-dom';

const ISSUE_TEXT = { unknown: 'not yet defined', proposed: 'proposed, not confirmed', verify: 'needs verification', confirmed: '', flag: 'recheck after question change' } as const;

export function ProposalPage() {
  const { project, update } = useProjectCtx();
  usePageTitle(`Proposal · ${project.title}`);
  const toast = useToast();
  const sections = useMemo(() => buildProposal(project), [project]);
  const [preview, setPreview] = useState(false);
  const [outline, setOutline] = useState(true);
  const [busy, setBusy] = useState('');
  const issueCount = sections.reduce((n, s) => n + s.issues.length + (s.stale ? 1 : 0), 0);

  const run = async (kind: 'protocol' | 'blueprint') => {
    setBusy(kind);
    try {
      const m = await import('@/lib/docx');
      await (kind === 'protocol' ? m.exportProtocol(project) : m.exportBlueprint(project));
      update((p) => p.exports.push({ kind, at: new Date().toISOString() }));
    } catch {
      toast('Export failed — your work is safe. Try again.', 'error');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-4">
      <PageHeader
        eyebrow="Week 5 · Proposal & IRB"
        tone="text-w5-text"
        title="Proposal editor"
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreview((v) => !v)} aria-pressed={preview}>
              {preview ? <Pencil size={15} aria-hidden /> : <Eye size={15} aria-hidden />} {preview ? 'Edit' : 'Preview'}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => run('protocol')} disabled={!!busy}>
              {busy === 'protocol' ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Download size={15} aria-hidden />} Protocol DOCX
            </button>
          </>
        }
      >
        Assembled from your Blueprint. Edit any section directly; if the Blueprint changes later you’ll be asked to reconcile.
      </PageHeader>

      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-w5 bg-w5-soft px-4 py-2.5 text-[14px]">
        <strong className="text-w5-text">{DRAFT_LABEL}</strong>
        <span className="text-slate">{issueCount ? `${issueCount} unresolved item${issueCount > 1 ? 's' : ''} flagged below` : 'No unresolved Blueprint items'}</span>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-[calc(var(--header-h)+30px)] lg:self-start">
          <button className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[13px] font-semibold uppercase tracking-wide text-slate hover:bg-sage lg:pointer-events-none" aria-expanded={outline} onClick={() => setOutline((o) => !o)}>
            <span className="flex items-center gap-1.5"><ListTree size={15} aria-hidden /> Outline</span>
          </button>
          {outline && (
            <ol className="mt-1 space-y-0.5 text-[13.5px]">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#ps-${s.id}`} className="flex items-center gap-2 rounded-md px-2 py-1 text-ink no-underline hover:bg-sage hover:no-underline">
                    <span className="w-5 text-slate">{i + 1}.</span>
                    <span className="min-w-0 flex-1 truncate">{s.title}</span>
                    {(s.issues.length > 0 || s.stale || !s.text.trim()) && <AlertTriangle size={13} className="shrink-0 text-warn" aria-label="Has unresolved items" />}
                  </a>
                </li>
              ))}
              <li>
                <a href="#export" className="mt-1 flex items-center gap-2 rounded-md px-2 py-1 font-semibold text-teal no-underline hover:bg-sage">Export & backup</a>
              </li>
            </ol>
          )}
        </aside>

        <div className="min-w-0">
          {preview ? (
            <article className="card mx-auto max-w-[820px] p-6 sm:p-10 print:border-0 print:shadow-none" aria-label="Document preview">
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-w5-text">{DRAFT_LABEL}</p>
              <h2 className="mt-2 text-[24px] font-bold">{project.title}</h2>
              <p className="text-[14px] text-slate">Preliminary research protocol · {new Date().toLocaleDateString()}</p>
              {sections.map((s, i) => (
                <section key={s.id} className="mt-6">
                  <h3 className="text-[17px] font-bold">{i + 1}. {s.title}</h3>
                  {s.text.trim() ? s.text.split(/\n{2,}/).map((b, j) => <p key={j} className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed">{b}</p>) : <p className="mt-2 text-[14px] italic text-warn">⚑ Not yet written</p>}
                  {s.issues.map((x) => <p key={x.key} className="mt-1 text-[13px] italic text-warn">⚑ {x.label}: {ISSUE_TEXT[x.status]}</p>)}
                </section>
              ))}
              <button className="btn btn-secondary no-print mt-8" onClick={() => window.print()}><Printer size={16} aria-hidden /> Print / save as PDF</button>
            </article>
          ) : (
            <div className="space-y-3">
              {sections.map((s, i) => (
                <SectionEditor key={s.id} s={s} n={i + 1} />
              ))}
            </div>
          )}
          <ExportPanel run={run} busy={busy} />
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ s, n }: { s: DocSection; n: number }) {
  const { project, update } = useProjectCtx();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(s.text);
  const save = () => {
    update((p) => {
      p.proposal[s.id] = { text, basis: hash(s.generated), editedAt: new Date().toISOString() };
    });
    setEditing(false);
  };
  const firstIssueWeek = (k: string) => fieldByKey[k]?.week ?? 2;
  return (
    <section id={`ps-${s.id}`} className="card scroll-mt-28 p-4" aria-labelledby={`psh-${s.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`psh-${s.id}`} className="text-[16px] font-bold">
          {n}. {s.title}
          {s.edited && <span className="ml-2 text-[12px] font-semibold text-slate">edited</span>}
        </h2>
        {!editing ? (
          <div className="flex gap-1.5">
            <button className="btn btn-ghost btn-sm" onClick={() => { setText(s.text); setEditing(true); }}>
              <Pencil size={14} aria-hidden /> Edit text
            </button>
            {s.edited && (
              <button className="btn btn-ghost btn-sm" onClick={() => { if (window.confirm('Discard your edits and use the Blueprint version?')) update((p) => void delete p.proposal[s.id]); }}>
                <RotateCcw size={14} aria-hidden /> Use Blueprint
              </button>
            )}
          </div>
        ) : null}
      </div>

      {s.stale && (
        <div className="mt-2 rounded-lg border border-w4 bg-warn-soft p-3 text-[13.5px]" role="status">
          <p className="flex items-center gap-1.5 font-semibold text-warn"><AlertTriangle size={15} aria-hidden /> Your Blueprint changed after you edited this section.</p>
          <p className="mt-1">Neither version was overwritten. Choose which to keep:</p>
          <details className="mt-1">
            <summary className="cursor-pointer font-semibold">See the current Blueprint version</summary>
            <p className="mt-1 whitespace-pre-wrap rounded bg-surface p-2">{s.generated || '(empty)'}</p>
          </details>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => update((p) => void delete p.proposal[s.id])}>Use Blueprint version</button>
            <button className="btn btn-secondary btn-sm" onClick={() => update((p) => void (p.proposal[s.id] = { ...p.proposal[s.id], basis: hash(s.generated) }))}>Keep my text</button>
          </div>
        </div>
      )}

      {editing ? (
        <div className="mt-2">
          <label htmlFor={`pt-${s.id}`} className="sr-only">{s.title} text</label>
          <textarea id={`pt-${s.id}`} className="input min-h-[200px] text-[15px]" value={text} onChange={(e) => setText(e.target.value)} autoFocus />
          <div className="mt-2 flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={save}><Check size={15} aria-hidden /> Save section</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
          <p className="mt-1 text-[12.5px] text-slate">Edits here don’t change your Blueprint fields. Use the Blueprint for structured decisions.</p>
        </div>
      ) : s.text.trim() ? (
        <div className="mt-2 space-y-2 text-[15px] leading-relaxed">
          {s.text.split(/\n{2,}/).map((b, i) => <p key={i} className="whitespace-pre-wrap">{b}</p>)}
        </div>
      ) : (
        <p className="mt-2 text-[14px] italic text-slate">Nothing yet — fill the related Blueprint fields or write this section.</p>
      )}

      {s.issues.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-line pt-2 text-[13px]">
          {s.issues.map((x) => (
            <li key={x.key} className="flex items-center gap-1.5 text-warn">
              <AlertTriangle size={13} aria-hidden />
              {s.id === 'references' ? (
                <Link to={`/p/${project.id}/evidence`} className="text-warn">{x.label}</Link>
              ) : (
                <Link to={`/p/${project.id}/week/${firstIssueWeek(x.key)}#f-${x.key}`} className="text-warn">{x.label}: {ISSUE_TEXT[x.status]}</Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ExportPanel({ run, busy }: { run: (k: 'protocol' | 'blueprint') => void; busy: string }) {
  const { project } = useProjectCtx();
  const toast = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [incoming, setIncoming] = useState<ReturnType<typeof parseProjectJson> | null>(null);
  return (
    <section id="export" className="card mt-6 scroll-mt-28 p-4" aria-labelledby="exp-h">
      <h2 id="exp-h" className="text-[17px] font-bold">Export & backup</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ExportCard icon={FileText} title="Preliminary protocol" text="DOCX assembled from approved Blueprint text, with unresolved items flagged.">
          <button className="btn btn-primary btn-sm" onClick={() => run('protocol')} disabled={!!busy}>Download DOCX</button>
        </ExportCard>
        <ExportCard icon={ClipboardList} title="Research Blueprint" text="Structured summary with statuses, warnings and references.">
          <button className="btn btn-secondary btn-sm" onClick={() => run('blueprint')} disabled={!!busy}>Download DOCX</button>
        </ExportCard>
        <ExportCard icon={Printer} title="PDF for review" text="Open the preview and use Print → Save as PDF.">
          <button className="btn btn-secondary btn-sm" onClick={() => { window.scrollTo({ top: 0 }); toast('Switch to Preview, then Print / save as PDF'); }}>How to</button>
        </ExportCard>
        <ExportCard icon={Download} title="Weekly assignments" text="Each week page has its own Export week button.">
          <div className="flex flex-wrap gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className="chip !min-h-[34px] text-[13px]" onClick={async () => (await import('@/lib/docx')).exportWeekly(project, n)}>
                Week {n}
              </button>
            ))}
          </div>
        </ExportCard>
        <ExportCard icon={FileJson} title="Backup / send to mentor" text="A JSON file with the whole project. Your mentor can import it, comment, and send it back.">
          <button className="btn btn-secondary btn-sm" onClick={() => downloadFile(`${slug(project.title)}-${new Date().toISOString().slice(0, 10)}.json`, exportProjectJson(project))}>Download JSON</button>
        </ExportCard>
        <ExportCard icon={Upload} title="Import a returned copy" text="Load a project file (for example, one your mentor commented on).">
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Import project file" onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            try {
              setIncoming(parseProjectJson(await f.text()));
            } catch (err) {
              toast((err as Error).message, 'error');
            }
          }} />
          <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}>Choose file</button>
        </ExportCard>
      </div>
      {incoming && (
        <div className="mt-3 rounded-lg border border-line bg-surface-2 p-3 text-[14px]" role="dialog" aria-label="Import options">
          <p>
            <strong>{incoming.title}</strong> — last changed {new Date(incoming.updatedAt).toLocaleString()}, {incoming.comments.length} comments.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {incoming.id === project.id && (
              <button className="btn btn-primary btn-sm" onClick={async () => { if (!window.confirm('Replace this project with the imported copy? Export a backup first if unsure.')) return; await importProject(incoming, 'replace'); setIncoming(null); toast('Project replaced with the imported copy'); }}>
                Replace this project
              </button>
            )}
            <button className="btn btn-secondary btn-sm" onClick={async () => { const p = await importProject(incoming, 'copy'); setIncoming(null); navigate(`/p/${p.id}`); }}>Import as a separate project</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setIncoming(null)}>Cancel</button>
          </div>
        </div>
      )}
      <p className="mt-3 text-[12.5px] text-slate">Projects live in this browser only; nothing syncs between devices or with your mentor automatically. Export regularly.</p>
    </section>
  );
}

function ExportCard({ icon: Icon, title, text, children }: { icon: typeof FileText; title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-line p-3">
      <p className="flex items-center gap-2 text-[14.5px] font-semibold"><Icon size={17} className="text-teal" aria-hidden /> {title}</p>
      <p className="flex-1 text-[13.5px] text-slate">{text}</p>
      <div>{children}</div>
    </div>
  );
}
