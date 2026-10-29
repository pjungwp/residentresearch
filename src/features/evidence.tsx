import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, RefreshCw, ShieldCheck, ShieldAlert, ShieldQuestion, ChevronDown, ExternalLink, FileDown, Trash2, Paperclip, Sparkles, Copy, Download, Columns3, Loader2, XCircle, Unlock, Lock
} from 'lucide-react';
import { useProjectCtx, PageHeader } from '@/components/shell';
import type { Project, SourceRecord, VStatus } from '@/lib/types';
import { ACCESS_LABEL, STATUS_LABEL, amaCitation, browserFetcher, isOpen, newSource, parseIdentifiers, recheckDiff, searchCandidates, verifySource } from '@/lib/verify';
import { deleteFile, fv, getFile, saveFile, useSettings } from '@/lib/store';
import { askConcierge, AIError } from '@/lib/ai';
import { copyText, useToast } from '@/components/ui/Toast';
import { Callout } from '@/components/ui/primitives';
import { downloadFile } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';

const STATUS_STYLE: Record<VStatus, { cls: string; Icon: typeof ShieldCheck }> = {
  verified: { cls: 'text-ok', Icon: ShieldCheck },
  partial: { cls: 'text-warn', Icon: ShieldQuestion },
  unverified: { cls: 'text-slate', Icon: ShieldQuestion },
  notfound: { cls: 'text-err', Icon: XCircle },
  retracted: { cls: 'text-err', Icon: ShieldAlert }
};

export function VerifyBadge({ s }: { s: SourceRecord }) {
  const st = STATUS_STYLE[s.verification.status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[0.875rem] font-semibold ${st.cls}`}>
      <st.Icon size={14} aria-hidden /> {STATUS_LABEL[s.verification.status]}
    </span>
  );
}

export function AccessBadge({ s }: { s: SourceRecord }) {
  const open = isOpen(s.access);
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[0.875rem] font-semibold ${open ? 'text-w3-text' : s.access === 'preprint' ? 'text-warn' : 'text-slate'}`}>
      {open ? <Unlock size={13} aria-hidden /> : <Lock size={13} aria-hidden />} {ACCESS_LABEL[s.access]}
    </span>
  );
}

