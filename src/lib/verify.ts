/**
 * Citation verification engine.
 * Looks a reference up in independent scholarly indexes (Crossref, PubMed, Europe PMC),
 * cross-checks the fields, flags retractions, and finds a legal open-access copy (Unpaywall,
 * PMC / Europe PMC). Never invents identifiers or links: every value shown comes from an index record.
 */
import type { Access, SourceRecord, VStatus } from './types';
import { uid } from './store';

export type Fetcher = (url: string) => Promise<any>;

const ALLOWED = ['eutils.ncbi.nlm.nih.gov', 'api.crossref.org', 'api.unpaywall.org', 'www.ebi.ac.uk'];

/** Browser fetcher: direct request first; on a CORS/network failure, retry through the site's proxy. */
export const browserFetcher: Fetcher = async (url) => {
  const host = new URL(url).host;
  if (!ALLOWED.includes(host)) throw new Error(`Host not allowed: ${host}`);
  const tryFetch = async (u: string) => {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 12000);
    try {
      const r = await fetch(u, { signal: ctl.signal, headers: { Accept: 'application/json' } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } finally {
      clearTimeout(t);
    }
  };
  try {
    return await tryFetch(url);
  } catch (e) {
    if ((e as Error).message?.startsWith('HTTP')) throw e;
    return await tryFetch(`/api/lit?u=${encodeURIComponent(url)}`);
  }
};

/* ───────── identifier parsing ───────── */

export interface Ids {
  doi?: string;
  pmid?: string;
  pmcid?: string;
  text?: string;
}

export function parseIdentifiers(input: string): Ids {
  const s = input.trim();
  const ids: Ids = {};
  const doi = s.match(/\b(10\.\d{4,9}\/[^\s"<>]+)/i);
  if (doi) ids.doi = doi[1].replace(/[.,;)\]]+$/, '').toLowerCase();
  const pmc = s.match(/\bPMC\s?(\d{4,9})\b/i);
  if (pmc) ids.pmcid = `PMC${pmc[1]}`;
  const pmidLabeled = s.match(/\bPMID[:\s]*?(\d{4,9})\b/i) ?? s.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{4,9})/i);
  if (pmidLabeled) ids.pmid = pmidLabeled[1];
  else if (/^\d{5,9}$/.test(s)) ids.pmid = s;
  if (!ids.doi && !ids.pmid && !ids.pmcid) ids.text = s;
  return ids;
}

/* ───────── normalizers ───────── */

export const norm = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Token-set similarity, 0–1. */
export function similarity(a = '', b = ''): number {
  const A = new Set(norm(a).split(' ').filter((w) => w.length > 2));
  const B = new Set(norm(b).split(' ').filter((w) => w.length > 2));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach((w) => B.has(w) && inter++);
  return inter / Math.max(A.size, B.size);
}

const firstPage = (p = '') => p.split(/[-–]/)[0].trim().replace(/^e/i, '');

/* ───────── per-source lookups ───────── */

interface Rec {
  source: 'crossref' | 'pubmed' | 'europepmc';
  title?: string;
  authors: string[]; // "Family Initials"
  firstFamily?: string;
  journal?: string;
  journalAbbrev?: string;
  year?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  pubTypes: string[];
  retracted?: boolean;
  concern?: boolean;
  correction?: boolean;
  abstract?: string;
  preprint?: boolean;
  fullText: { url: string; style: string; availability: string }[];
  inPMC?: boolean;
  isOA?: boolean;
}

const initials = (given = '') =>
  given
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((g) => g[0].toUpperCase())
    .join('');

