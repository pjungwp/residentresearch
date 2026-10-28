/**
 * Citation lookup proxy (Netlify Edge Function).
 * Used only as a fallback when a scholarly index blocks a direct browser request.
 * Strict host allowlist; GET only; JSON passthrough; cached for an hour.
 */
const ALLOWED = new Set(['eutils.ncbi.nlm.nih.gov', 'api.crossref.org', 'api.unpaywall.org', 'www.ebi.ac.uk']);

export default async (req: Request) => {
  if (req.method !== 'GET') return new Response('Method not allowed', { status: 405 });
  const target = new URL(req.url).searchParams.get('u');
  if (!target) return new Response('Missing u', { status: 400 });
  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return new Response('Bad URL', { status: 400 });
  }
  if (url.protocol !== 'https:' || !ALLOWED.has(url.host)) return new Response('Host not allowed', { status: 403 });

  const upstream = await fetch(url.toString(), {
    headers: { accept: 'application/json', 'user-agent': 'ResearchConcierge/1.0 (mailto:research-concierge@example.org)' }
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
      'cache-control': upstream.ok ? 'public, max-age=3600' : 'no-store'
    }
  });
};

export const config = {
  path: '/api/lit',
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
