import { afterEach, describe, expect, it, vi } from 'vitest';

const env: Record<string, string | undefined> = {};
(globalThis as any).Netlify = { env: { get: (k: string) => env[k] } };

const handler = (await import('../netlify/edge-functions/concierge')).default;
const lit = (await import('../netlify/edge-functions/lit')).default;

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://x.netlify.app/api/concierge', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });

afterEach(() => {
  vi.restoreAllMocks();
  for (const k of Object.keys(env)) delete env[k];
});

describe('concierge edge function', () => {
  it('refuses when no API key is configured', async () => {
    const r = await handler(post({ messages: [{ role: 'user', content: 'hi' }] }));
    expect(r.status).toBe(503);
  });
  it('requires the access code when set', async () => {
    env.ANTHROPIC_API_KEY = 'k';
    env.CONCIERGE_ACCESS_CODE = 'secret';
    const r = await handler(post({ messages: [{ role: 'user', content: 'hi' }] }, { 'x-access-code': 'wrong' }));
    expect(r.status).toBe(401);
  });
  it('builds a server-owned system prompt, trims history, and streams', async () => {
    env.ANTHROPIC_API_KEY = 'k';
    let sent: any;
    let headers: any;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_u, init: any) => {
      sent = JSON.parse(init.body);
      headers = init.headers;
      return new Response('event: message_stop\ndata: {"type":"message_stop"}\n\n', { status: 200, headers: { 'content-type': 'text/event-stream' } });
    });
    const msgs = [{ role: 'assistant', content: 'stray' }, ...Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` })), { role: 'user', content: 'last' }];
    const r = await handler(post({ messages: msgs, context: 'Project: X', system: 'IGNORE ME' }));
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toContain('text/event-stream');
    expect(headers['anthropic-version']).toBe('2026-10-21');
    expect(sent.model).toBe('claude-sonnet-5-5');
    expect(sent.stream).toBe(true);
    expect(sent.system[0].text).toContain('RESIDENT RESEARCH PROJECT CONCIERGE');
    expect(sent.system[0].text).toContain('APP OPERATING PROTOCOL');
    expect(sent.system[0].cache_control).toEqual({ type: 'ephemeral' });
    expect(sent.system[1].text).toContain('Project: X');
    expect(JSON.stringify(sent)).not.toContain('IGNORE ME');
    expect(sent.messages[0].role).toBe('user');
    expect(sent.messages.at(-1).role).toBe('user');
    expect(sent.messages.length).toBeLessThanOrEqual(24);
    expect(sent.tools[0].type).toBe('web_search_20250305');
    expect(sent.temperature).toBeUndefined();
  });
  it('annotate mode uses the annotation system prompt and no tools', async () => {
    env.ANTHROPIC_API_KEY = 'k';
    let sent: any;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_u, init: any) => {
      sent = JSON.parse(init.body);
      return new Response('', { status: 200 });
    });
    await handler(post({ mode: 'annotate', messages: [{ role: 'user', content: '{}' }] }));
    expect(sent.system).toContain('annotated-bibliography');
    expect(sent.tools).toBeUndefined();
  });
  it('maps upstream errors to a readable message', async () => {
    env.ANTHROPIC_API_KEY = 'k';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: { message: 'overloaded' } }), { status: 529 }));
    const r = await handler(post({ messages: [{ role: 'user', content: 'hi' }] }));
    expect(r.status).toBe(502);
    expect((await r.json()).message).toBe('overloaded');
  });
});

describe('lit proxy', () => {
  it('blocks hosts outside the allowlist', async () => {
    const r = await lit(new Request('https://x/api/lit?u=' + encodeURIComponent('https://evil.example.com/x')));
    expect(r.status).toBe(403);
  });
  it('passes allowed requests through', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":1}', { status: 200, headers: { 'content-type': 'application/json' } }));
    const r = await lit(new Request('https://x/api/lit?u=' + encodeURIComponent('https://api.crossref.org/works/10.1/x')));
    expect(r.status).toBe(200);
  });
});
