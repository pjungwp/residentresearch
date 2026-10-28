import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Plus, Upload, Copy, Archive, ArchiveRestore, Trash2, Lightbulb, Compass, ClipboardCheck, CheckCircle2, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { SimpleShell, useProjectCtx, PageHeader, WeekStrip } from '@/components/shell';
import { FullBlueprint, CountsBar } from '@/components/blueprint';
import { createProject, deleteProject, exportProjectJson, importProject, parseProjectJson, persist, setSettings, useProjects, useSettings, uid } from '@/lib/store';
import { checkService } from '@/lib/ai';
import { WEEKS } from '@/content/fields';
import { MASTER_PROMPT } from '@/content/masterPrompt';
import { downloadFile, formatDate } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/components/ui/Toast';
import { Segmented } from '@/components/ui/primitives';
import { slug } from './evidence';
import type { Project } from '@/lib/types';

/** "/" → resume the last active project in one step; otherwise the project list. */
export function RootRedirect() {
  const { loaded, projects } = useProjects();
  const { lastProjectId } = useSettings();
  if (!loaded) return <div className="p-8 text-slate">Loading…</div>;
  const active = projects.filter((p) => !p.archived);
  const target = active.find((p) => p.id === lastProjectId) ?? active[0];
  return <Navigate to={target ? `/p/${target.id}` : '/projects'} replace />;
}

const STARTS = [
  { id: 'explore', icon: Lightbulb, title: 'Explore an idea', text: 'Start from a clinical observation or general interest.', opener: 'I want to explore an idea. ' },
  { id: 'refine', icon: Compass, title: 'Refine an existing project', text: 'You already have a question or partial plan.', opener: 'I have an existing project I want to refine. ' },
  { id: 'critique', icon: ClipboardCheck, title: 'Critique a proposal', text: 'Get a methodological readiness review.', opener: '/critique ' }
] as const;