export function EvidencePage() {
  const { project, update } = useProjectCtx();
  usePageTitle(`Evidence · ${project.title}`);
  const { email } = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'add' | 'search'>('add');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [candidates, setCandidates] = useState<Awaited<ReturnType<typeof searchCandidates>> | null>(null);
  const [rechecking, setRechecking] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'included' | 'excluded'>('all');

  const inc = project.sources.filter((s) => s.include);
  const verified = inc.filter((s) => s.verification.status === 'verified').length;
  const oa = inc.filter((s) => isOpen(s.access)).length;
  const shown = project.sources.filter((s) => (filter === 'all' ? true : filter === 'included' ? s.include : !s.include));

  const exists = (ids: { doi?: string; pmid?: string; pmcid?: string }) =>
    project.sources.some((s) => (ids.doi && s.doi === ids.doi) || (ids.pmid && s.pmid === ids.pmid) || (ids.pmcid && s.pmcid === ids.pmcid));

  const addAndVerify = async (raw: string, claimed?: string) => {
    const fresh = newSource(raw);
    const ids = parseIdentifiers(raw);
    if (exists(ids)) {
      toast('That source is already in your library');
      return;
    }
    const v = await verifySource(fresh, { email, claimedText: claimed });
    if (exists({ doi: v.doi, pmid: v.pmid, pmcid: v.pmcid })) {
      toast('That source is already in your library');
      return;
    }
    update((p) => p.sources.push(v));
    toast(`Added — ${STATUS_LABEL[v.verification.status].toLowerCase()}`);
  };

  const onAdd = async () => {
    const raw = input.trim();
    if (!raw) return;
    setBusy(true);
    setCandidates(null);
    try {
      const ids = parseIdentifiers(raw);
      if (ids.text) {
        // Citation text or title: find candidates, let the resident choose (never auto-pick).
        const c = await searchCandidates(raw, browserFetcher);
        setCandidates(c);
        if (!c.length) toast('No matching records found. Check the title or paste a DOI or PMID.', 'error');
      } else {
        await addAndVerify(raw);
        setInput('');
      }
    } catch {
      toast('Lookup failed. Check your connection and try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const recheckAll = async () => {
    setRechecking(true);
    let changed = 0;
    const results: SourceRecord[] = [];
    for (const s of inc) {
      const again = await verifySource({ ...s, input: s.doi ?? (s.pmid ? `PMID ${s.pmid}` : s.input) }, { email });
      const diffs = recheckDiff(s, again);
      if (diffs.length) changed++;
      results.push({ ...again, input: s.input, annotation: s.annotation, include: s.include, fileId: s.fileId, fileName: s.fileName, addedBy: s.addedBy, addedAt: s.addedAt, verification: { ...again.verification, recheckedAt: new Date().toISOString(), notes: [...again.verification.notes, ...(diffs.length ? [`Recheck found changes: ${diffs.join(', ')}`] : [])] } });
    }
    update((p) => {
      p.sources = p.sources.map((s) => results.find((r) => r.id === s.id) ?? s);
    });
    const v = results.filter((r) => r.verification.status === 'verified').length;
    const pv = results.filter((r) => r.verification.status === 'partial').length;
    toast(`Recheck complete: ${results.length} sources, ${v} verified, ${pv} partially verified${changed ? `, ${changed} changed` : ''}`);
    setRechecking(false);
  };

  const exportRis = () => {
    const ris = inc
      .map((s) => [
        'TY  - JOUR',
        ...s.authors.map((a) => `AU  - ${a}`),
        `TI  - ${s.title ?? s.input}`,
        s.journal && `JO  - ${s.journal}`,
        s.year && `PY  - ${s.year}`,
        s.volume && `VL  - ${s.volume}`,
        s.issue && `IS  - ${s.issue}`,
        s.pages && `SP  - ${s.pages}`,
        s.doi && `DO  - ${s.doi}`,
        s.pmid && `AN  - PMID:${s.pmid}`,
        (s.fullTextUrl ?? s.landingUrl) && `UR  - ${s.fullTextUrl ?? s.landingUrl}`,
        `N1  - Verification: ${STATUS_LABEL[s.verification.status]}; Access: ${ACCESS_LABEL[s.access]}`,
        'ER  - '
      ].filter(Boolean).join('\n'))
      .join('\n\n');
    downloadFile(`${slug(project.title)}-references.ris`, ris, 'application/x-research-info-systems');
  };

  const copyAma = async () => {
    const text = inc.map((s, i) => `${i + 1}. ${amaCitation(s)}${s.fullTextUrl ? ` Full text: ${s.pdfUrl ?? s.fullTextUrl}` : ''} [${STATUS_LABEL[s.verification.status]}]`).join('\n');
    toast((await copyText(text)) ? 'Bibliography copied' : 'Could not copy');
  };

  return (
    <div className="mx-auto max-w-[1280px] px-[var(--gutter)] py-4">
      <PageHeader
        eyebrow="Evidence Library"
        tone="text-w2-text"
        title="Evidence Library"
        actions={
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/p/${project.id}`, { state: { prompt: 'Using my verified annotated sources, synthesize what is known and propose a 2–3 sentence evidence-gap statement. Say whether my question should change.' } })}>
              <Sparkles size={15} aria-hidden /> Synthesize gap
            </button>
            <button className="btn btn-secondary btn-sm" onClick={copyAma} disabled={!inc.length}>
              <Copy size={15} aria-hidden /> Copy AMA
            </button>
            <button className="btn btn-secondary btn-sm" onClick={exportRis} disabled={!inc.length}>
              <Download size={15} aria-hidden /> RIS
            </button>
          </>
        }
      >
        Verified metadata comes from Crossref, PubMed and Europe PMC — never from AI text.
      </PageHeader>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-line bg-surface px-4 py-2.5 text-[1rem]">
        <span><strong>{inc.length}</strong> included</span>
        <span className="text-ok"><strong>{verified}</strong> verified</span>
        <span className="text-w3-text"><strong>{oa}</strong> of {inc.length} open access</span>
        <span className="text-slate">{inc.filter((s) => s.annotation.readFullText).length} read in full</span>
        <button className="btn btn-secondary btn-sm ml-auto" onClick={recheckAll} disabled={!inc.length || rechecking}>
          {rechecking ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <RefreshCw size={15} aria-hidden />} Recheck all
        </button>
      </div>
      {!email && (
        <div className="mt-3">
          <Callout tone="info" title="Turn on open-access checks">
            Add your email in <a href="/settings">Settings</a> so the app can ask Unpaywall for legal free copies of each article.
          </Callout>
        </div>
      )}

      {/* Add / search */}
      <section className="card mt-4 p-4" aria-label="Add sources">
        <div className="flex gap-2" role="tablist" aria-label="How to add">
          <button role="tab" aria-selected={tab === 'add'} className="chip" aria-pressed={tab === 'add'} onClick={() => setTab('add')}>
            <Plus size={15} aria-hidden /> Add by identifier or citation
          </button>
          <button role="tab" aria-selected={tab === 'search'} className="chip" aria-pressed={tab === 'search'} onClick={() => setTab('search')}>
            <Search size={15} aria-hidden /> Search PubMed records
          </button>
        </div>
        {tab === 'add' ? (
          <div className="mt-3">
            <form
              className="flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                void onAdd();
              }}
            >
              <label htmlFor="add-src" className="sr-only">
                DOI, PMID, PMCID, link or full citation
              </label>
              <input id="add-src" className="input flex-1" placeholder="DOI, PMID, PMCID, PubMed/DOI link — or paste a full citation" value={input} onChange={(e) => setInput(e.target.value)} />
              <button className="btn btn-primary" disabled={busy || !input.trim()}>
                {busy ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <ShieldCheck size={17} aria-hidden />} Add & verify
              </button>
            </form>
            {candidates && candidates.length > 0 && (
              <div className="mt-3">
                <p className="text-[1rem] font-semibold">Which article did you mean?</p>
                <ul className="mt-1.5 space-y-1.5">
                  {candidates.map((c) => (
                    <li key={(c.doi ?? c.pmid ?? c.title) + c.year} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-line p-2.5 text-[1rem]">
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{c.title}</span>
                        <span className="block text-[0.9375rem] text-slate">
                          {c.authorString} · {c.journal} {c.year} {c.doi && `· doi:${c.doi}`}
                        </span>
                      </span>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={!c.doi && !c.pmid}
                        onClick={async () => {
                          setBusy(true);
                          await addAndVerify(c.doi ?? `PMID ${c.pmid}`, input);
                          setBusy(false);
                          setCandidates(null);
                          setInput('');
                        }}
                      >
                        This one
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <LiteratureSearch onImport={(id) => addAndVerify(id)} exists={exists} />
        )}
      </section>

      {/* Compare */}
      {compare.length >= 2 && <CompareTable ids={compare} project={project} onClose={() => setCompare([])} />}

      {/* Library */}
      <section className="mt-4" aria-labelledby="lib-h">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="lib-h" className="text-[1.1875rem] font-bold">Sources ({project.sources.length})</h2>
          <div className="flex gap-1.5" role="group" aria-label="Filter">
            {(['all', 'included', 'excluded'] as const).map((f) => (
              <button key={f} className="chip !min-h-[34px] text-[0.9375rem]" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {project.sources.length === 0 ? (
          <p className="card mt-2 p-5 text-[1.0625rem] text-slate">No sources yet. Add a DOI or PMID above, search PubMed records, or ask the AI mentor to find open-access sources and click “Add & verify”.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {shown.map((s) => (
              <SourceRow
                key={s.id}
                s={s}
                index={inc.findIndex((x) => x.id === s.id)}
                comparing={compare.includes(s.id)}
                onCompare={() => setCompare((c) => (c.includes(s.id) ? c.filter((x) => x !== s.id) : c.length >= 3 ? c : [...c, s.id]))}
              />
            ))}
          </ul>
        )}
        {compare.length === 1 && <p className="mt-2 text-[0.9375rem] text-slate">Select one or two more sources to compare.</p>}
      </section>
    </div>
  );
}

function LiteratureSearch({ onImport, exists }: { onImport: (id: string) => Promise<void>; exists: (ids: { doi?: string; pmid?: string }) => boolean }) {
  const { project } = useProjectCtx();
  const [q, setQ] = useState(() => fv(project, 'question').slice(0, 120));
  const [oaOnly, setOaOnly] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const run = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const query = `(${q.trim()}) AND SRC:MED${oaOnly ? ' AND OPEN_ACCESS:Y' : ''}`;
      const j = await browserFetcher(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=lite&pageSize=15&sort=RELEVANCE&query=${encodeURIComponent(query)}`);
      setResults(j?.resultList?.result ?? []);
    } catch {
      setErr('Search failed. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mt-3">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-center"
        onSubmit={(e) => {
          e.preventDefault();
          void run();
        }}
      >
        <label htmlFor="lit-q" className="sr-only">
          Search terms
        </label>
        <input id="lit-q" className="input flex-1" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Keywords, or paste your PubMed search string" />
        <label className="flex min-h-[44px] items-center gap-2 text-[1rem]">
          <input type="checkbox" className="h-5 w-5 accent-[var(--btn-primary)]" checked={oaOnly} onChange={(e) => setOaOnly(e.target.checked)} /> Open access only
        </label>
        <button className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={17} className="animate-spin" aria-hidden /> : <Search size={17} aria-hidden />} Search
        </button>
      </form>
      <p className="mt-1 text-[0.875rem] text-slate">Searches PubMed (MEDLINE) records through Europe PMC. Log searches in Stage 2.</p>
      {err && <p className="mt-2 text-[1rem] text-err" role="alert">{err}</p>}
      {results && (
        <ul className="mt-3 space-y-1.5" aria-live="polite">
          {results.length === 0 && <li className="text-[1rem] text-slate">No results.</li>}
          {results.map((r) => {
            const id = r.doi ?? (r.pmid ? `PMID ${r.pmid}` : undefined);
            const have = exists({ doi: r.doi?.toLowerCase(), pmid: r.pmid });
            return (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-line p-2.5">
                <span className="min-w-0 flex-1 text-[1rem]">
                  <span className="font-medium">{r.title}</span>
                  <span className="block text-[0.9375rem] text-slate">
                    {r.authorString?.slice(0, 120)} · {r.journalTitle} {r.pubYear}
                    {r.isOpenAccess === 'Y' && <span className="ml-1 font-semibold text-w3-text">· Open access</span>}
                    {(r.pubType ?? '').match(/review|guideline|meta-analysis/i) && <span className="ml-1 font-semibold text-w2-text">· {r.pubType.split(';')[0]}</span>}
                  </span>
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={!id || have || importing === r.id}
                  onClick={async () => {
                    setImporting(r.id);
                    await onImport(id!);
                    setImporting(null);
                  }}
                >
                  {have ? 'In library' : importing === r.id ? 'Verifying…' : 'Add & verify'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SourceRow({ s, index, comparing, onCompare }: { s: SourceRecord; index: number; comparing: boolean; onCompare: () => void }) {
  const { project, update } = useProjectCtx();
  const { email } = useSettings();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<'' | 'verify' | 'ai'>('');
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (fn: (x: SourceRecord) => void) =>
    update((p) => {
      const x = p.sources.find((y) => y.id === s.id);
      if (x) fn(x);
    });
  const a = s.annotation;

  const reverify = async () => {
    setBusy('verify');
    const again = await verifySource({ ...s, input: s.doi ?? (s.pmid ? `PMID ${s.pmid}` : s.input) }, { email });
    set((x) => Object.assign(x, { ...again, input: s.input, annotation: s.annotation, include: s.include, fileId: s.fileId, fileName: s.fileName, verification: { ...again.verification, recheckedAt: new Date().toISOString() } }));
    setBusy('');
  };

  const draftWithAI = async () => {
    if (!s.abstract) {
      toast('No abstract available to draft from. Annotate from the full text.', 'error');
      return;
    }
    if (Object.values(a).some((v) => typeof v === 'string' && v.trim()) && !window.confirm('Fill only the empty annotation fields from the abstract?')) return;
    setBusy('ai');
    let text = '';
    try {
      await askConcierge(
        {
          mode: 'annotate',
          messages: [{ role: 'user', content: JSON.stringify({ researchQuestion: fv(project, 'revisedQuestion') || fv(project, 'question'), citation: amaCitation(s), publicationTypes: s.pubTypes, abstract: s.abstract }) }]
        },
        { onText: (d) => (text += d) }
      );
      const json = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));
      set((x) => {
        for (const k of ['level', 'design', 'sample', 'findings', 'strengths', 'limitations', 'relevance'] as const) if (!x.annotation[k].trim() && typeof json[k] === 'string') x.annotation[k] = json[k];
        x.annotation.aiDrafted = true;
      });
      toast('Draft added from the abstract — check it against the full text');
    } catch (e) {
      toast(e instanceof AIError ? e.message : 'Could not draft the annotation.', 'error');
    } finally {
      setBusy('');
    }
  };

  const attach = async (f: File) => {
    if (f.type !== 'application/pdf') return toast('Please choose a PDF', 'error');
    if (f.size > 25 * 1024 * 1024) return toast('PDF is larger than 25 MB', 'error');
    try {
      const id = await saveFile(f);
      if (s.fileId) await deleteFile(s.fileId);
      set((x) => {
        x.fileId = id;
        x.fileName = f.name;
      });
      toast('PDF attached (stored on this device only)');
    } catch {
      toast('Could not store the PDF — the device may be out of space', 'error');
    }
  };
  const openFile = async () => {
    if (!s.fileId) return;
    const f = await getFile(s.fileId);
    if (!f) return toast('Attached PDF not found on this device', 'error');
    window.open(URL.createObjectURL(f.blob), '_blank', 'noopener');
  };

  const ann = (k: keyof typeof a, label: string, long = true) => (
    <label className="block text-[0.9375rem] font-semibold">
      {label}
      {long ? (
        <textarea className="input mt-1 min-h-[64px] text-[1rem] font-normal" value={String(a[k] ?? '')} onChange={(e) => set((x) => void ((x.annotation as any)[k] = e.target.value))} />
      ) : (
        <input className="input mt-1 text-[1rem] font-normal" value={String(a[k] ?? '')} onChange={(e) => set((x) => void ((x.annotation as any)[k] = e.target.value))} />
      )}
    </label>
  );

  const v = s.verification;
  return (
    <li id={s.id} className={`card overflow-hidden ${s.include ? '' : 'opacity-75'}`}>
      <div className="flex items-start gap-3 p-3">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-w2-soft text-[0.9375rem] font-bold text-w2-text" aria-hidden>
          {index >= 0 ? index + 1 : '–'}
        </span>
        <div className="min-w-0 flex-1">
          <button type="button" className="block w-full text-left" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <span className="block text-[1.0625rem] font-semibold leading-snug">{s.title ?? s.input}</span>
            <span className="mt-0.5 block text-[0.9375rem] text-slate">
              {s.authors.slice(0, 3).join(', ')}
              {s.authors.length > 3 && ' et al.'} {s.journalAbbrev ?? s.journal ? `· ${s.journalAbbrev ?? s.journal}` : ''} {s.year && `· ${s.year}`}
            </span>
          </button>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <VerifyBadge s={s} />
            <AccessBadge s={s} />
            {a.level && <span className="text-[0.875rem] font-semibold text-w2-text">{a.level}</span>}
            {a.readFullText && <span className="text-[0.875rem] text-ok">Read in full</span>}
            {s.addedBy === 'ai' && <span className="text-[0.875rem] text-slate">Suggested by AI</span>}
            {(s.pdfUrl ?? s.fullTextUrl) && (
              <a href={s.pdfUrl ?? s.fullTextUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[0.9375rem] font-semibold">
                {s.pdfUrl ? <FileDown size={14} aria-hidden /> : <ExternalLink size={14} aria-hidden />} {s.pdfUrl ? 'PDF' : 'Full text'}
              </a>
            )}
          </div>
          {a.findings && !open && <p className="mt-1 line-clamp-2 text-[0.9375rem]">{a.findings}</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <label className="flex min-h-[36px] items-center gap-1.5 text-[0.9375rem]">
            <input type="checkbox" className="h-5 w-5 accent-[var(--btn-primary)]" checked={s.include} onChange={(e) => set((x) => void (x.include = e.target.checked))} />
            Include
          </label>
          <button type="button" className={`chip !min-h-[32px] !px-2 text-[0.875rem]`} aria-pressed={comparing} onClick={onCompare}>
            <Columns3 size={13} aria-hidden /> Compare
          </button>
          <button type="button" className="grid h-9 w-9 place-items-center rounded-md text-slate hover:bg-sage" aria-label={open ? 'Collapse details' : 'Expand details'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <ChevronDown size={18} style={{ transform: open ? 'rotate(180deg)' : undefined }} aria-hidden />
          </button>
        </div>
      </div>

      {open && (
        <div className="grid gap-4 border-t border-line p-3 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="min-w-0 space-y-3 text-[1rem]">
            <div>
              <p className="text-[0.9375rem] font-semibold">AMA citation</p>
              <p className="mt-0.5">{amaCitation(s)}</p>
            </div>
            <dl className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 text-[0.9375rem]">
              {s.doi && (<><dt className="text-slate">DOI</dt><dd className="m-0 break-all"><a href={`https://doi.org/${s.doi}`} target="_blank" rel="noopener noreferrer">{s.doi}</a></dd></>)}
              {s.pmid && (<><dt className="text-slate">PMID</dt><dd className="m-0"><a href={`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`} target="_blank" rel="noopener noreferrer">{s.pmid}</a></dd></>)}
              {s.pmcid && (<><dt className="text-slate">PMCID</dt><dd className="m-0">{s.pmcid}</dd></>)}
              <dt className="text-slate">Access</dt>
              <dd className="m-0">
                {ACCESS_LABEL[s.access]}
                {s.oaStatus && ` (${s.oaStatus})`}
                {s.fullTextUrl && (<><br /><a href={s.fullTextUrl} target="_blank" rel="noopener noreferrer" className="break-all">Free full text</a></>)}
                {s.pdfUrl && (<><br /><a href={s.pdfUrl} target="_blank" rel="noopener noreferrer" className="break-all">Download PDF</a></>)}
                {s.access === 'subscription' && <><br /><span className="text-slate">Paywalled: use the hospital library, interlibrary loan or ask the author.</span></>}
              </dd>
            </dl>
            <div className="rounded-lg bg-surface-2 p-2.5">
              <p className="flex items-center justify-between gap-2 text-[0.9375rem] font-semibold">
                Verification
                <button className="btn btn-ghost btn-sm !min-h-[30px]" onClick={reverify} disabled={busy === 'verify'}>
                  {busy === 'verify' ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <RefreshCw size={14} aria-hidden />} Recheck
                </button>
              </p>
              <p className="mt-1 text-[0.9375rem]">
                <VerifyBadge s={s} /> {v.method.length ? `via ${v.method.join(', ')}` : ''}
                {v.checkedAt && <span className="text-slate"> · checked {new Date(v.checkedAt).toLocaleDateString()}</span>}
                {v.recheckedAt && <span className="text-slate"> · rechecked {new Date(v.recheckedAt).toLocaleDateString()}</span>}
              </p>
              {v.mismatches.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-[0.9375rem] text-warn">
                  {v.mismatches.map((m) => <li key={m}>{m}</li>)}
                </ul>
              )}
              {v.notes.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-[0.9375rem] text-slate">
                  {v.notes.map((m) => <li key={m}>{m}</li>)}
                </ul>
              )}
            </div>
            {s.abstract && (
              <details>
                <summary className="cursor-pointer text-[0.9375rem] font-semibold">Abstract</summary>
                <p className="mt-1 text-[0.9375rem] leading-relaxed">{s.abstract}</p>
              </details>
            )}
            <div className="flex flex-wrap gap-2">
              <input ref={fileRef} type="file" accept="application/pdf" className="sr-only" aria-label="Attach PDF" onChange={(e) => { const f = e.target.files?.[0]; if (f) void attach(f); e.target.value = ''; }} />
              {s.fileId ? (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={openFile}><Paperclip size={14} aria-hidden /> {s.fileName ?? 'Attached PDF'}</button>
                  <button className="btn btn-ghost btn-sm" onClick={async () => { if (s.fileId) await deleteFile(s.fileId); set((x) => { x.fileId = undefined; x.fileName = undefined; }); }}>Remove PDF</button>
                </>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()}><Paperclip size={14} aria-hidden /> Attach PDF</button>
              )}
              <button className="btn btn-ghost btn-sm !text-err" onClick={() => { if (window.confirm('Remove this source from the library?')) update((p) => { p.sources = p.sources.filter((x) => x.id !== s.id); for (const f of Object.values(p.fields)) if (f.refs) f.refs = f.refs.filter((r) => r !== s.id); }); }}>
                <Trash2 size={14} aria-hidden /> Remove
              </button>
            </div>
            <p className="text-[0.8125rem] text-slate">Attach only PDFs you are permitted to keep. Attached files stay on this device.</p>
          </div>

          <div className="min-w-0 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[1rem] font-bold">Annotation</p>
              <button className="btn btn-secondary btn-sm" onClick={draftWithAI} disabled={busy === 'ai' || !s.abstract}>
                {busy === 'ai' ? <Loader2 size={14} className="animate-spin" aria-hidden /> : <Sparkles size={14} aria-hidden />} Draft from abstract
              </button>
            </div>
            {a.aiDrafted && <p className="rounded-lg bg-w1-soft px-2.5 py-1.5 text-[0.875rem] text-w1-text">Parts of this annotation were drafted by AI from the abstract only. Check every statement against the full text.</p>}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {ann('level', 'Study type / level of evidence', false)}
              {ann('sample', 'Setting and sample', false)}
            </div>
            {ann('design', 'Design')}
            {ann('findings', 'Main findings (with numbers)')}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {ann('strengths', 'Strengths')}
              {ann('limitations', 'Limitations')}
            </div>
            {ann('relevance', 'Relevance to my question')}
            <label className="flex min-h-[44px] items-center gap-2.5 rounded-lg border border-line px-3 text-[1rem]">
              <input type="checkbox" className="h-5 w-5 accent-[var(--btn-primary)]" checked={a.readFullText} onChange={(e) => set((x) => void (x.annotation.readFullText = e.target.checked))} />
              I opened and read this source myself
            </label>
          </div>
        </div>
      )}
    </li>
  );
}

function CompareTable({ ids, project, onClose }: { ids: string[]; project: Project; onClose: () => void }) {
  const rows: [string, (s: SourceRecord) => string][] = [
    ['Study', (s) => `${s.authors[0] ?? ''} ${s.year ?? ''}`],
    ['Type / level', (s) => s.annotation.level],
    ['Design', (s) => s.annotation.design],
    ['Sample', (s) => s.annotation.sample],
    ['Findings', (s) => s.annotation.findings],
    ['Limitations', (s) => s.annotation.limitations],
    ['Relevance', (s) => s.annotation.relevance],
    ['Verification', (s) => STATUS_LABEL[s.verification.status]]
  ];
  const srcs = ids.map((id) => project.sources.find((s) => s.id === id)!).filter(Boolean);
  return (
    <section className="card mt-4 overflow-hidden" aria-labelledby="cmp-h">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <h2 id="cmp-h" className="text-[1.125rem] font-bold">Compare sources</h2>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[0.9375rem]">
          <thead>
            <tr>
              <th className="w-[120px]" />
              {srcs.map((s) => (
                <th key={s.id} scope="col" className="px-3 py-2 text-left align-top font-semibold">{s.title?.slice(0, 90) ?? s.input}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label} className="border-t border-line align-top">
                <th scope="row" className="px-3 py-2 text-left font-semibold text-slate">{label}</th>
                {srcs.map((s) => (
                  <td key={s.id} className="px-3 py-2">{fn(s) || <span className="text-slate">—</span>}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'project';
