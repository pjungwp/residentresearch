import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { FieldStatus, FieldValue, Origin, Project } from './types';
import { DOWNSTREAM_KEYS, UPSTREAM_KEYS } from '@/content/fields';

/**
 * Local-first project store: IndexedDB, with an in-memory cache.
 * Nothing leaves the device except what the resident sends to the AI concierge
 * or the citation indexes.
 */
const DB = 'research-concierge';
const STORE = 'projects';
const FILES = 'files';
export const EXPORT_SCHEMA = 1;

export const safe = {
  get<T>(k: string, fb: T): T {
    try {
      const v = localStorage.getItem(k);
      return v == null ? fb : (JSON.parse(v) as T);
    } catch {
      return fb;
    }
  },
  set(k: string, v: unknown): boolean {
    try {
      localStorage.setItem(k, JSON.stringify(v));
      return true;
    } catch {
      return false;
    }
  },
  del(k: string) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
};

export function uid(prefix = 'id') {
  const r = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().replace(/-/g, '').slice(0, 12) : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${r}`;
}

/* ───────── IndexedDB ───────── */
let dbp: Promise<IDBDatabase> | null = null;
function db(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('This browser has no local database (IndexedDB).'));
    const req = indexedDB.open(DB, 2);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
      if (!req.result.objectStoreNames.contains(FILES)) req.result.createObjectStore(FILES, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('Could not open local database.'));
  });
  dbp.catch(() => (dbp = null));
  return dbp;
}
function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void, store = STORE): Promise<T | undefined> {
  return db().then(
    (d) =>
      new Promise((resolve, reject) => {
        const t = d.transaction(store, mode);
        const r = fn(t.objectStore(store));
        let out: T | undefined;
        if (r) r.onsuccess = () => (out = r.result);
        t.oncomplete = () => resolve(out);
        t.onerror = () => reject(t.error ?? new Error('Local save failed.'));
        t.onabort = () => reject(t.error ?? new Error('Local save aborted (storage may be full).'));
      })
  );
}

/* ───────── attached PDFs (local only) ───────── */
export async function saveFile(file: File): Promise<string> {
  const id = uid('f');
  await tx('readwrite', (s) => s.put({ id, name: file.name, type: file.type, blob: file }), FILES);
  return id;
}
export async function getFile(id: string): Promise<{ id: string; name: string; type: string; blob: Blob } | undefined> {
  return tx('readonly', (s) => s.get(id), FILES);
}
export async function deleteFile(id: string) {
  await tx('readwrite', (s) => s.delete(id), FILES);
}

/* ───────── blank + hydrate ───────── */
export function blankProject(title = 'Untitled project'): Project {
  const now = new Date().toISOString();
  return {
    id: uid('p'),
    title,
    resident: '',
    pgy: '',
    mentorName: '',
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
    archived: false,
    startMode: 'explore',
    currentWeek: 1,
    weekStatus: {},
    fields: {},
    lists: {
      concepts: [{ name: '', terms: '' }, { name: '', terms: '' }, { name: '', terms: '' }],
      searchLog: [],
      team: [],
      budget: [],
      milestones: [
        { name: 'IRB submission', date: '' },
        { name: 'Data collection complete', date: '' },
        { name: 'Analysis complete', date: '' },
        { name: 'Abstract submitted', date: '' },
        { name: 'Manuscript draft to mentor', date: '' }
      ],
      risks: [],
      dissemination: []
    },
    sources: [],
    checks: {},
    readiness: {},
    signoffs: { w2: undefined, w4: undefined, w5: undefined },
    comments: [],
    proposal: {},
    chat: [],
    capstone: false,
    exports: []
  };
}

export function hydrate(saved: any): Project {
  const base = blankProject();
  const p = { ...base, ...saved, lists: { ...base.lists, ...(saved?.lists ?? {}) } } as Project;
  p.fields ??= {};
  p.sources = (p.sources ?? []).map((s: any) => ({ ...s, include: s.include ?? true, addedBy: s.addedBy ?? 'resident', addedAt: s.addedAt ?? p.createdAt }));
  p.checks ??= {};
  p.readiness ??= {};
  p.signoffs ??= { w2: undefined, w4: undefined, w5: undefined };
  p.comments ??= [];
  p.proposal ??= {};
  p.weekStatus ??= {};
  p.chat ??= [];
  p.exports ??= [];
  return p;
}

/* ───────── fields ───────── */
export const fv = (p: Project | null | undefined, key: string): string => p?.fields[key]?.value ?? '';
export const fstatus = (p: Project, key: string): FieldStatus => {
  const f = p.fields[key];
  if (!f || !f.value.trim()) return 'unknown';
  return f.status;
};

/**
 * Set a field. Resident typing is "confirmed" (they supplied it). AI suggestions only land
 * through explicit acceptance. Earlier values are kept in history when the origin or status
 * changes, or when an edit comes more than 5 minutes after the last one.
 */
export function setField(p: Project, key: string, value: string, opts: { origin?: Origin; status?: FieldStatus } = {}) {
  const origin = opts.origin ?? 'resident';
  const now = new Date().toISOString();
  const prev = p.fields[key];
  const status: FieldStatus = opts.status ?? (value.trim() ? (prev && prev.origin === origin && prev.status !== 'unknown' ? prev.status : 'confirmed') : 'unknown');
  const history = prev?.history ?? [];
  if (prev && prev.value.trim() && prev.value !== value) {
    const stale = Date.now() - Date.parse(prev.updatedAt) > 5 * 60 * 1000;
    if (prev.origin !== origin || prev.status !== status || stale) {
      history.unshift({ value: prev.value, status: prev.status, origin: prev.origin, at: prev.updatedAt });
      history.splice(20);
    }
  }
  p.fields[key] = { ...(prev ?? {}), value, status, origin, updatedAt: now, history } satisfies FieldValue;
  // A substantive change to the question flags dependent fields for review (never erases them).
  if (UPSTREAM_KEYS.includes(key) && prev?.value.trim() && prev.value !== value && Date.now() - Date.parse(prev.updatedAt) > 60_000) {
    for (const d of DOWNSTREAM_KEYS) {
      const f = p.fields[d];
      if (f?.value.trim() && !f.flag) f.flag = { reason: `The research question changed (${new Date().toLocaleDateString()}). Check this still fits.`, at: now };
    }
  }
}

export function clearFlag(p: Project, key: string) {
  if (p.fields[key]) delete p.fields[key].flag;
}

export function setStatus(p: Project, key: string, status: FieldStatus) {
  const f = p.fields[key];
  if (!f) {
    p.fields[key] = { value: '', status, origin: 'resident', updatedAt: new Date().toISOString(), history: [] };
    return;
  }
  f.history.unshift({ value: f.value, status: f.status, origin: f.origin, at: f.updatedAt });
  f.history.splice(20);
  f.status = status;
  f.updatedAt = new Date().toISOString();
}

/* ───────── reactive cache ───────── */
const cache = new Map<string, Project>();
let loaded = false;
let loadError: string | null = null;
const listeners = new Set<() => void>();
let version = 0;
const emit = () => {
  version++;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export async function loadAll() {
  try {
    const all = ((await tx<Project[]>('readonly', (s) => s.getAll())) ?? []).map(hydrate);
    cache.clear();
    all.forEach((p) => cache.set(p.id, p));
    loadError = null;
  } catch (e) {
    loadError = (e as Error).message;
  }
  loaded = true;
  emit();
}

export interface ListState {
  loaded: boolean;
  error: string | null;
  projects: Project[];
  v: number;
}
let snap: ListState = { loaded: false, error: null, projects: [], v: -1 };
const getSnap = () => {
  if (snap.v !== version) snap = { loaded, error: loadError, projects: [...cache.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), v: version };
  return snap;
};
export function useProjects(): ListState {
  return useSyncExternalStore(subscribe, getSnap, getSnap);
}

export async function persist(p: Project): Promise<void> {
  cache.set(p.id, p);
  emit();
  await tx('readwrite', (s) => s.put(p));
}

export async function createProject(title?: string, resident = ''): Promise<Project> {
  const p = blankProject(title);
  p.resident = resident;
  await persist(p);
  return p;
}

export async function deleteProject(id: string) {
  cache.delete(id);
  emit();
  await tx('readwrite', (s) => s.delete(id));
}

export function exportProjectJson(p: Project): string {
  return JSON.stringify({ app: 'research-concierge', schema: EXPORT_SCHEMA, exportedAt: new Date().toISOString(), project: p }, null, 2);
}

export function parseProjectJson(text: string): Project {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (data?.app !== 'research-concierge' || !data.project) throw new Error('This file was not exported from Research Concierge.');
  if (typeof data.schema !== 'number' || data.schema > EXPORT_SCHEMA) throw new Error('This file comes from a newer version of the app.');
  return hydrate(data.project);
}

/** Import: if the project already exists here, the incoming copy replaces it only when newer (or when forced). */
export async function importProject(p: Project, mode: 'replace' | 'copy'): Promise<Project> {
  const incoming = structuredClone(p);
  if (mode === 'copy' && cache.has(incoming.id)) {
    incoming.id = uid('p');
    incoming.title = `${incoming.title} (copy)`;
  }
  await persist(incoming);
  return incoming;
}

/**
 * Edit a project with autosave. Mutations run on a clone; saves are debounced 400 ms.
 */
export function useProject(id: string | undefined) {
  const { loaded: isLoaded } = useProjects();
  const project = id ? cache.get(id) ?? null : null;
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const timer = useRef<number | undefined>(undefined);
  const pending = useRef<Project | null>(null);

  const flush = useCallback(async () => {
    const p = pending.current;
    if (!p) return;
    pending.current = null;
    try {
      await tx('readwrite', (s) => s.put(p));
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, []);

  const update = useCallback(
    (fn: (draft: Project) => void) => {
      if (!id) return;
      const cur = cache.get(id);
      if (!cur) return;
      const next = structuredClone(cur);
      fn(next);
      next.updatedAt = new Date().toISOString();
      cache.set(id, next);
      emit();
      pending.current = next;
      setSaveState('saving');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, 400);
    },
    [id, flush]
  );

  useEffect(() => {
    const onHide = () => void flush();
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onHide);
      window.clearTimeout(timer.current);
      void flush();
    };
  }, [flush]);

  return { project, loaded: isLoaded, update, saveState };
}

/* ───────── settings ───────── */
export const SETTINGS_KEY = 'rc.settings';
export interface Settings {
  accessCode: string;
  email: string;
  aiNoticeAccepted: boolean;
  role: 'resident' | 'mentor';
  mentorName: string;
  railExpanded: boolean;
  blueprintWidth: number;
  theme: 'system' | 'light' | 'dark';
  lastProjectId: string;
}
const DEFAULT_SETTINGS: Settings = { accessCode: '', email: '', aiNoticeAccepted: false, role: 'resident', mentorName: '', railExpanded: false, blueprintWidth: 360, theme: 'system', lastProjectId: '' };
export function getSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...safe.get<Partial<Settings>>(SETTINGS_KEY, {}) };
}
const settingsListeners = new Set<() => void>();
let settingsSnap = getSettings();
export function setSettings(s: Partial<Settings>) {
  safe.set(SETTINGS_KEY, { ...getSettings(), ...s });
  settingsSnap = getSettings();
  settingsListeners.forEach((l) => l());
}
export function useSettings(): Settings {
  return useSyncExternalStore(
    (l) => {
      settingsListeners.add(l);
      return () => settingsListeners.delete(l);
    },
    () => settingsSnap,
    () => settingsSnap
  );
}
