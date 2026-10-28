import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Square, RotateCcw, Sparkles, Check, Pencil, X, BookPlus, ShieldAlert, Globe, AlertTriangle, ArrowRight, Lightbulb, Compass, ClipboardCheck } from 'lucide-react';
import { useProjectCtx } from '@/components/shell';
import { askConcierge, buildContext, extractIdentifiers, historyForApi, parseProposals, phiWarnings, splitWithProposals, AIError, type Proposal } from '@/lib/ai';
import { fieldByKey, TONE_CLASSES, WEEKS } from '@/content/fields';
import { fv, fstatus, setField, setSettings, uid, useSettings } from '@/lib/store';
import { newSource, verifySource } from '@/lib/verify';
import { weekRequirements } from '@/lib/progress';
import type { ChatMessage, Project } from '@/lib/types';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/components/ui/Toast';
import { StatusText } from '@/components/fields';

export function Markdown({ text }: { text: string }) {
  return (
    <div className="md text-[15px] leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> }}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

/** Next concrete step for the current week, from real requirements. */
function nextAction(p: Project) {
  const reqs = weekRequirements(p, p.currentWeek).filter((r) => !r.done);
  return reqs[0];
}

export function StudioPage() {
  const { project, update } = useProjectCtx();
  usePageTitle(`Studio · ${project.title}`);
  const settings = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const loc = useLocation();
  const week = WEEKS[project.currentWeek - 1];
  const tone = TONE_CLASSES[week.tone];
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState<{ text: string; citations: { url: string; title: string }[]; searches: string[] } | null>(null);
  const [phi, setPhi] = useState<string[] | null>(null);
  const [needNotice, setNeedNotice] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Prefill from a week page action (navigate with state.prompt)
  useEffect(() => {
    const s = loc.state as { prompt?: string } | null;
    if (s?.prompt) {
      setDraft(s.prompt);
      navigate(loc.pathname, { replace: true, state: null });
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [loc.state, loc.pathname, navigate]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [project.chat.length, streaming?.text]);

  const send = async (text: string, opts: { skipPhi?: boolean; retryOf?: string } = {}) => {
    const t = text.trim();
    if (!t || streaming) return;
    if (!settings.aiNoticeAccepted) {
      setNeedNotice(true);
      return;
    }
    if (!opts.skipPhi) {
      const w = phiWarnings(t);
      if (w.length) {
        setPhi(w);
        return;
      }
    }
    setPhi(null);
    // Append the user message (unless retrying an earlier one) and drop any failed reply.
    let chat = project.chat.filter((m) => !m.error);
    if (!opts.retryOf) {
      const userMsg: ChatMessage = { id: uid('m'), role: 'user', text: t, at: new Date().toISOString(), week: project.currentWeek };
      chat = [...chat, userMsg];
      update((p) => {
        p.chat = chat;
      });
      setDraft('');
    } else {
      update((p) => {
        p.chat = chat;
      });
    }
    const ctl = new AbortController();
    abortRef.current = ctl;
    const acc = { text: '', citations: [] as { url: string; title: string }[], searches: [] as string[] };
    setStreaming({ ...acc });
    try {
      const { stopReason } = await askConcierge(
        { mode: 'chat', messages: historyForApi(chat), context: buildContext(project, project.currentWeek), signal: ctl.signal },
        {
          onText: (d) => {
            acc.text += d;
            setStreaming({ ...acc });
          },
          onCitation: (c) => {
            if (!acc.citations.some((x) => x.url === c.url)) acc.citations.push(c);
          },
          onSearch: (q) => {
            acc.searches.push(q);
            setStreaming({ ...acc });
          }
        }
      );
      let finalText = acc.text;
      if (stopReason === 'pause_turn') finalText += '\n\n_(Search paused — ask me to continue.)_';
      if (stopReason === 'max_tokens') finalText += '\n\n_(Reply cut short — ask me to continue.)_';
      update((p) => {
        p.chat.push({ id: uid('m'), role: 'assistant', text: finalText, citations: acc.citations, searches: acc.searches, at: new Date().toISOString(), week: project.currentWeek });
      });
    } catch (e) {
      const aborted = (e as Error).name === 'AbortError';
      const msg = aborted ? 'Stopped.' : e instanceof AIError ? e.message : 'Something went wrong. Your work is saved.';
      update((p) => {
        if (acc.text.trim()) p.chat.push({ id: uid('m'), role: 'assistant', text: acc.text + (aborted ? '\n\n_(Stopped.)_' : ''), at: new Date().toISOString(), week: project.currentWeek });
        else if (!aborted) p.chat.push({ id: uid('m'), role: 'assistant', text: '', error: msg, at: new Date().toISOString() });
      });
    } finally {
      setStreaming(null);
      abortRef.current = null;
    }
  };

  const lastUser = [...project.chat].reverse().find((m) => m.role === 'user');
  const next = nextAction(project);
  const empty = project.chat.length === 0 && !streaming;

  const actions = useMemo(
    () => [
      ...week.actions.slice(0, 3),
      { label: 'Propose Blueprint update', prompt: `Based on our conversation, propose updates for the Week ${week.n} Blueprint fields that are still unknown or weak. Use proposal blocks.` },
      { label: 'Draft current assignment', prompt: `Help me draft my Week ${week.n} deliverable (${week.deliverable}) from what is already in my Blueprint. Point out what is missing; do not invent details.` }
    ],
    [week]
  );

  return (
    <div className="mx-auto flex h-[calc(100dvh-var(--header-h)-18px-var(--bottom-nav-h)-var(--safe-bottom))] max-w-[920px] flex-col min-[600px]:h-[calc(100dvh-var(--header-h)-18px)]">
      {/* Compact assignment context */}
      <div className="shrink-0 px-[var(--gutter)] pt-3">
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-line px-3 py-2 ${tone.soft}`}>
          <span className={`text-[12.5px] font-bold uppercase tracking-[0.08em] ${tone.text}`}>Week {week.n} · {week.short}</span>
          <span className="min-w-0 flex-1 truncate text-[14px]">{week.deliverable}</span>
          <Link to={`/p/${project.id}/week/${week.n}`} className="text-[13.5px] font-semibold">
            Assignment
          </Link>
        </div>
        {next && (
          <p className="mt-1.5 flex items-center gap-1.5 px-1 text-[13px] text-slate">
            <ArrowRight size={14} className="shrink-0 text-teal" aria-hidden />
            <span className="min-w-0 truncate">
              Next: <strong className="font-semibold text-ink">{next.label}</strong>
            </span>
          </p>
        )}
      </div>

      {/* Conversation */}
      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--gutter)] py-3" aria-live="polite" aria-busy={!!streaming}>
        {empty && <Welcome project={project} onPick={(t) => send(t)} />}
        <ol className="space-y-4">
          {project.chat.map((m) => (
            <li key={m.id}>
              {m.role === 'user' ? (
                <div className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] text-white">
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              ) : m.error ? (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-err bg-err-soft px-3 py-2.5 text-[14px] text-err" role="alert">
                  <AlertTriangle size={16} aria-hidden /> <span className="flex-1">{m.error} Your Blueprint and drafts are safe.</span>
                  {lastUser && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => send(lastUser.text, { skipPhi: true, retryOf: lastUser.id })}>
                      <RotateCcw size={15} aria-hidden /> Retry
                    </button>
                  )}
                </div>
              ) : (
                <AssistantMessage m={m} project={project} update={update} />
              )}
            </li>
          ))}
          {streaming && (
            <li>
              <div className="flex gap-3">
                <MentorAvatar />
                <div className="min-w-0 flex-1">
                  {streaming.searches.length > 0 && (
                    <p className="mb-1 flex items-center gap-1.5 text-[13px] text-slate">
                      <Globe size={14} aria-hidden /> Searched: {streaming.searches.join(' · ')}
                    </p>
                  )}
                  {streaming.text ? (
                    splitWithProposals(streaming.text).map((part, i) => (part.kind === 'md' ? <Markdown key={i} text={part.text} /> : <p key={i} className="my-2 text-[13px] text-slate">Preparing a suggestion…</p>))
                  ) : (
                    <p className="text-[14px] text-slate">Thinking…</p>
                  )}
                </div>
              </div>
            </li>
          )}
        </ol>
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-line bg-page px-[var(--gutter)] pb-3 pt-2">
        {needNotice && (
          <AINotice
            onAccept={() => {
              setSettings({ aiNoticeAccepted: true });
              setNeedNotice(false);
              toast('Thanks — you can send your message now.');
            }}
            onCancel={() => setNeedNotice(false)}
          />
        )}
        {phi && (
          <div className="mb-2 rounded-xl border border-err bg-err-soft p-3 text-[14px]" role="alert">
            <p className="flex items-center gap-1.5 font-semibold text-err">
              <ShieldAlert size={16} aria-hidden /> This message may contain {phi.join(', ')}.
            </p>
            <p className="mt-1">Do not share patient-identifying information with the AI mentor. Edit the message, or send it if you are sure it is de-identified.</p>
            <div className="mt-2 flex gap-2">
              <button className="btn btn-secondary btn-sm" onClick={() => { setPhi(null); inputRef.current?.focus(); }}>Edit message</button>
              <button className="btn btn-ghost btn-sm" onClick={() => send(draft, { skipPhi: true })}>It’s de-identified — send</button>
            </div>
          </div>
        )}
        <div className="scroll-x-chips mb-2" role="group" aria-label="Suggested actions">
          {actions.map((a) => (
            <button key={a.label} type="button" className="chip !min-h-[34px] text-[13.5px]" disabled={!!streaming} onClick={() => send(a.prompt)}>
              <Sparkles size={14} className="text-teal" aria-hidden /> {a.label}
            </button>
          ))}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(draft);
          }}
        >
          <label htmlFor="composer" className="sr-only">
            Message your research mentor
          </label>
          <textarea
            id="composer"
            ref={inputRef}
            rows={1}
            className="input max-h-[40vh] min-h-[48px] flex-1 resize-none !rounded-2xl"
            placeholder="Message your research mentor…"
            value={draft}
            enterKeyHint="send"
            onChange={(e) => {
              setDraft(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, window.innerHeight * 0.4)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send(draft);
              }
            }}
          />
          {streaming ? (
            <button type="button" className="btn btn-secondary !h-12 !w-12 !p-0" aria-label="Stop" onClick={() => abortRef.current?.abort()}>
              <Square size={18} aria-hidden />
            </button>
          ) : (
            <button type="submit" className="btn btn-primary !h-12 !w-12 !p-0" aria-label="Send" disabled={!draft.trim()}>
              <Send size={18} aria-hidden />
            </button>
          )}
        </form>
        <p className="mt-1.5 text-[12px] text-slate">AI suggestions can be wrong. Nothing enters your Blueprint until you accept it. No patient information.</p>
      </div>
    </div>
  );
}

function MentorAvatar() {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-w1-soft text-w1-text" aria-hidden>
      <Sparkles size={16} />
    </span>
  );
}

function Welcome({ project, onPick }: { project: Project; onPick: (t: string) => void }) {
  const options = [
    { icon: Lightbulb, title: 'Explore an idea', text: 'I have a general interest or a clinical observation. Help me find a meaningful, feasible research problem.' },
    { icon: Compass, title: 'Refine an existing project', text: 'I already have a question or a partial plan. Help me sharpen it.' },
    { icon: ClipboardCheck, title: 'Critique my proposal', text: '/critique I have a draft proposal. Review it for methodological readiness.' }
  ];
  const story = fv(project, 'story.wondered');
  return (
    <div className="mx-auto max-w-[640px] py-4">
      <div className="flex gap-3">
        <MentorAvatar />
        <div className="text-[15px] leading-relaxed">
          <p>
            Welcome to your Research Studio. I’ll help you turn an idea into a feasible proposal over five weeks — question, evidence, methods, planning and an IRB draft. You don’t need a complete idea to begin.
          </p>
          <p className="mt-2">{story ? 'I can see your story has started. Want to keep going from there?' : 'What clinical, educational or healthcare problem would you like to investigate?'}</p>
        </div>
      </div>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <li key={o.title}>
            <button type="button" onClick={() => onPick(o.text)} className="card h-full w-full p-3 text-left hover:border-teal">
              <o.icon size={20} className="text-teal" aria-hidden />
              <span className="mt-1.5 block text-[14.5px] font-semibold">{o.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AINotice({ onAccept, onCancel }: { onAccept: () => void; onCancel: () => void }) {
  return (
    <div className="mb-2 rounded-xl border border-w1 bg-w1-soft p-3 text-[14px]" role="dialog" aria-label="Before you use the AI mentor">
      <p className="font-semibold">Before you use the AI mentor</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-5">
        <li>Your messages and Blueprint are sent to Claude (Anthropic) through your program’s server to generate replies.</li>
        <li>Never include patient names, record numbers, dates of birth or other PHI, or identifiable trainee evaluations.</li>
        <li>AI can be wrong. Verify facts and citations; your mentor and IRB make the decisions.</li>
      </ul>
      <div className="mt-2 flex gap-2">
        <button className="btn btn-primary btn-sm" onClick={onAccept}>I understand</button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Not now</button>
      </div>
    </div>
  );
}

/* ───────── assistant message with proposals and source chips ───────── */

function AssistantMessage({ m, project, update }: { m: ChatMessage; project: Project; update: (fn: (p: Project) => void) => void }) {
  const proposals = useMemo(() => parseProposals(m.text), [m.text]);
  const parts = useMemo(() => splitWithProposals(m.text), [m.text]);
  const ids = useMemo(() => extractIdentifiers(m.text), [m.text]);
  return (
    <div className="flex gap-3">
      <MentorAvatar />
      <div className="min-w-0 flex-1">
        {m.searches && m.searches.length > 0 && (
          <p className="mb-1 flex items-center gap-1.5 text-[13px] text-slate">
            <Globe size={14} aria-hidden /> Searched: {m.searches.join(' · ')}
          </p>
        )}
        {parts.map((part, i) =>
          part.kind === 'md' ? (
            <Markdown key={i} text={part.text} />
          ) : proposals[part.index] ? (
            <ProposalCard key={i} pr={proposals[part.index]} msg={m} project={project} update={update} />
          ) : null
        )}
        {ids.length > 0 && <AddSources ids={ids} project={project} update={update} />}
        {m.citations && m.citations.length > 0 && (
          <details className="mt-2 text-[13px]">
            <summary className="cursor-pointer font-semibold text-slate">Web sources ({m.citations.length})</summary>
            <ul className="mt-1 space-y-0.5">
              {m.citations.map((c) => (
                <li key={c.url}>
                  <a href={c.url} target="_blank" rel="noopener noreferrer">
                    {c.title}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

function ProposalCard({ pr, msg, project, update }: { pr: Proposal; msg: ChatMessage; project: Project; update: (fn: (p: Project) => void) => void }) {
  const handled = msg.handled?.[pr.id];
  const def = fieldByKey[pr.field];
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(pr.value);
  const current = def ? fv(project, def.key) : '';
  const status = def ? fstatus(project, def.key) : 'unknown';
  const overwrites = status === 'confirmed' && current.trim() && current.trim() !== pr.value.trim();

  const mark = (h: 'accepted' | 'edited' | 'dismissed', p: Project) => {
    const m = p.chat.find((x) => x.id === msg.id);
    if (m) m.handled = { ...(m.handled ?? {}), [pr.id]: h };
  };
  const accept = (value: string, how: 'accepted' | 'edited') =>
    update((p) => {
      setField(p, pr.field, value, { origin: how === 'edited' ? 'resident' : 'ai', status: 'confirmed' });
      mark(how, p);
    });

  if (!pr.valid || !def)
    return (
      <div className="my-2 rounded-xl border border-line bg-surface-2 px-3 py-2 text-[13px] text-slate">
        A suggestion could not be applied ({pr.problem}). You can still copy the text: <span className="text-ink">{pr.value}</span>
      </div>
    );

  return (
    <div className={`my-3 overflow-hidden rounded-xl border bg-surface ${handled ? 'border-line opacity-80' : 'border-w1'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-w1-soft px-3 py-2">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-w1-text">
          <Sparkles size={14} aria-hidden /> Suggested Blueprint update · {def.label}
        </p>
        <span className="text-[12.5px] text-slate">
          Now: <StatusText status={status} />
        </span>
      </div>
      <div className="px-3 py-2.5">
        {editing ? (
          def.kind === 'select' ? (
            <select className="input" value={val} onChange={(e) => setVal(e.target.value)} aria-label={`Edit ${def.label}`}>
              {def.options!.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ) : (
            <textarea className="input min-h-[96px]" value={val} onChange={(e) => setVal(e.target.value)} aria-label={`Edit ${def.label}`} autoFocus />
          )
        ) : (
          <p className="whitespace-pre-wrap text-[15px]">{pr.value}</p>
        )}
        {pr.note && <p className="mt-1.5 text-[13px] text-slate">Why: {pr.note}</p>}
        {overwrites && !handled && (
          <p className="mt-2 rounded-lg bg-warn-soft px-2.5 py-1.5 text-[13px] text-warn">
            <strong>This would replace your confirmed text:</strong> “{current.slice(0, 160)}{current.length > 160 ? '…' : ''}”. The earlier version stays in revision history.
          </p>
        )}
        <div className="mt-2.5 flex flex-wrap gap-2">
          {handled ? (
            <p className="flex items-center gap-1.5 text-[13.5px] font-semibold text-slate">
              {handled === 'dismissed' ? <X size={15} aria-hidden /> : <Check size={15} className="text-ok" aria-hidden />}
              {handled === 'accepted' ? 'Accepted into Blueprint' : handled === 'edited' ? 'Edited and saved to Blueprint' : 'Dismissed'}
            </p>
          ) : editing ? (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => accept(val, 'edited')} disabled={!val.trim()}>
                <Check size={15} aria-hidden /> Save to Blueprint
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="btn btn-primary btn-sm" onClick={() => accept(pr.value, 'accepted')}>
                <Check size={15} aria-hidden /> Accept
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                <Pencil size={15} aria-hidden /> Edit
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => update((p) => mark('dismissed', p))}>
                <X size={15} aria-hidden /> Dismiss
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AddSources({ ids, project, update }: { ids: string[]; project: Project; update: (fn: (p: Project) => void) => void }) {
  const { email } = useSettings();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const have = (id: string) => {
    const [k, v] = id.split(':');
    return project.sources.some((s) => (k === 'doi' ? s.doi === v : k === 'pmid' ? s.pmid === v : s.pmcid === v) || s.input.toLowerCase() === v.toLowerCase());
  };
  const add = async (id: string) => {
    const [k, v] = id.split(':');
    setBusy(id);
    const input = k === 'doi' ? v : k === 'pmid' ? `PMID ${v}` : v;
    const fresh = newSource(input, 'ai');
    fresh.include = false;
    const verified = await verifySource(fresh, { email });
    update((p) => p.sources.push(verified));
    setBusy(null);
    toast(verified.verification.status === 'verified' ? 'Added and verified — review it in the Evidence Library' : `Added as ${verified.verification.status} — check it in the Evidence Library`);
  };
  return (
    <div className="mt-2 rounded-xl border border-w2 bg-w2-soft p-2.5">
      <p className="text-[12.5px] font-semibold text-w2-text">AI-suggested identifiers — unverified until checked</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <button key={id} type="button" className="chip !min-h-[34px] text-[13px]" disabled={have(id) || busy === id} onClick={() => add(id)}>
            <BookPlus size={14} aria-hidden />
            {have(id) ? 'In library: ' : busy === id ? 'Verifying… ' : 'Add & verify '}
            <span className="font-mono text-[12px]">{id.replace(/^(doi|pmid|pmcid):/, '')}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
