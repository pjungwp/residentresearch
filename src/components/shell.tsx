import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Sparkles, BookOpen, FileText, UserCheck, Settings as Cog, PanelLeftOpen, PanelLeftClose, PanelRightOpen, PanelRightClose,
  X, Check, Loader2, AlertTriangle, WifiOff, Info, ClipboardList, MoreHorizontal, ChevronDown, FolderOpen, Search, Plus, GraduationCap, Compass, Layers
} from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import type { Project } from '@/lib/types';
import { createProject, fv, setSettings, useProject, useProjects, useSettings } from '@/lib/store';
import { LiveBlueprint } from './blueprint';
import { FIELDS, TONE_CLASSES, WEEKS } from '@/content/fields';
import { weekStatus } from '@/lib/progress';

/* ───────── project context ───────── */
interface Ctx {
  project: Project;
  update: (fn: (p: Project) => void) => void;
  openBlueprint: () => void;
}
const ProjectCtx = createContext<Ctx | null>(null);
export function useProjectCtx(): Ctx {
  const c = useContext(ProjectCtx);
  if (!c) throw new Error('useProjectCtx outside ProjectShell');
  return c;
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2 text-ink no-underline hover:no-underline" aria-label="ResearchForge home">
      <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="9" fill="#F8D9C8" />
        <circle cx="23.5" cy="8.5" r="4.5" fill="#EFA99C" />
        <path d="M10 23V9h7a4.2 4.2 0 0 1 0 8.4h-3.4" fill="none" stroke="#A6503C" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.6 17.4L22.5 23" stroke="#5D7F63" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
      {!compact && <span className="truncate font-display text-[1.3125rem] font-bold tracking-tight">ResearchForge</span>}
    </Link>
  );
}

const SIZES = [
  { id: 'md', label: 'Standard', scale: '100%' },
  { id: 'lg', label: 'Large', scale: '112.5%' },
  { id: 'xl', label: 'Larger', scale: '125%' },
  { id: 'xxl', label: 'Largest', scale: '137.5%' }
] as const;

/** "Aa" button: cycles through text sizes; applies everywhere. */
export function TextSizeButton({ className = '' }: { className?: string }) {
  const { textSize } = useSettings();
  const i = Math.max(0, SIZES.findIndex((x) => x.id === textSize));
  const next = SIZES[(i + 1) % SIZES.length];
  return (
    <button
      type="button"
      className={`flex h-11 min-w-[44px] items-center justify-center gap-0.5 rounded-xl border border-line-strong bg-surface px-2.5 font-display font-bold text-ink hover:bg-sage ${className}`}
      onClick={() => setSettings({ textSize: next.id })}
      aria-label={`Text size: ${SIZES[i].label}. Change to ${next.label}`}
      title={`Text size: ${SIZES[i].label}`}
    >
      <span className="text-[0.875rem] leading-none">A</span>
      <span className="text-[1.25rem] leading-none">A</span>
      <span className="ml-1 hidden text-[0.8125rem] font-semibold text-slate min-[420px]:inline">{SIZES[i].label}</span>
    </button>
  );
}

/** The two primary destinations. */
export function TopTabs({ className = '' }: { className?: string }) {
  const loc = useLocation();
  const inAcademy = loc.pathname.startsWith('/academy');
  const inConcierge = loc.pathname.startsWith('/concierge') || loc.pathname.startsWith('/p/');
  const tab = (active: boolean) =>
    `flex min-h-[44px] items-center gap-2 rounded-xl px-3.5 text-[1.0625rem] font-semibold no-underline hover:no-underline ${active ? 'bg-teal-soft text-teal' : 'text-ink hover:bg-sage'}`;
  return (
    <nav aria-label="Primary" className={`flex items-center gap-1 ${className}`}>
      <Link to="/academy" className={tab(inAcademy)} aria-current={inAcademy ? 'page' : undefined}>
        <GraduationCap size={20} aria-hidden /> <span>Academy</span>
      </Link>
      <Link to="/concierge" className={tab(inConcierge)} aria-current={inConcierge ? 'page' : undefined}>
        <Compass size={20} aria-hidden /> <span>Concierge</span>
      </Link>
    </nav>
  );
}

