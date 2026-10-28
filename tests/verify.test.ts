import { describe, expect, it } from 'vitest';
import { amaCitation, newSource, parseIdentifiers, similarity, verifySource, type Fetcher } from '@/lib/verify';

const DOI = '10.1097/gme.0000000000002028';
const crossrefOk = { message: { DOI, title: ['The 2022 hormone therapy position statement of The North American Menopause Society'], author: [{ given: 'Stephanie S', family: 'Faubion' }, { given: 'Carolyn J', family: 'Crandall' }], 'container-title': ['Menopause'], 'short-container-title': ['Menopause'], issued: { 'date-parts': [[2022, 7, 1]] }, volume: '29', issue: '7', page: '767-794', type: 'journal-article' } };
const pubmedOk = { result: { '35797481': { uid: '35797481', title: 'The 2022 hormone therapy position statement of The North American Menopause Society.', authors: [{ name: 'Faubion SS', authtype: 'Author' }], source: 'Menopause', fulljournalname: 'Menopause (New York, N.Y.)', pubdate: '2022 Jul 1', volume: '29', issue: '7', pages: '767-794', articleids: [{ idtype: 'doi', value: DOI }], pubtype: ['Journal Article'] } } };
const epmcOk = (extra: any = {}) => ({ resultList: { result: [{ source: 'MED', pmid: '35797481', doi: DOI, title: 'The 2022 hormone therapy position statement of The North American Menopause Society.', authorList: { author: [{ lastName: 'Faubion', initials: 'SS' }] }, journalInfo: { volume: '29', issue: '7', yearOfPublication: 2022, journal: { title: 'Menopause', isoabbreviation: 'Menopause' } }, pageInfo: '767-794', abstractText: 'Abstract text.', isOpenAccess: 'N', inPMC: 'N', pubTypeList: { pubType: ['Journal Article'] }, fullTextUrlList: { fullTextUrl: [] }, ...extra }] } });

function fake(routes: Record<string, any>): Fetcher {
  return async (url) => {
    for (const [k, v] of Object.entries(routes)) if (url.includes(k)) return typeof v === 'function' ? v(url) : v;
    return null;
  };
}

describe('identifier parsing', () => {
  it('parses DOI, PMID, PMCID and URLs', () => {
    expect(parseIdentifiers('https://doi.org/10.1097/GME.0000000000002028.')).toEqual({ doi: DOI });
    expect(parseIdentifiers('PMID: 35797481')).toEqual({ pmid: '35797481' });
    expect(parseIdentifiers('35797481')).toEqual({ pmid: '35797481' });
    expect(parseIdentifiers('https://pubmed.ncbi.nlm.nih.gov/35797481/')).toEqual({ pmid: '35797481' });
    expect(parseIdentifiers('PMC9876543')).toEqual({ pmcid: 'PMC9876543' });
    expect(parseIdentifiers('Faubion SS. The 2022 HT position statement').text).toBeTruthy();
  });
  it('scores title similarity', () => {
    expect(similarity('The 2022 hormone therapy position statement', 'the 2022 Hormone Therapy Position Statement.')).toBeGreaterThan(0.9);
    expect(similarity('Postpartum blood pressure follow up', 'Osteoporosis in men')).toBeLessThan(0.2);
  });
});

describe('verifySource', () => {
  const base = { 'api.crossref.org': crossrefOk, 'esearch.fcgi': { esearchresult: { idlist: ['35797481'] } }, 'esummary.fcgi': pubmedOk };

  it('verifies when independent indexes agree', async () => {
    const out = await verifySource(newSource(DOI), { email: '', fetcher: fake({ ...base, 'europepmc': epmcOk() }) });
    expect(out.verification.status).toBe('verified');
    expect(out.verification.method).toEqual(expect.arrayContaining(['Crossref', 'PubMed', 'Europe PMC']));
    expect(out.pmid).toBe('35797481');
    expect(out.title).toMatch(/2022 hormone therapy/);
    expect(amaCitation(out)).toContain('Menopause. 2022;29(7):767-794. doi:10.1097/gme');
  });

  it('flags mismatched fields as partially verified', async () => {
    const bad = structuredClone(pubmedOk);
    (bad.result as any)['35797481'].volume = '31';
    const out = await verifySource(newSource(DOI), { email: '', fetcher: fake({ ...base, 'esummary.fcgi': bad, 'europepmc': epmcOk() }) });
    expect(out.verification.status).toBe('partial');
    expect(out.verification.mismatches.join(' ')).toMatch(/Volume differs/);
  });

  it('flags retractions', async () => {
    const out = await verifySource(newSource(DOI), { email: '', fetcher: fake({ ...base, 'europepmc': epmcOk({ pubTypeList: { pubType: ['Journal Article', 'Retracted Publication'] } }) }) });
    expect(out.verification.status).toBe('retracted');
  });

  it('reports not found without inventing metadata', async () => {
    const out = await verifySource(newSource('10.9999/does-not-exist'), { email: '', fetcher: fake({}) });
    expect(out.verification.status).toBe('notfound');
    expect(out.title).toBeUndefined();
  });

  it('warns when a pasted citation does not match the identifier', async () => {
    const out = await verifySource(newSource(`Smith J. Outcomes of vaginal birth after cesarean in rural hospitals. Obstet Gynecol. 2019. doi:${DOI}`), { email: '', fetcher: fake({ ...base, 'europepmc': epmcOk() }) });
    expect(out.verification.status).toBe('partial');
    expect(out.verification.mismatches.join(' ')).toMatch(/does not match/);
  });

  it('prefers PMC open-access links and PDF from Europe PMC', async () => {
    const out = await verifySource(newSource(DOI), {
      email: 'a@b.org',
      fetcher: fake({ ...base, 'europepmc': epmcOk({ pmcid: 'PMC123456', inPMC: 'Y', isOpenAccess: 'Y', fullTextUrlList: { fullTextUrl: [{ availabilityCode: 'OA', documentStyle: 'pdf', url: 'https://europepmc.org/articles/PMC123456?pdf=render' }] } }), 'api.unpaywall.org': { is_oa: true, oa_status: 'green', best_oa_location: { host_type: 'repository', url: 'https://x' } } })
    });
    expect(out.access).toBe('pmc');
    expect(out.fullTextUrl).toBe('https://pmc.ncbi.nlm.nih.gov/articles/PMC123456/');
    expect(out.pdfUrl).toBe('https://europepmc.org/articles/PMC123456?pdf=render');
  });

  it('classifies paywalled articles as subscription via Unpaywall', async () => {
    const out = await verifySource(newSource(DOI), { email: 'a@b.org', fetcher: fake({ ...base, 'europepmc': epmcOk(), 'api.unpaywall.org': { is_oa: false, oa_status: 'closed', best_oa_location: null } }) });
    expect(out.access).toBe('subscription');
    expect(out.pdfUrl).toBeUndefined();
  });

  it('marks lookups that fail as unverified, not verified', async () => {
    const boom: Fetcher = async () => {
      throw new Error('network');
    };
    const out = await verifySource(newSource(DOI), { email: '', fetcher: boom });
    expect(out.verification.status).toBe('unverified');
  });
});