export async function crossref(doi: string, f: Fetcher): Promise<Rec | null> {
  const j = await f(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  const m = j?.message;
  if (!m) return null;
  const updates: any[] = [...(m['updated-by'] ?? []), ...(m['update-to'] ?? [])];
  const authors = (m.author ?? []).map((a: any) => (a.family ? `${a.family} ${initials(a.given)}`.trim() : a.name ?? '')).filter(Boolean);
  return {
    source: 'crossref',
    title: (m.title ?? [])[0],
    authors,
    firstFamily: m.author?.[0]?.family,
    journal: (m['container-title'] ?? [])[0],
    journalAbbrev: (m['short-container-title'] ?? [])[0],
    year: String(m.issued?.['date-parts']?.[0]?.[0] ?? m.published?.['date-parts']?.[0]?.[0] ?? ''),
    volume: m.volume,
    issue: m.issue,
    pages: m.page ?? m['article-number'],
    doi: (m.DOI ?? doi).toLowerCase(),
    pubTypes: [m.type].filter(Boolean),
    retracted: updates.some((u) => /retract/i.test(u.type ?? '')),
    concern: updates.some((u) => /concern/i.test(u.type ?? '')),
    correction: updates.some((u) => /correct|errat/i.test(u.type ?? '')),
    preprint: m.type === 'posted-content' || m.subtype === 'preprint',
    fullText: []
  };
}

export async function pubmedSearchByDoi(doi: string, f: Fetcher): Promise<string | undefined> {
  const j = await f(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&tool=research-concierge&term=${encodeURIComponent(doi)}[doi]`);
  const ids: string[] = j?.esearchresult?.idlist ?? [];
  return ids.length === 1 ? ids[0] : undefined;
}

export async function pubmed(pmid: string, f: Fetcher): Promise<Rec | null> {
  const j = await f(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&tool=research-concierge&id=${pmid}`);
  const r = j?.result?.[pmid];
  if (!r || r.error) return null;
  const aid = (t: string) => (r.articleids ?? []).find((a: any) => a.idtype === t)?.value as string | undefined;
  const authors = (r.authors ?? []).filter((a: any) => a.authtype === 'Author' || !a.authtype).map((a: any) => a.name as string);
  const pubTypes: string[] = r.pubtype ?? [];
  return {
    source: 'pubmed',
    title: (r.title ?? '').replace(/\.$/, ''),
    authors,
    firstFamily: authors[0]?.split(' ').slice(0, -1).join(' ') || authors[0],
    journal: r.fulljournalname,
    journalAbbrev: r.source,
    year: (r.pubdate ?? '').slice(0, 4),
    volume: r.volume,
    issue: r.issue,
    pages: r.pages,
    doi: aid('doi')?.toLowerCase(),
    pmid,
    pmcid: aid('pmc') ?? aid('pmcid')?.replace(/^pmc-id:\s*/i, '').replace(/;.*$/, ''),
    pubTypes,
    retracted: pubTypes.some((t) => /retracted publication/i.test(t)),
    concern: pubTypes.some((t) => /expression of concern/i.test(t)),
    fullText: []
  };
}

export async function europepmc(ids: Ids, f: Fetcher): Promise<Rec | null> {
  const q = ids.doi ? `DOI:"${ids.doi}"` : ids.pmid ? `EXT_ID:${ids.pmid} AND SRC:MED` : ids.pmcid ? `PMCID:${ids.pmcid}` : null;
  if (!q) return null;
  const j = await f(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=core&pageSize=1&query=${encodeURIComponent(q)}`);
  const r = j?.resultList?.result?.[0];
  if (!r) return null;
  const authors = (r.authorList?.author ?? []).map((a: any) => (a.lastName ? `${a.lastName} ${a.initials ?? ''}`.trim() : a.fullName ?? a.collectiveName)).filter(Boolean);
  const pubTypes: string[] = r.pubTypeList?.pubType ?? [];
  const cc: any[] = r.commentCorrectionList?.commentCorrection ?? [];
  return {
    source: 'europepmc',
    title: (r.title ?? '').replace(/\.$/, ''),
    authors,
    firstFamily: r.authorList?.author?.[0]?.lastName,
    journal: r.journalInfo?.journal?.title,
    journalAbbrev: r.journalInfo?.journal?.isoabbreviation ?? r.journalInfo?.journal?.medlineAbbreviation,
    year: String(r.journalInfo?.yearOfPublication ?? r.pubYear ?? ''),
    volume: r.journalInfo?.volume,
    issue: r.journalInfo?.issue,
    pages: r.pageInfo,
    doi: r.doi?.toLowerCase(),
    pmid: r.pmid,
    pmcid: r.pmcid,
    pubTypes,
    retracted: pubTypes.some((t) => /retracted publication/i.test(t)) || cc.some((c) => /retraction in/i.test(c.type ?? '')),
    concern: cc.some((c) => /concern/i.test(c.type ?? '')),
    correction: cc.some((c) => /erratum|correction/i.test(c.type ?? '')),
    abstract: r.abstractText?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    preprint: r.source === 'PPR',
    inPMC: r.inPMC === 'Y' || !!r.pmcid,
    isOA: r.isOpenAccess === 'Y',
    fullText: (r.fullTextUrlList?.fullTextUrl ?? []).map((u: any) => ({ url: u.url, style: u.documentStyle, availability: u.availabilityCode ?? u.availability }))
  };
}

export async function unpaywall(doi: string, email: string, f: Fetcher) {
  if (!email) return null;
  const j = await f(`https://api.unpaywall.org/v2/${encodeURIComponent(doi)}?email=${encodeURIComponent(email)}`);
  if (!j || j.error) return null;
  return {
    isOA: !!j.is_oa,
    status: j.oa_status as string | undefined,
    best: j.best_oa_location as null | { url?: string; url_for_pdf?: string; url_for_landing_page?: string; host_type?: string; version?: string }
  };
}

/** Search Europe PMC by free text (title / citation) and return candidate identifiers. */
export async function searchCandidates(text: string, f: Fetcher) {
  const j = await f(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?format=json&resultType=lite&pageSize=5&query=${encodeURIComponent(text.slice(0, 300))}`);
  return ((j?.resultList?.result ?? []) as any[]).map((r) => ({
    title: (r.title ?? '').replace(/\.$/, ''),
    authorString: r.authorString as string,
    journal: r.journalTitle as string,
    year: r.pubYear as string,
    doi: r.doi as string | undefined,
    pmid: r.pmid as string | undefined,
    pmcid: r.pmcid as string | undefined
  }));
}

/* ───────── verification ───────── */

export interface VerifyOptions {
  email: string;
  fetcher?: Fetcher;
  /** the citation text the resident typed, compared against the records when it contains a title */
  claimedText?: string;
}

export async function verifySource(src: SourceRecord, opts: VerifyOptions): Promise<SourceRecord> {
  const f = opts.fetcher ?? browserFetcher;
  const ids: Ids = { ...parseIdentifiers(src.input), ...(src.doi ? { doi: src.doi } : {}), ...(src.pmid ? { pmid: src.pmid } : {}), ...(src.pmcid ? { pmcid: src.pmcid } : {}) };
  const method: string[] = [];
  const notes: string[] = [];
  const mismatches: string[] = [];
  const recs: Rec[] = [];
  let lookupFailed = false;
  const safeCall = async <T,>(label: string, fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (e) {
      lookupFailed = true;
      notes.push(`${label} lookup failed (${(e as Error).message}); try again later.`);
      return null;
    }
  };

  // 1. Europe PMC (resolves PMID/PMCID/DOI to each other)
  const epmc = await safeCall('Europe PMC', () => europepmc(ids, f));
  if (epmc) {
    recs.push(epmc);
    method.push('Europe PMC');
    ids.doi ??= epmc.doi;
    ids.pmid ??= epmc.pmid;
    ids.pmcid ??= epmc.pmcid;
  }
  // 2. Crossref (publisher-deposited metadata)
  if (ids.doi) {
    const cr = await safeCall('Crossref', () => crossref(ids.doi!, f));
    if (cr) {
      recs.push(cr);
      method.push('Crossref');
    } else notes.push('DOI did not resolve in Crossref.');
  }
  // 3. PubMed
  if (!ids.pmid && ids.doi) ids.pmid = (await safeCall('PubMed search', () => pubmedSearchByDoi(ids.doi!, f))) ?? undefined;
  if (ids.pmid) {
    const pm = await safeCall('PubMed', () => pubmed(ids.pmid!, f));
    if (pm) {
      recs.push(pm);
      method.push('PubMed');
      ids.pmcid ??= pm.pmcid;
      ids.doi ??= pm.doi;
    }
  }

  const out: SourceRecord = structuredClone(src);
  if (!recs.length) {
    out.verification = {
      status: lookupFailed ? 'unverified' : 'notfound',
      checkedAt: new Date().toISOString(),
      method,
      mismatches,
      notes: lookupFailed ? notes : [...notes, 'No record found in Crossref, PubMed or Europe PMC for this identifier. Check it, or remove the source.']
    };
    return out;
  }

  // Canonical metadata: Crossref for bibliographic fields, PubMed/Europe PMC for abbreviations and abstracts.
  const cr = recs.find((r) => r.source === 'crossref');
  const pm = recs.find((r) => r.source === 'pubmed');
  const ep = recs.find((r) => r.source === 'europepmc');
  const primary = cr ?? pm ?? ep!;
  out.doi = ids.doi;
  out.pmid = ids.pmid;
  out.pmcid = ids.pmcid;
  out.title = primary.title ?? pm?.title ?? ep?.title;
  out.authors = (pm?.authors.length ? pm.authors : primary.authors.length ? primary.authors : ep?.authors) ?? [];
  out.journal = primary.journal ?? pm?.journal ?? ep?.journal;
  out.journalAbbrev = pm?.journalAbbrev ?? ep?.journalAbbrev ?? cr?.journalAbbrev;
  out.year = primary.year || pm?.year || ep?.year;
  out.volume = primary.volume ?? pm?.volume ?? ep?.volume;
  out.issue = primary.issue ?? pm?.issue ?? ep?.issue;
  out.pages = primary.pages ?? pm?.pages ?? ep?.pages;
  out.pubTypes = [...new Set(recs.flatMap((r) => r.pubTypes))];
  out.abstract = ep?.abstract ?? out.abstract;
  out.landingUrl = ids.doi ? `https://doi.org/${ids.doi}` : ids.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${ids.pmid}/` : undefined;

  // Cross-check fields between independent records
  const pairs: [Rec, Rec][] = [];
  for (let i = 0; i < recs.length; i++) for (let j = i + 1; j < recs.length; j++) pairs.push([recs[i], recs[j]]);
  for (const [a, b] of pairs) {
    const tag = `${a.source} vs ${b.source}`;
    if (a.title && b.title && similarity(a.title, b.title) < 0.7) mismatches.push(`Title differs (${tag})`);
    if (a.year && b.year && Math.abs(Number(a.year) - Number(b.year)) > 1) mismatches.push(`Year differs: ${a.year} vs ${b.year} (${tag})`);
    if (a.volume && b.volume && a.volume !== b.volume) mismatches.push(`Volume differs: ${a.volume} vs ${b.volume} (${tag})`);
    if (a.pages && b.pages && firstPage(a.pages) !== firstPage(b.pages)) mismatches.push(`Pages differ: ${a.pages} vs ${b.pages} (${tag})`);
    if (a.firstFamily && b.firstFamily && norm(a.firstFamily) !== norm(b.firstFamily)) mismatches.push(`First author differs: ${a.firstFamily} vs ${b.firstFamily} (${tag})`);
    if (a.doi && b.doi && a.doi !== b.doi) mismatches.push(`DOI differs (${tag})`);
  }
  // Compare with what the resident claimed (if they pasted a citation with a title)
  const claimed = opts.claimedText ?? src.input;
  if (claimed && claimed.length > 40 && out.title) {
    const sim = similarity(claimed, out.title);
    if (sim < 0.5) mismatches.push('The citation you entered does not match the title found for this identifier. Check that the DOI/PMID belongs to the paper you meant.');
  }

  const retracted = recs.some((r) => r.retracted);
  const concern = recs.some((r) => r.concern);
  if (recs.some((r) => r.correction)) notes.push('A correction or erratum is linked to this article; check whether it affects the findings you cite.');
  if (concern) notes.push('An expression of concern is linked to this article.');

  // Access / open-access links
  const ua = ids.doi ? await safeCall('Unpaywall', () => unpaywall(ids.doi!, opts.email, f)) : null;
  if (ua) method.push('Unpaywall');
  else if (ids.doi && !opts.email) notes.push('Add your email in Settings to enable Unpaywall open-access checks.');
  const epPdf = ep?.fullText.find((u) => u.style === 'pdf' && /^(OA|F)$/i.test(u.availability));
  const epHtml = ep?.fullText.find((u) => u.style === 'html' && /^(OA|F)$/i.test(u.availability));
  let access: Access = 'unknown';
  let pdfUrl: string | undefined;
  let fullTextUrl: string | undefined;
  const preprint = recs.some((r) => r.preprint);
  if (preprint) {
    access = 'preprint';
    fullTextUrl = ua?.best?.url_for_landing_page ?? ua?.best?.url ?? out.landingUrl;
    pdfUrl = ua?.best?.url_for_pdf;
  } else if (ids.pmcid && (ep?.inPMC || ep?.isOA || epPdf || epHtml)) {
    access = 'pmc';
    fullTextUrl = `https://pmc.ncbi.nlm.nih.gov/articles/${ids.pmcid}/`;
    pdfUrl = epPdf?.url ?? (ua?.best?.url_for_pdf || undefined);
  } else if (ua?.isOA && ua.best) {
    access = ua.best.host_type === 'repository' ? 'repository' : 'publisher';
    fullTextUrl = ua.best.url_for_landing_page ?? ua.best.url;
    pdfUrl = ua.best.url_for_pdf ?? undefined;
    if (ua.best.version && ua.best.version !== 'publishedVersion') notes.push(`Open copy is the ${ua.best.version.replace('Version', ' version')}.`);
  } else if (epPdf || epHtml) {
    access = 'publisher';
    fullTextUrl = (epHtml ?? epPdf)!.url;
    pdfUrl = epPdf?.url;
  } else if (ua && !ua.isOA) {
    access = 'subscription';
  } else if (!opts.email && ids.doi) {
    access = 'unknown';
  } else access = 'subscription';
  out.access = access;
  out.oaStatus = ua?.status;
  out.fullTextUrl = fullTextUrl;
  out.pdfUrl = pdfUrl;

  let status: VStatus;
  if (retracted) status = 'retracted';
  else if (recs.length >= 2 && mismatches.length === 0) status = 'verified';
  else status = 'partial';
  if (recs.length === 1 && status === 'partial') notes.push(`Found in only one index (${recs[0].source}); confirm details against the publisher page.`);

  out.verification = { status, checkedAt: new Date().toISOString(), method, mismatches, notes };
  return out;
}

export function newSource(input: string, addedBy: 'resident' | 'ai' = 'resident'): SourceRecord {
  return {
    id: uid('s'),
    input: input.trim(),
    include: true,
    addedBy,
    addedAt: new Date().toISOString(),
    authors: [],
    pubTypes: [],
    access: 'unknown',
    verification: { status: 'unverified', method: [], mismatches: [], notes: [] },
    annotation: { level: '', design: '', sample: '', findings: '', strengths: '', limitations: '', relevance: '', readFullText: false }
  };
}

/** Compare a fresh verification with the previous record for the recheck pass. */
export function recheckDiff(before: SourceRecord, after: SourceRecord): string[] {
  const diffs: string[] = [];
  const fields: (keyof SourceRecord)[] = ['title', 'year', 'volume', 'pages', 'doi', 'pmid', 'pmcid', 'access', 'pdfUrl'];
  for (const k of fields) if ((before[k] ?? '') !== (after[k] ?? '') && before.verification.checkedAt) diffs.push(`${String(k)} changed`);
  if (before.verification.status !== after.verification.status && before.verification.checkedAt) diffs.push(`status ${before.verification.status} → ${after.verification.status}`);
  return diffs;
}

/* ───────── AMA citation ───────── */

export function amaCitation(s: SourceRecord): string {
  if (!s.title) return s.input;
  const a = s.authors;
  const authors = a.length === 0 ? '' : a.length > 6 ? `${a.slice(0, 3).join(', ')}, et al. ` : `${a.join(', ')}. `;
  const journal = s.journalAbbrev || s.journal || '';
  const vol = s.volume ? `;${s.volume}` : '';
  const iss = s.issue ? `(${s.issue})` : '';
  const pages = s.pages ? `:${s.pages}` : '';
  const doi = s.doi ? ` doi:${s.doi}` : '';
  return `${authors}${s.title.replace(/\.$/, '')}. ${journal ? `${journal}. ` : ''}${s.year ?? ''}${vol}${iss}${pages}.${doi}`.replace(/\s+/g, ' ').trim();
}

export const ACCESS_LABEL: Record<Access, string> = {
  pmc: 'Open – PMC',
  publisher: 'Open – publisher',
  repository: 'Open – repository copy',
  preprint: 'Preprint (not peer reviewed)',
  subscription: 'Subscription',
  unknown: 'Access not checked'
};

export const STATUS_LABEL: Record<VStatus, string> = {
  verified: 'Verified',
  partial: 'Partially verified',
  unverified: 'Unverified',
  notfound: 'Not found',
  retracted: 'Retracted'
};

export const isOpen = (a: Access) => a === 'pmc' || a === 'publisher' || a === 'repository';