function SaveIndicator({ state }: { state: 'saved' | 'saving' | 'error' }) {
  if (state === 'saving')
    return (
      <span className="flex items-center gap-1 text-[0.875rem] text-slate" aria-live="polite">
        <Loader2 size={14} className="animate-spin" aria-hidden /> Saving
      </span>
    );
  if (state === 'error')
    return (
      <span className="flex items-center gap-1 text-[0.875rem] font-semibold text-err" role="alert">
        <AlertTriangle size={14} aria-hidden /> Not saved
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[0.875rem] text-slate" aria-live="polite">
      <Check size={14} className="text-ok" aria-hidden /> Saved
    </span>
  );
}

export function OfflineBar() {
  const [off, setOff] = useState(typeof navigator !== 'undefined' && !navigator.onLine);
  useEffect(() => {
    const a = () => setOff(false);
    const b = () => setOff(true);
    window.addEventListener('online', a);
    window.addEventListener('offline', b);
    return () => {
      window.removeEventListener('online', a);
      window.removeEventListener('offline', b);
    };
  }, []);
  if (!off) return null;
  return (
    <div role="status" className="flex items-center gap-2 bg-warn-soft px-4 py-1.5 text-[0.9375rem] text-warn">
      <WifiOff size={14} aria-hidden /> Offline. Your work still saves on this device; the AI mentor and citation checks need a connection.
    </div>
  );
}

export function UpdatePrompt() {
  const {
    needRefresh: [need, setNeed],
    updateServiceWorker
  } = useRegisterSW();
  if (!need) return null;
  return (
    <div role="status" className="fixed bottom-[calc(var(--bottom-nav-h)+var(--safe-bottom)+12px)] left-1/2 z-50 flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-line bg-surface p-3 text-[1rem] shadow-lg min-[600px]:bottom-4">
      <Info size={18} className="shrink-0 text-teal" aria-hidden />
      <p className="flex-1">A new version of ResearchForge is available.</p>
      <button className="btn btn-primary btn-sm" onClick={() => updateServiceWorker(true)}>
        Update
      </button>
      <button className="btn btn-ghost btn-sm" onClick={() => setNeed(false)}>
        Later
      </button>
    </div>
  );
}

/** Applies the theme preference to <html>. */
export function ThemeSync() {
  const { theme, textSize } = useSettings();
  useEffect(() => {
    const el = document.documentElement;
    if (theme === 'system') delete el.dataset.theme;
    else el.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', SIZES.find((x) => x.id === textSize)?.scale ?? '112.5%');
  }, [textSize]);
  return null;
}