export function ProjectsPage() {
  usePageTitle('Projects');
  const { projects, loaded, error } = useProjects();
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [resident, setResident] = useState('');
  const [mode, setMode] = useState<Project['startMode']>('explore');
  const [showArchived, setShowArchived] = useState(false);
  const active = projects.filter((p) => !p.archived);
  const archived = projects.filter((p) => p.archived);
  const [creating, setCreating] = useState(active.length === 0);
  useEffect(() => {
    if (loaded && active.length === 0) setCreating(true);
  }, [loaded, active.length]);

  const create = async () => {
    const p = await createProject(title.trim() || 'My research project', resident.trim());
    p.startMode = mode;
    await persist(p);
    setSettings({ lastProjectId: p.id });
    navigate(`/p/${p.id}`, { state: { prompt: STARTS.find((s) => s.id === mode)!.opener } });
  };

  const save = async (p: Project, fn: (x: Project) => void) => {
    const x = structuredClone(p);
    fn(x);
    x.updatedAt = new Date().toISOString();
    await persist(x);
  };

  return (
    <SimpleShell>
      <div className="mx-auto max-w-[1000px] px-[var(--gutter)] py-6">
        <PageHeader
          title="Your research projects"
          actions={
            <>
              <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Import project file" onChange={async (e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (!f) return;
                try {
                  const p = await importProject(parseProjectJson(await f.text()), 'copy');
                  toast('Project imported');
                  navigate(`/p/${p.id}`);
                } catch (err) {
                  toast((err as Error).message, 'error');
                }
              }} />
              <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}><Upload size={15} aria-hidden /> Import</button>
              {!creating && <button className="btn btn-primary btn-sm" onClick={() => setCreating(true)}><Plus size={15} aria-hidden /> New project</button>}
            </>
          }
        >
          Projects are stored in this browser. Export a backup to move between devices.
        </PageHeader>
        {error && <p className="mt-3 rounded-lg bg-err-soft p-3 text-[14px] text-err" role="alert">{error}</p>}

        {creating && (
          <section className="card mt-4 overflow-hidden" aria-labelledby="new-h">
            <div className="h-1.5 bg-[linear-gradient(90deg,var(--w1),var(--w2),var(--w3),var(--w4),var(--w5))]" aria-hidden />
            <div className="p-4 sm:p-5">
              <h2 id="new-h" className="text-[18px] font-bold">Start a research project</h2>
              <p className="text-[14px] text-slate">Five weeks from idea to an IRB draft. You don’t need a complete idea to begin.</p>
              <fieldset className="mt-3">
                <legend className="field-label">How would you like to start?</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3" role="radiogroup">
                  {STARTS.map((s) => (
                    <button key={s.id} type="button" role="radio" aria-checked={mode === s.id} onClick={() => setMode(s.id)} className={`rounded-xl border p-3 text-left ${mode === s.id ? 'border-teal bg-teal-soft' : 'border-line bg-surface hover:border-teal'}`}>
                      <s.icon size={20} className="text-teal" aria-hidden />
                      <span className="mt-1 block text-[14.5px] font-semibold">{s.title}</span>
                      <span className="block text-[13px] text-slate">{s.text}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="field-label">Working title (optional)</span>
                  <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Postpartum BP follow-up" />
                </label>
                <label className="block">
                  <span className="field-label">Your name (optional)</span>
                  <input className="input mt-1" value={resident} onChange={(e) => setResident(e.target.value)} placeholder="Shown on exported documents" />
                </label>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn btn-primary" onClick={create}>Open my Research Studio <ArrowRight size={17} aria-hidden /></button>
                {active.length > 0 && <button className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button>}
              </div>
            </div>
          </section>
        )}

        {!loaded ? (
          <p className="mt-6 text-slate">Loading…</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {active.map((p) => (
              <ProjectCard key={p.id} p={p} onArchive={() => save(p, (x) => void (x.archived = true))} onDuplicate={async () => {
                const copy = structuredClone(p);
                copy.id = uid('p');
                copy.title = `${p.title} (copy)`;
                copy.createdAt = copy.updatedAt = new Date().toISOString();
                await persist(copy);
                toast('Project duplicated');
              }} onRename={(t) => save(p, (x) => void (x.title = t))} onExport={() => downloadFile(`${slug(p.title)}.json`, exportProjectJson(p))} />
            ))}
          </ul>
        )}

        {archived.length > 0 && (
          <div className="mt-6">
            <button className="text-[14px] font-semibold text-teal" onClick={() => setShowArchived((s) => !s)} aria-expanded={showArchived}>
              {showArchived ? 'Hide' : 'Show'} archived ({archived.length})
            </button>
            {showArchived && (
              <ul className="mt-2 space-y-2">
                {archived.map((p) => (
                  <li key={p.id} className="card flex flex-wrap items-center gap-2 p-3">
                    <span className="min-w-0 flex-1 truncate text-[14.5px]">{p.title}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => save(p, (x) => void (x.archived = false))}><ArchiveRestore size={15} aria-hidden /> Restore</button>
                    <button className="btn btn-ghost btn-sm !text-err" onClick={() => { if (window.confirm(`Permanently delete “${p.title}” from this device? Export a backup first if you might need it.`)) void deleteProject(p.id); }}><Trash2 size={15} aria-hidden /> Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </SimpleShell>
  );
}

function ProjectCard({ p, onArchive, onDuplicate, onRename, onExport }: { p: Project; onArchive: () => void; onDuplicate: () => void; onRename: (t: string) => void; onExport: () => void }) {
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState(p.title);
  return (
    <li className="card flex flex-col p-4">
      {editing ? (
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (t.trim()) onRename(t.trim()); setEditing(false); }}>
          <label className="sr-only" htmlFor={`rn-${p.id}`}>Project title</label>
          <input id={`rn-${p.id}`} className="input" value={t} onChange={(e) => setT(e.target.value)} autoFocus />
          <button className="btn btn-primary btn-sm">Save</button>
        </form>
      ) : (
        <Link to={`/p/${p.id}`} className="text-[16px] font-bold text-ink no-underline hover:underline">{p.title}</Link>
      )}
      <p className="mt-0.5 text-[13px] text-slate">Week {p.currentWeek} · {WEEKS[p.currentWeek - 1].title} · updated {formatDate(p.updatedAt)}</p>
      <div className="mt-2"><WeekStrip project={p} interactive={false} /></div>
      <div className="mt-2"><CountsBar project={p} /></div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Link to={`/p/${p.id}`} className="btn btn-primary btn-sm">Continue</Link>
        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Rename</button>
        <button className="btn btn-ghost btn-sm" onClick={onDuplicate}><Copy size={14} aria-hidden /> Duplicate</button>
        <button className="btn btn-ghost btn-sm" onClick={onExport}>Export</button>
        <button className="btn btn-ghost btn-sm" onClick={onArchive}><Archive size={14} aria-hidden /> Archive</button>
      </div>
    </li>
  );
}

export function BlueprintPage() {
  const { project, update } = useProjectCtx();
  usePageTitle(`Blueprint · ${project.title}`);
  return (
    <div className="mx-auto max-w-[1100px] px-[var(--gutter)] py-4">
      <PageHeader eyebrow="Source of truth" title="Research Blueprint">
        Every decision in one place. Edit directly; AI suggestions only land here when you accept them.
      </PageHeader>
      <div className="mt-3 card p-3"><CountsBar project={project} /></div>
      <nav aria-label="Blueprint sections" className="scroll-x-chips mt-3">
        {['problem', 'question', 'gap', 'design', 'outcomes', 'analysis', 'mentors', 'logistics', 'feasibility', 'dissemination', 'ethics', 'references'].map((id, i) => (
          <a key={id} href={`#s-${id}`} className="chip !min-h-[34px] text-[13px]">{i + 1}</a>
        ))}
      </nav>
      <div className="mt-3">
        <FullBlueprint project={project} update={update} />
      </div>
    </div>
  );
}

export function SettingsPage() {
  usePageTitle('Settings');
  const s = useSettings();
  const toast = useToast();
  const [svc, setSvc] = useState<Awaited<ReturnType<typeof checkService>> | null>(null);
  const [checking, setChecking] = useState(false);
  const { projects } = useProjects();
  const check = async () => {
    setChecking(true);
    setSvc(await checkService());
    setChecking(false);
  };
  useEffect(() => {
    void check();
  }, []);
  return (
    <SimpleShell>
      <div className="mx-auto max-w-[760px] space-y-4 px-[var(--gutter)] py-6">
        <PageHeader title="Settings" />
        <section className="card space-y-4 p-4">
          <h2 className="text-[16px] font-bold">You</h2>
          <Segmented name="role" label="I am using Research Forge as" value={s.role} onChange={(v) => setSettings({ role: v })} options={[{ value: 'resident', label: 'Resident' }, { value: 'mentor', label: 'Faculty mentor' }]} />
          {s.role === 'mentor' && (
            <label className="block">
              <span className="field-label">Mentor name (shown on comments and sign-offs)</span>
              <input className="input mt-1" value={s.mentorName} onChange={(e) => setSettings({ mentorName: e.target.value })} />
            </label>
          )}
          <Segmented name="theme" label="Appearance" value={s.theme} onChange={(v) => setSettings({ theme: v })} options={[{ value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} />
        </section>

        <section className="card space-y-3 p-4">
          <h2 className="text-[16px] font-bold">AI mentor (Claude)</h2>
          <div className="flex flex-wrap items-center gap-2 text-[14px]">
            {checking ? (
              <span className="flex items-center gap-1.5 text-slate"><Loader2 size={15} className="animate-spin" aria-hidden /> Checking service…</span>
            ) : svc?.ok && svc.configured ? (
              <span className="flex items-center gap-1.5 text-ok"><CheckCircle2 size={16} aria-hidden /> Connected{svc.model ? ` · ${svc.model}` : ''}</span>
            ) : (
              <span className="flex items-center gap-1.5 text-warn"><AlertTriangle size={16} aria-hidden /> {svc?.ok ? 'Server is missing its Claude API key.' : svc?.message ?? 'Not available'}</span>
            )}
            <button className="btn btn-ghost btn-sm" onClick={check}>Check again</button>
          </div>
          {(svc?.needsCode ?? true) && (
            <label className="block">
              <span className="field-label">Program access code</span>
              <span className="field-hint">From your program director. Stored only in this browser.</span>
              <input className="input mt-1" type="password" autoComplete="off" value={s.accessCode} onChange={(e) => setSettings({ accessCode: e.target.value })} />
            </label>
          )}
          <p className="text-[13px] text-slate">Everything except the AI mentor works without this. The Claude API key lives on the server and is never stored in your browser or in exports.</p>
          {s.aiNoticeAccepted && <button className="btn btn-ghost btn-sm" onClick={() => setSettings({ aiNoticeAccepted: false })}>Show the AI notice again</button>}
        </section>

        <section className="card space-y-3 p-4">
          <h2 className="text-[16px] font-bold">Citation checks</h2>
          <label className="block">
            <span className="field-label">Email for open-access lookups (Unpaywall)</span>
            <span className="field-hint">Unpaywall asks callers to identify themselves by email. It is sent only with open-access lookups.</span>
            <input className="input mt-1" type="email" value={s.email} onChange={(e) => setSettings({ email: e.target.value })} placeholder="you@hospital.org" />
          </label>
        </section>

        <section className="card space-y-3 p-4">
          <h2 className="text-[16px] font-bold">Your data</h2>
          <p className="text-[14px]">{projects.length} project{projects.length === 1 ? '' : 's'} stored in this browser (IndexedDB). Nothing syncs between devices.</p>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => { downloadFile(`research-forge-all-projects-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(projects.map((p) => JSON.parse(exportProjectJson(p))), null, 2)); toast('All projects exported'); }}>Export all projects</button>
            <button className="btn btn-danger btn-sm" onClick={async () => { if (!window.confirm('Delete ALL projects from this browser? This cannot be undone.')) return; for (const p of projects) await deleteProject(p.id); toast('All projects deleted'); }}>Delete all data</button>
          </div>
        </section>

        <details className="card p-4">
          <summary className="cursor-pointer text-[15px] font-bold">View the AI mentor’s instructions (Master Prompt v2.0)</summary>
          <pre className="mt-3 max-h-[50vh] overflow-auto whitespace-pre-wrap text-[12.5px]">{MASTER_PROMPT}</pre>
        </details>
      </div>
    </SimpleShell>
  );
}

export function AboutPage() {
  usePageTitle('About');
  return (
    <SimpleShell>
      <div className="mx-auto max-w-[760px] space-y-4 px-[var(--gutter)] py-6 text-[15px] leading-relaxed">
        <PageHeader eyebrow="MedEd Forge" title="About Research Forge" />
        <p>Research Forge helps residents turn a clinical question into an IRB-ready draft over five weeks: research story and question, literature and evidence gap, study design and assessment, mentorship and feasibility, and the protocol. It is built on the Resident Research Project Concierge Master Prompt (v2.0).</p>
        <h2 className="text-[17px] font-bold">What the AI does — and doesn’t</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Claude acts as a research mentor: it explains, questions and proposes. You decide. Nothing enters your Blueprint until you accept it.</li>
          <li>Citations are verified against Crossref, PubMed and Europe PMC by the app, never by the AI. Open-access copies come from PubMed Central, Europe PMC and Unpaywall.</li>
          <li>The app does not submit anything to an IRB and never represents a study as approved. Faculty review is not IRB approval.</li>
        </ul>
        <h2 className="text-[17px] font-bold">Privacy</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Projects are stored only in your browser. There are no accounts and no cloud copy. Export backups.</li>
          <li>When you use the AI mentor, your messages and a compact summary of your Blueprint are sent through the program’s server to Claude (Anthropic) to generate a reply.</li>
          <li>Citation lookups send identifiers (DOI, PMID) to public scholarly indexes; open-access lookups include the email you set.</li>
          <li>Do not enter PHI or identifiable trainee evaluations.</li>
        </ul>
        <p className="text-[13.5px] text-slate">Not a substitute for your faculty mentor, a biostatistician, a medical librarian or your IRB.</p>
        <Link to="/projects" className="btn btn-primary">Go to my projects</Link>
      </div>
    </SimpleShell>
  );
}