/* ───────── thin five-part progression ───────── */
export function WeekStrip({ project, interactive = true }: { project: Project; interactive?: boolean }) {
  return (
    <ol className="flex gap-1" aria-label="Stage progress">
      {WEEKS.map((w) => {
        const st = weekStatus(project, w.n);
        const tone = TONE_CLASSES[w.tone];
        const fill = st === 'completed' ? 1 : st === 'ready' ? 0.85 : st === 'revision' ? 0.6 : st === 'in_progress' ? 0.45 : 0;
        const current = project.currentWeek === w.n;
        const label = `Stage ${w.n}: ${w.title} — ${st.replace('_', ' ')}${current ? ' (current)' : ''}`;
        const bar = (
          <span className="block h-2 overflow-hidden rounded-full bg-sage">
            <span className={`block h-full rounded-full ${tone.bg}`} style={{ width: `${fill * 100}%`, opacity: fill ? 1 : 0 }} />
          </span>
        );
        return (
          <li key={w.n} className="min-w-0 flex-1">
            {interactive ? (
              <Link to={`/p/${project.id}/stage/${w.n}`} className="block py-1.5 no-underline" aria-label={label} title={label} aria-current={current ? 'step' : undefined}>
                {bar}
              </Link>
            ) : (
              <span className="block py-1.5" title={label}>
                {bar}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ───────── quick search (Ctrl/Cmd+K) ───────── */
function QuickSearch({ project, onClose }: { project: Project; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const base = `/p/${project.id}`;
  const items = useMemo(() => {
    const all = [
      ...WEEKS.map((w) => ({ label: `Stage ${w.n}: ${w.title}`, href: `${base}/stage/${w.n}`, kind: 'Stage' })),
      { label: 'AI mentor (optional)', href: `${base}/mentor`, kind: 'View' },
      { label: 'Evidence Library', href: `${base}/evidence`, kind: 'View' },
      { label: 'Protocol editor', href: `${base}/proposal`, kind: 'View' },
      { label: 'Mentor review', href: `${base}/review`, kind: 'View' },
      { label: 'Full Blueprint', href: `${base}/blueprint`, kind: 'View' },
      ...FIELDS.filter((f) => !f.framework || true).map((f) => ({ label: `${f.label}${fv(project, f.key) ? ` — ${fv(project, f.key).slice(0, 60)}` : ''}`, href: `${base}/stage/${f.week}#f-${f.key}`, kind: 'Field' })),
      ...project.sources.map((s) => ({ label: s.title ?? s.input, href: `${base}/evidence#${s.id}`, kind: 'Source' }))
    ];
    const t = q.trim().toLowerCase();
    return (t ? all.filter((i) => i.label.toLowerCase().includes(t)) : all.slice(0, 10)).slice(0, 12);
  }, [q, project, base]);
  const go = (href: string) => {
    onClose();
    navigate(href);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[var(--overlay)] p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Search this project" onClick={onClose}>
      <div className="w-full max-w-[560px] overflow-hidden rounded-xl border border-line bg-surface shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={18} className="text-slate" aria-hidden />
          <input
            autoFocus
            className="h-12 flex-1 bg-transparent text-[1.0625rem] text-ink outline-none placeholder:text-slate"
            placeholder="Search fields, sources, stages…"
            value={q}
            aria-label="Search this project"
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, items.length - 1));
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
              if (e.key === 'Enter' && items[active]) go(items[active].href);
            }}
          />
          <kbd className="rounded border border-line px-1.5 text-[0.8125rem] text-slate">Esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-1" role="listbox" aria-label="Results">
          {items.map((i, n) => (
            <li key={i.href + n} role="option" aria-selected={n === active}>
              <button type="button" className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[1rem] ${n === active ? 'bg-sage' : 'hover:bg-sage'}`} onClick={() => go(i.href)} onMouseEnter={() => setActive(n)}>
                <span className="w-14 shrink-0 text-[0.8125rem] font-semibold uppercase tracking-wide text-slate">{i.kind}</span>
                <span className="min-w-0 truncate">{i.label}</span>
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="px-3 py-4 text-[1rem] text-slate">No matches.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ───────── project shell ───────── */
export function ProjectShell() {
  const { id } = useParams();
  const { project, update, saveState, loaded } = useProject(id);
  const settings = useSettings();
  const { projects } = useProjects();
  const [drawer, setDrawer] = useState(false);
  const [panelHidden, setPanelHidden] = useState(false);
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const width = Math.min(Math.max(settings.blueprintWidth, 300), 520);

  useEffect(() => {
    setDrawer(false);
    setMore(false);
    setMenu(false);
  }, [loc.pathname]);
  useEffect(() => {
    document.body.style.overflow = drawer || more ? 'hidden' : '';
  }, [drawer, more]);
  useEffect(() => {
    if (project && settings.lastProjectId !== project.id) setSettings({ lastProjectId: project.id });
  }, [project, settings.lastProjectId]);

  // Keyboard shortcuts: Ctrl/Cmd+K search; g then s/w/e/p/r/b to switch views.
  const gPressed = useRef(0);
  useEffect(() => {
    if (!project) return;
    const base = `/p/${project.id}`;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearch(true);
        return;
      }
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'g') {
        gPressed.current = Date.now();
        return;
      }
      if (Date.now() - gPressed.current < 1200) {
        const map: Record<string, string> = { s: `${base}/stage/${project.currentWeek}`, m: `${base}/mentor`, e: `${base}/evidence`, p: `${base}/proposal`, r: `${base}/review`, b: `${base}/blueprint` };
        if (map[e.key]) {
          e.preventDefault();
          navigate(map[e.key]);
        }
        gPressed.current = 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, navigate]);

  // Resizable Blueprint panel
  const startResize = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = width;
      const move = (ev: PointerEvent) => setSettings({ blueprintWidth: Math.min(Math.max(startW + (startX - ev.clientX), 300), 520) });
      const up = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [width]
  );

  if (!loaded) return <div className="p-8 text-slate">Loading your project…</div>;
  if (!project)
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <p className="text-[1.1875rem] font-semibold">Project not found on this device.</p>
        <p className="mt-1 text-slate">Projects are stored in this browser. Import a backup file to restore one.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/projects')}>
          Go to my projects
        </button>
      </div>
    );

  const base = `/p/${project.id}`;
  const path = loc.pathname;
  const nav = [
    { to: `${base}/stage/${project.currentWeek}`, match: `${base}/stage`, label: 'Stages', icon: Layers },
    { to: `${base}/mentor`, label: 'AI mentor', icon: Sparkles },
    { to: `${base}/evidence`, label: 'Evidence', icon: BookOpen },
    { to: `${base}/proposal`, label: 'Protocol', icon: FileText },
    { to: `${base}/review`, label: 'Review', icon: UserCheck }
  ];
  const isActive = (n: { to: string; end?: boolean; match?: string }) => (n.end ? path === n.to : path.startsWith(n.match ?? n.to));
  const panelPage = path.startsWith(`${base}/mentor`) || path.startsWith(`${base}/stage`);
  const showPanel = panelPage && !panelHidden;
  const others = projects.filter((p) => !p.archived && p.id !== project.id);

  return (
    <ProjectCtx.Provider value={{ project, update, openBlueprint: () => setDrawer(true) }}>
      <div className="flex min-h-[100dvh]">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {/* Rail */}
        <aside className={`sticky top-0 hidden h-[100dvh] shrink-0 flex-col border-r border-line bg-surface min-[600px]:flex ${settings.railExpanded ? 'w-[220px]' : 'w-[76px]'}`} aria-label="Main navigation">
          <div className={`flex h-[var(--header-h)] shrink-0 items-center border-b border-line ${settings.railExpanded ? 'px-3' : 'justify-center'}`}>
            <Logo compact={!settings.railExpanded} />
          </div>
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            {nav.map((n) => {
              const active = isActive(n);
              return (
                <Link
                  key={n.label}
                  to={n.to}
                  title={n.label}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-[1.0625rem] font-medium no-underline hover:no-underline ${active ? 'bg-teal-soft text-teal' : 'text-ink hover:bg-sage'}`}
                >
                  {active && <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r bg-primary" aria-hidden />}
                  <n.icon size={22} aria-hidden className="shrink-0" />
                  <span className={settings.railExpanded ? 'truncate' : 'sr-only'}>{n.label}</span>
                </Link>
              );
            })}
            <div className="mt-auto" />
            <Link to="/academy" title="Academy" className="flex min-h-[48px] items-center gap-3 rounded-lg px-3 text-[1rem] text-slate no-underline hover:bg-sage hover:no-underline">
              <GraduationCap size={22} aria-hidden className="shrink-0" />
              <span className={settings.railExpanded ? '' : 'sr-only'}>Academy</span>
            </Link>
            <button type="button" title="Search (Ctrl+K)" onClick={() => setSearch(true)} className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-[1rem] text-slate hover:bg-sage">
              <Search size={20} aria-hidden className="shrink-0" />
              <span className={settings.railExpanded ? '' : 'sr-only'}>Search</span>
            </button>
            <Link to="/settings" title="Settings" className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-[1rem] text-slate no-underline hover:bg-sage hover:no-underline">
              <Cog size={20} aria-hidden className="shrink-0" />
              <span className={settings.railExpanded ? '' : 'sr-only'}>Settings</span>
            </Link>
            <button
              type="button"
              className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-[1rem] text-slate hover:bg-sage"
              onClick={() => setSettings({ railExpanded: !settings.railExpanded })}
              aria-label={settings.railExpanded ? 'Collapse navigation' : 'Expand navigation'}
              aria-pressed={settings.railExpanded}
            >
              {settings.railExpanded ? <PanelLeftClose size={20} aria-hidden /> : <PanelLeftOpen size={20} aria-hidden />}
              {settings.railExpanded && <span>Collapse</span>}
            </button>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header ≤ 56px + thin progression */}
          <header className="sticky top-0 z-30 border-b border-line backdrop-blur" style={{ background: 'var(--header-bg)' }}>
            <div className="flex h-[var(--header-h)] items-center gap-2 px-[var(--gutter)]">
              <div className="min-[600px]:hidden">
                <Logo compact />
              </div>
              {/* Project menu */}
              <div className="relative min-w-0 flex-1">
                <button type="button" className="flex max-w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left hover:bg-sage" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
                  <span className="min-w-0">
                    <span className="block truncate text-[1.0625rem] font-bold leading-tight">{project.title}</span>
                    <span className="block truncate text-[0.875rem] text-slate">
                      Concierge · Stage {Math.min(project.currentWeek, WEEKS.length)} of {WEEKS.length} · {WEEKS[Math.min(project.currentWeek, WEEKS.length) - 1].short}
                      {settings.role === 'mentor' && ' · Mentor view'}
                    </span>
                  </span>
                  <ChevronDown size={16} className="shrink-0 text-slate" aria-hidden />
                </button>
                {menu && (
                  <>
                    <button className="fixed inset-0 z-30 cursor-default" aria-hidden tabIndex={-1} onClick={() => setMenu(false)} />
                    <div role="menu" className="absolute left-0 z-40 mt-1 w-[280px] rounded-xl border border-line bg-surface p-1 shadow-xl">
                      {others.length > 0 && <p className="px-3 pb-1 pt-2 text-[0.8125rem] font-semibold uppercase tracking-wide text-slate">Switch project</p>}
                      {others.slice(0, 5).map((o) => (
                        <Link key={o.id} role="menuitem" to={`/p/${o.id}`} className="block truncate rounded-lg px-3 py-2 text-[1rem] text-ink no-underline hover:bg-sage hover:no-underline">
                          {o.title}
                        </Link>
                      ))}
                      <div className="my-1 border-t border-line" />
                      <button
                        role="menuitem"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[1rem] hover:bg-sage"
                        onClick={async () => {
                          const p = await createProject('New research project', project.resident);
                          navigate(`/p/${p.id}`);
                        }}
                      >
                        <Plus size={16} aria-hidden /> New project
                      </button>
                      <Link role="menuitem" to="/concierge" className="flex items-center gap-2 rounded-lg px-3 py-2 text-[1rem] text-ink no-underline hover:bg-sage hover:no-underline">
                        <FolderOpen size={16} aria-hidden /> All projects (rename, duplicate, archive)
                      </Link>
                      <Link role="menuitem" to={`${base}/proposal#export`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[1rem] text-ink no-underline hover:bg-sage hover:no-underline">
                        <FileText size={16} aria-hidden /> Export documents / backup
                      </Link>
                    </div>
                  </>
                )}
              </div>
              <div className="hidden min-[900px]:block">
                <SaveIndicator state={saveState} />
              </div>
              <TextSizeButton />
              {panelPage && (
                <>
                  <button type="button" className="btn btn-secondary btn-sm min-[1200px]:hidden" onClick={() => setDrawer(true)} aria-haspopup="dialog">
                    <ClipboardList size={16} aria-hidden /> <span className="hidden min-[420px]:inline">Blueprint</span>
                  </button>
                  <button
                    type="button"
                    className="hidden h-10 w-10 place-items-center rounded-lg text-slate hover:bg-sage min-[1200px]:grid"
                    aria-label={panelHidden ? 'Show Live Blueprint' : 'Hide Live Blueprint'}
                    aria-pressed={!panelHidden}
                    onClick={() => setPanelHidden((h) => !h)}
                  >
                    {panelHidden ? <PanelRightOpen size={20} aria-hidden /> : <PanelRightClose size={20} aria-hidden />}
                  </button>
                </>
              )}
            </div>
            <div className="px-[var(--gutter)] pb-0.5">
              <WeekStrip project={project} />
            </div>
          </header>
          <OfflineBar />
          {saveState === 'error' && (
            <div role="alert" className="bg-err-soft px-[var(--gutter)] py-2 text-[0.9375rem] text-err">
              Your browser blocked saving. Your work is still on screen; export a backup from Proposal → Export.
            </div>
          )}

          <div className="flex min-h-0 flex-1">
            <main id="main" tabIndex={-1} className="min-w-0 flex-1 pb-[calc(var(--bottom-nav-h)+var(--safe-bottom))] min-[600px]:pb-0">
              <Outlet />
            </main>
            {showPanel && (
              <aside
                className="sticky top-[calc(var(--header-h)+18px)] hidden h-[calc(100dvh-var(--header-h)-18px)] shrink-0 border-l border-line bg-page min-[1200px]:flex"
                style={{ width }}
                aria-label="Live Research Blueprint"
              >
                <div
                  role="separator"
                  aria-orientation="vertical"
                  aria-label="Resize Blueprint panel"
                  aria-valuenow={width}
                  aria-valuemin={300}
                  aria-valuemax={520}
                  tabIndex={0}
                  onPointerDown={startResize}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowLeft') setSettings({ blueprintWidth: Math.min(width + 20, 520) });
                    if (e.key === 'ArrowRight') setSettings({ blueprintWidth: Math.max(width - 20, 300) });
                  }}
                  className="w-1.5 shrink-0 cursor-col-resize hover:bg-teal-soft focus-visible:bg-teal-soft"
                />
                <div className="min-w-0 flex-1 overflow-y-auto p-3 pl-1.5">
                  <h2 className="mb-2 text-[0.875rem] font-semibold uppercase tracking-[0.08em] text-slate">Live Research Blueprint</h2>
                  <LiveBlueprint project={project} update={update} />
                </div>
              </aside>
            )}
          </div>
        </div>

        {/* Blueprint drawer (<1200px) */}
        {drawer && (
          <div className="fixed inset-0 z-50 flex justify-end min-[1200px]:hidden" role="dialog" aria-modal="true" aria-label="Live Research Blueprint">
            <button className="absolute inset-0 bg-[var(--overlay)]" aria-label="Close Blueprint" onClick={() => setDrawer(false)} />
            <div className="relative flex h-full w-full max-w-[440px] flex-col bg-page shadow-xl">
              <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line bg-surface px-4">
                <h2 className="text-[1.125rem] font-bold">Live Research Blueprint</h2>
                <button className="grid h-11 w-11 place-items-center rounded-lg hover:bg-sage" aria-label="Close" onClick={() => setDrawer(false)} autoFocus>
                  <X size={22} aria-hidden />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 pb-[calc(16px+var(--safe-bottom))]">
                <LiveBlueprint project={project} update={update} onNavigate={() => setDrawer(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Phone: More sheet */}
        {more && (
          <div className="fixed inset-0 z-50 min-[600px]:hidden" role="dialog" aria-modal="true" aria-label="More">
            <button className="absolute inset-0 bg-[var(--overlay)]" aria-label="Close" onClick={() => setMore(false)} />
            <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-surface p-3 pb-[calc(12px+var(--safe-bottom))] shadow-xl">
              <ul className="grid grid-cols-2 gap-2">
                {[
                  { to: `${base}/evidence`, label: 'Evidence', icon: BookOpen },
                  { to: `${base}/proposal`, label: 'Protocol & export', icon: FileText },
                  { to: `${base}/review`, label: 'Review', icon: UserCheck },
                  { to: '/concierge', label: 'All projects', icon: FolderOpen },
                  { to: '/academy', label: 'Academy', icon: GraduationCap },
                  { to: '/settings', label: 'Settings', icon: Cog }
                ].map((i) => (
                  <li key={i.to}>
                    <Link to={i.to} className="flex min-h-[56px] items-center gap-2.5 rounded-xl border border-line px-3 text-[1.0625rem] font-medium text-ink no-underline hover:bg-sage hover:no-underline">
                      <i.icon size={20} className="text-teal" aria-hidden /> {i.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button type="button" onClick={() => { setMore(false); setSearch(true); }} className="flex min-h-[56px] w-full items-center gap-2.5 rounded-xl border border-line px-3 text-[1.0625rem] font-medium">
                    <Search size={20} className="text-teal" aria-hidden /> Search project
                  </button>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Phone bottom nav: Stages, Blueprint, AI mentor, More */}
        <nav aria-label="Project" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface min-[600px]:hidden" style={{ paddingBottom: 'var(--safe-bottom)' }}>
          <ul className="grid h-[var(--bottom-nav-h)] grid-cols-4">
            {[nav[0], { to: `${base}/blueprint`, label: 'Blueprint', icon: ClipboardList }, nav[1]].map((n) => {
              const active = isActive(n);
              return (
                <li key={n.label}>
                  <Link to={n.to} aria-current={active ? 'page' : undefined} className={`flex h-full flex-col items-center justify-center gap-0.5 text-[0.875rem] font-semibold no-underline hover:no-underline ${active ? 'text-teal' : 'text-slate'}`}>
                    <n.icon size={22} aria-hidden />
                    {n.label}
                  </Link>
                </li>
              );
            })}
            <li>
              <button type="button" aria-expanded={more} onClick={() => setMore(true)} className={`flex h-full w-full flex-col items-center justify-center gap-0.5 text-[0.875rem] font-semibold ${['/evidence', '/proposal', '/review'].some((s) => path.includes(s)) ? 'text-teal' : 'text-slate'}`}>
                <MoreHorizontal size={22} aria-hidden />
                More
              </button>
            </li>
          </ul>
        </nav>

        {search && <QuickSearch project={project} onClose={() => setSearch(false)} />}
      </div>
    </ProjectCtx.Provider>
  );
}

/* ───────── site shell: Home / Academy / Concierge list / Settings ───────── */
export function SimpleShell({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-line backdrop-blur" style={{ background: 'var(--header-bg)' }}>
        <div className={`mx-auto flex h-[var(--header-h)] items-center gap-2 px-[var(--gutter)] ${wide ? 'max-w-[1400px]' : 'max-w-[1200px]'}`}>
          <Logo />
          <TopTabs className="ml-4 hidden min-[900px]:flex" />
          <div className="ml-auto flex items-center gap-1.5">
            <TextSizeButton />
            <NavLink to="/settings" aria-label="Settings" title="Settings" className={({ isActive }) => `grid h-11 w-11 place-items-center rounded-xl no-underline hover:bg-sage ${isActive ? 'text-teal' : 'text-slate'}`}>
              <Cog size={22} aria-hidden />
            </NavLink>
          </div>
        </div>
        <div className="border-t border-line px-[var(--gutter)] py-1.5 min-[900px]:hidden">
          <TopTabs className="justify-center" />
        </div>
      </header>
      <OfflineBar />
      <main id="main" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-x-4 gap-y-1 px-[var(--gutter)] py-5 text-[0.9375rem] text-slate">
          <span>A planning aid — not a substitute for your mentor, statistician or IRB. No patient-identifying information.</span>
          <Link to="/about">About</Link>
        </div>
      </footer>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children, actions, tone }: { eyebrow?: string; title: string; children?: ReactNode; actions?: ReactNode; tone?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className={`text-[0.8125rem] font-semibold uppercase tracking-[0.08em] ${tone ?? 'text-slate'}`}>{eyebrow}</p>}
        <h1 className="text-[1.625rem] leading-tight min-[900px]:text-[1.875rem]">{title}</h1>
        {children && <div className="mt-1 text-[1.125rem] text-slate">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
