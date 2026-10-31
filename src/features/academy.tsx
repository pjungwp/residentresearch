import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Compass, Download, ExternalLink, GraduationCap, Lightbulb, Mail, Maximize2, Pencil, Send, Sparkles, X, BookOpen, Upload, Loader2, AlertTriangle
} from 'lucide-react';
import { SimpleShell } from '@/components/shell';
import { COURSE, COURSE_DESIGN, READINGS, RUNNING_CASE, RUNNING_NAME, SESSION, starterFor, isBlankAnswer, type CourseWeek, type Slide, type AssignmentField } from '@/content/course';
import { TONE_CLASSES } from '@/content/fields';
import {
  useCourse, work, setValue, assignmentStatus, missingRequired, submit, reopen, assignmentText, bringToConcierge, updateCourse, exportCourseJson, importCourseJson, type CourseState
} from '@/lib/courseStore';
import { setSettings, useSettings } from '@/lib/store';
import { askConcierge, AIError, phiWarnings } from '@/lib/ai';
import { downloadFile } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';
import { useToast } from '@/components/ui/Toast';
import { Markdown } from './studio';

const STATUS_TEXT = { not_started: 'Not started', in_progress: 'In progress', submitted: 'Submitted' } as const;

/* ═════════ Home ═════════ */
export function HomePage() {
  usePageTitle('ResearchForge');
  const course = useCourse();
  const submitted = COURSE.filter((w) => assignmentStatus(course, w.n) === 'submitted').length;
  return (
    <SimpleShell>
      <div className="mx-auto max-w-[1100px] px-[var(--gutter)] py-8 sm:py-12">
        <h1 className="max-w-[18ch] text-[2.25rem] leading-[1.1] sm:text-[3rem]">Turn an educational idea into meaningful research</h1>
        <p className="mt-3 max-w-[46ch] text-[1.25rem] text-slate">Learn research design in five weeks, or design your own study for free.</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <Link to="/academy" className="group block rounded-[24px] bg-w1-soft p-6 text-ink no-underline shadow-[var(--shadow)] hover:no-underline hover:ring-2 hover:ring-[var(--w1)] sm:p-8">
            <GraduationCap size={40} className="text-w1-text" aria-hidden />
            <h2 className="mt-3 text-[1.875rem]">Research Design Academy</h2>
            <p className="mt-1 text-[1.125rem] font-semibold text-w1-text">Five weeks · Guided · Practical assignments</p>
            <p className="mt-3 text-[1.0625rem]">{submitted ? `${submitted} of 5 assignments submitted.` : 'Slides, frameworks and one assignment a week.'}</p>
            <span className="btn btn-primary mt-5">{submitted ? 'Continue' : 'Start week 1'} <ArrowRight size={20} aria-hidden /></span>
          </Link>
          <Link to="/concierge" className="group block rounded-[24px] bg-w3-soft p-6 text-ink no-underline shadow-[var(--shadow)] hover:no-underline hover:ring-2 hover:ring-[var(--w3)] sm:p-8">
            <Compass size={40} className="text-w3-text" aria-hidden />
            <h2 className="mt-3 text-[1.875rem]">Research Design Concierge</h2>
            <p className="mt-1 text-[1.125rem] font-semibold text-w3-text">Free · Self-paced · Your own study</p>
            <p className="mt-3 text-[1.0625rem]">Seven stages from idea to exportable protocol.</p>
            <span className="btn btn-secondary mt-5">Open Concierge <ArrowRight size={20} aria-hidden /></span>
          </Link>
        </div>
        <p className="mt-6 text-[1rem] text-slate">AI help is optional and uses paid API credits. Everything else works without it.</p>
      </div>
    </SimpleShell>
  );
}

/* ═════════ Academy overview ═════════ */
export function AcademyHome() {
  usePageTitle('Research Design Academy');
  const course = useCourse();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const done = COURSE.filter((w) => assignmentStatus(course, w.n) === 'submitted').length;
  const next = COURSE.find((w) => assignmentStatus(course, w.n) !== 'submitted') ?? COURSE[0];
  return (
    <SimpleShell>
      <div className="mx-auto max-w-[1100px] px-[var(--gutter)] py-6 sm:py-8">
        <p className="text-[1rem] font-bold uppercase tracking-[0.08em] text-teal">Research Design Academy</p>
        <h1 className="mt-1 text-[2.125rem] leading-tight sm:text-[2.5rem]">Five weeks from idea to IRB draft</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Link to={`/academy/week/${next.n}`} className="btn btn-primary">{done ? 'Continue' : 'Start'} · Week {next.n} <ArrowRight size={20} aria-hidden /></Link>
          <span className="text-[1.125rem] text-slate">{done}/5 submitted</span>
        </div>

        <ol className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COURSE.map((w) => {
            const t = TONE_CLASSES[w.tone];
            const st = assignmentStatus(course, w.n);
            return (
              <li key={w.n}>
                <Link to={`/academy/week/${w.n}`} className={`flex h-full flex-col rounded-[20px] p-5 text-ink no-underline shadow-[var(--shadow)] hover:no-underline hover:ring-2 ${t.soft}`} style={{ ['--tw-ring-color' as string]: `var(--${w.tone})` }}>
                  <span className={`text-[1rem] font-bold uppercase tracking-[0.08em] ${t.text}`}>Week {w.n}</span>
                  <span className="mt-1 font-display text-[1.5rem] font-semibold leading-tight">{w.title}</span>
                  <span className="mt-2 text-[1.0625rem]">{w.promise}</span>
                  <span className="mt-auto flex items-center gap-1.5 pt-4 text-[1rem] font-semibold">
                    {st === 'submitted' ? <CheckCircle2 size={20} className="text-ok" aria-hidden /> : <Circle size={20} className="text-slate" aria-hidden />}
                    {STATUS_TEXT[st]}
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="rounded-[20px] border-2 border-dashed border-line-strong p-5">
            <span className="text-[1rem] font-bold uppercase tracking-[0.08em] text-slate">Running example</span>
            <p className="mt-1 font-display text-[1.375rem] font-semibold leading-tight">{RUNNING_NAME}</p>
            <p className="mt-2 text-[1.0625rem]">{(() => { const q = RUNNING_CASE.split(': ')[1]; return q.charAt(0).toUpperCase() + q.slice(1); })()} It grows each week.</p>
          </li>
        </ol>

        <section className="mt-10" aria-labelledby="session-h">
          <h2 id="session-h" className="text-[1.625rem]">How Wednesdays work</h2>
          <p className="mt-1 text-[1.125rem]"><strong>{SESSION.when}.</strong> {SESSION.due}</p>
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            <ol className="card divide-y divide-line p-0">
              {SESSION.agenda.map((a) => (
                <li key={a.time} className="flex gap-4 px-4 py-3 text-[1.0625rem]"><span className="w-14 shrink-0 font-semibold tabular-nums text-teal">{a.time}</span><span>{a.text}</span></li>
              ))}
            </ol>
            <ul className="space-y-2">
              {SESSION.notes.map((x) => <li key={x} className="card p-4 text-[1.0625rem]">{x}</li>)}
            </ul>
          </div>
        </section>

        <section className="mt-10" aria-labelledby="design-h">
          <h2 id="design-h" className="text-[1.625rem]">How this course is built</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COURSE_DESIGN.map((d) => (
              <li key={d.label} className="card p-4">
                <p className="text-[1.125rem] font-semibold">{d.label}</p>
                <p className="mt-1 text-[1rem]">{d.text}</p>
                <a className="mt-2 inline-block text-[0.9375rem]" href={READINGS[d.cite].url} target="_blank" rel="noopener noreferrer">{shortCite(d.cite)}</a>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.9375rem] text-slate">Readings are standard health-professions-education sources, not a specific program’s syllabus.</p>
        </section>

        <section className="mt-8 flex flex-wrap gap-2" aria-label="Course backup">
          <button className="btn btn-secondary btn-sm" onClick={() => downloadFile('researchforge-academy.json', exportCourseJson())}><Download size={18} aria-hidden /> Back up my course work</button>
          <input ref={fileRef} type="file" accept=".json,application/json" className="sr-only" aria-label="Restore course backup" onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            try {
              importCourseJson(await f.text());
              toast('Course work restored');
            } catch (err) {
              toast((err as Error).message, 'error');
            }
          }} />
          <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}><Upload size={18} aria-hidden /> Restore</button>
        </section>
      </div>
    </SimpleShell>
  );
}

const shortCite = (id: string) => {
  const c = READINGS[id]?.cite ?? '';
  const names = c.split('. ')[0].replace(/, eds$/, '').split(',').map((a) => a.trim().split(' ').filter((t) => !/^[A-Z]{1,3}$/.test(t) && t !== 'III' && t !== 'Jr').join(' '));
  const who = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} & ${names[1]}` : `${names[0]} et al.`;
  const year = c.match(/\b(19|20)\d\d\b/)?.[0];
  return `${who}${year ? ` ${year}` : ''}`;
};

/* ═════════ Week page ═════════ */
export function AcademyWeek() {
  const { n: nParam } = useParams();
  const n = Math.min(Math.max(Number(nParam) || 1, 1), 5);
  const w = COURSE[n - 1];
  const t = TONE_CLASSES[w.tone];
  const course = useCourse();
  usePageTitle(`Week ${n} · ${w.title}`);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [n]);

  return (
    <SimpleShell wide>
      <div className="mx-auto max-w-[1100px] px-[var(--gutter)] py-5">
        <nav aria-label="Weeks" className="scroll-x-chips">
          <Link to="/academy" className="chip">All weeks</Link>
          {COURSE.map((x) => {
            const tt = TONE_CLASSES[x.tone];
            const cur = x.n === n;
            const st = assignmentStatus(course, x.n);
            return (
              <Link key={x.n} to={`/academy/week/${x.n}`} aria-current={cur ? 'page' : undefined} className={`chip ${cur ? `!border-transparent font-bold ${tt.soft} ${tt.text}` : ''}`}>
                {st === 'submitted' ? <CheckCircle2 size={18} aria-hidden /> : <span className={`h-2.5 w-2.5 rounded-full ${tt.bg}`} aria-hidden />} Week {x.n}
              </Link>
            );
          })}
        </nav>

        <header className="mt-4">
          <p className={`text-[1rem] font-bold uppercase tracking-[0.08em] ${t.text}`}>Week {n} of 5</p>
          <h1 className="mt-1 text-[2.125rem] leading-tight sm:text-[2.625rem]">{w.title}</h1>
          <p className="mt-2 text-[1.25rem]">{w.promise}</p>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Frameworks">
            {w.frameworks.map((f) => (
              <li key={f} className={`rounded-full px-3 py-1 text-[1rem] font-semibold ${t.soft} ${t.text}`}>{f}</li>
            ))}
          </ul>
        </header>

        <SlideDeck week={w} />

        <section className="mt-8" aria-labelledby="theory-h">
          <h2 id="theory-h" className="text-[1.5rem]">Theory in 60 seconds</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2">
            {w.theory.map((x, k) => (
              <li key={x.label} className="card flex gap-3 p-4">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold ${t.bg} text-ink`}>{k + 1}</span>
                <span>
                  <span className="block text-[1.1875rem] font-semibold">{x.label}</span>
                  <span className="mt-0.5 block text-[1.0625rem]">{x.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[0.9375rem] text-slate">
            Based on:{' '}
            {w.theoryCites.map((id, k) => (
              <span key={id}>{k > 0 && ' · '}<a href={READINGS[id].url} target="_blank" rel="noopener noreferrer">{shortCite(id)}</a></span>
            ))}
          </p>
          {w.eduBox && (
            <details className="mt-4 rounded-2xl border-2 border-dashed border-line-strong bg-surface p-4">
              <summary className="cursor-pointer text-[1.1875rem] font-semibold">{w.eduBox.title} (optional)</summary>
              <ul className="mt-2 space-y-2 text-[1.0625rem]">
                {w.eduBox.points.map((x) => <li key={x} className="flex gap-2.5"><span className={`mt-2.5 h-2 w-2 shrink-0 rounded-full ${t.bg}`} aria-hidden />{x}</li>)}
              </ul>
              <p className="mt-2 text-[0.9375rem] text-slate">
                {w.eduBox.cites.map((id, k) => (
                  <span key={id}>{k > 0 && ' · '}<a href={READINGS[id].url} target="_blank" rel="noopener noreferrer">{shortCite(id)}</a></span>
                ))}
              </p>
            </details>
          )}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Key ideas">
          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-[1.5rem]"><Lightbulb size={24} className={t.text} aria-hidden /> Key ideas</h2>
            <ul className="mt-3 space-y-2.5 text-[1.125rem]">
              {w.keyIdeas.map((k) => (
                <li key={k} className="flex gap-2.5"><span className={`mt-2.5 h-2 w-2 shrink-0 rounded-full ${t.bg}`} aria-hidden />{k}</li>
              ))}
            </ul>
          </div>
          <div className="card p-5">
            <h2 className="text-[1.5rem]">Evidence-based practice</h2>
            <ul className="mt-3 space-y-3 text-[1.125rem]">
              {w.practice.map((p) => (
                <li key={p.tip}>
                  {p.tip}{' '}
                  <a className="whitespace-nowrap text-[0.9375rem]" href={READINGS[p.cite].url} target="_blank" rel="noopener noreferrer">{shortCite(p.cite)}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <AssignmentPanel week={w} course={course} />

        <section className="mt-8" aria-labelledby="read-h">
          <h2 id="read-h" className="flex items-center gap-2 text-[1.5rem]"><BookOpen size={24} className={t.text} aria-hidden /> References & further reading</h2>
          <ol className="mt-3 space-y-2.5">
            {w.readings.map((id) => {
              const r = READINGS[id];
              return (
                <li key={id} className="rounded-xl border border-line bg-surface p-3">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[1.0625rem] font-semibold">{r.cite} <ExternalLink size={14} className="inline" aria-hidden /></a>
                  <p className="mt-0.5 text-[1rem] text-slate">{r.why}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="mt-8 flex flex-wrap gap-2">
          {n > 1 && <Link to={`/academy/week/${n - 1}`} className="btn btn-secondary"><ArrowLeft size={20} aria-hidden /> Week {n - 1}</Link>}
          {n < 5 && <Link to={`/academy/week/${n + 1}`} className="btn btn-primary">Week {n + 1}: {COURSE[n].short} <ArrowRight size={20} aria-hidden /></Link>}
        </div>
      </div>
    </SimpleShell>
  );
}

/* ═════════ Slides ═════════ */
function SlideDeck({ week }: { week: CourseWeek }) {
  const course = useCourse();
  const [present, setPresent] = useState(false);
  const total = week.slides.length;
  const i = Math.min(course.slide[week.n] ?? 0, total - 1);
  const go = (k: number) =>
    updateCourse((s) => {
      s.slide[week.n] = Math.max(0, Math.min(total - 1, k));
      if (k >= total - 1) s.slidesDone[week.n] = true;
    });

  useEffect(() => {
    if (!present) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
      if (e.key === 'Escape') setPresent(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  });

  const controls = (
    <div className="mt-3 flex items-center gap-2">
      <button type="button" className="btn btn-secondary !h-12 !w-12 !p-0" onClick={() => go(i - 1)} disabled={i === 0} aria-label="Previous slide"><ArrowLeft size={22} aria-hidden /></button>
      <ol className="flex flex-1 flex-wrap justify-center gap-1.5" aria-label="Slides">
        {week.slides.map((_, k) => (
          <li key={k}>
            <button type="button" onClick={() => go(k)} aria-label={`Slide ${k + 1}`} aria-current={k === i ? 'step' : undefined} className={`h-3 rounded-full transition-all ${k === i ? 'w-8 bg-primary' : 'w-3 bg-line-strong hover:bg-slate'}`} />
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn-primary !h-12 !w-12 !p-0" onClick={() => go(i + 1)} disabled={i === total - 1} aria-label="Next slide"><ArrowRight size={22} aria-hidden /></button>
    </div>
  );

  return (
    <section className="mt-6" aria-roledescription="carousel" aria-label={`Week ${week.n} slides`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[1.5rem]">Slides <span className="text-[1.0625rem] font-normal text-slate">· {i + 1} / {total}</span></h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPresent(true)}><Maximize2 size={18} aria-hidden /> Present</button>
      </div>
      <SlideView slide={week.slides[i]} week={week} index={i} />
      {controls}
      {present && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-page p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Slides, full screen">
          <div className="flex items-center justify-between">
            <span className="text-[1.0625rem] text-slate">Week {week.n} · {i + 1} / {total}</span>
            <button type="button" className="grid h-12 w-12 place-items-center rounded-xl hover:bg-sage" onClick={() => setPresent(false)} aria-label="Close" autoFocus><X size={26} aria-hidden /></button>
          </div>
          <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center">
            <SlideView slide={week.slides[i]} week={week} index={i} large />
            {controls}
          </div>
        </div>
      )}
    </section>
  );
}

function SlideView({ slide, week, index, large }: { slide: Slide; week: CourseWeek; index: number; large?: boolean }) {
  const t = TONE_CLASSES[week.tone];
  const course = useCourse();
  const title = (
    <h3 className={`font-display font-semibold leading-tight ${large ? 'text-[2.5rem] sm:text-[3.25rem]' : 'text-[1.75rem] sm:text-[2.25rem]'}`}>{slide.title}</h3>
  );
  const itemText = large ? 'text-[1.375rem] sm:text-[1.625rem]' : 'text-[1.125rem] sm:text-[1.25rem]';
  const labelText = large ? 'text-[1.625rem] sm:text-[2rem]' : 'text-[1.3125rem] sm:text-[1.5rem]';
  const caption = 'caption' in slide && slide.caption ? <p className={`mt-auto pt-4 text-slate ${large ? 'text-[1.125rem]' : 'text-[0.9375rem]'}`}>{slide.caption}</p> : null;
  let body: React.ReactNode = null;

  switch (slide.kind) {
    case 'big':
      body = <p className={`mt-6 font-display font-semibold leading-snug ${large ? 'text-[2.25rem] sm:text-[3rem]' : 'text-[1.75rem] sm:text-[2.25rem]'} ${t.text}`}>{slide.statement}</p>;
      break;
    case 'cards':
      body = (
        <ul className={`mt-5 grid gap-3 ${slide.items.length > 4 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
          {slide.items.map((it) => (
            <li key={it.label} className="rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
              <p className={`font-semibold ${labelText}`}>{it.label}</p>
              {it.text && <p className={`mt-1 text-slate ${itemText}`}>{it.text}</p>}
            </li>
          ))}
        </ul>
      );
      break;
    case 'steps':
      body = (
        <ol className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-stretch">
          {slide.items.map((it, k) => (
            <li key={it.label} className="flex flex-1 items-stretch gap-3 sm:min-w-[150px]">
              <div className="flex-1 rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
                <span className={`grid h-9 w-9 place-items-center rounded-full font-bold ${t.bg} text-ink`}>{k + 1}</span>
                <p className={`mt-2 font-semibold ${labelText}`}>{it.label}</p>
                {it.text && <p className={`mt-0.5 text-slate ${itemText}`}>{it.text}</p>}
              </div>
              {k < slide.items.length - 1 && <ArrowRight size={24} className={`hidden shrink-0 self-center sm:block ${t.text}`} aria-hidden />}
            </li>
          ))}
        </ol>
      );
      break;
    case 'pyramid':
      body = (
        <ol className="mt-5 flex flex-col items-center gap-2">
          {slide.items.map((it, k) => (
            <li key={it.label} className="rounded-2xl bg-surface px-4 py-3 text-center shadow-[var(--shadow)]" style={{ width: `${46 + (k * 54) / Math.max(1, slide.items.length - 1)}%` }}>
              <span className={`font-semibold ${labelText}`}>{it.label}</span>
              {it.text && <span className={`block text-slate ${itemText}`}>{it.text}</span>}
            </li>
          ))}
        </ol>
      );
      break;
    case 'compare':
      body = (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[slide.left, slide.right].map((col, k) => (
            <div key={col.label} className={`rounded-2xl p-4 shadow-[var(--shadow)] ${k === 0 ? 'bg-surface' : 'bg-surface ring-2'}`} style={k === 1 ? { ['--tw-ring-color' as string]: `var(--${week.tone})` } : undefined}>
              <p className={`font-bold uppercase tracking-[0.06em] ${k === 1 ? t.text : 'text-slate'} ${large ? 'text-[1.25rem]' : 'text-[1rem]'}`}>{col.label}</p>
              <ul className="mt-2 space-y-2">
                {col.items.map((x) => <li key={x} className={itemText}>{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      );
      break;
    case 'table':
      body = (
        <div className="mt-5 overflow-x-auto rounded-2xl bg-surface shadow-[var(--shadow)]">
          <table className={`w-full text-left ${itemText}`}>
            <thead><tr>{slide.columns.map((c) => <th key={c} className={`px-4 py-3 ${t.text}`}>{c}</th>)}</tr></thead>
            <tbody>{slide.rows.map((r) => <tr key={r.join()} className="border-t border-line">{r.map((c, k) => <td key={k} className={`px-4 py-3 ${k === 0 ? 'font-semibold' : ''}`}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
      break;
    case 'case':
      body = (
        <div className="mt-4">
          <p className={`font-semibold ${labelText}`}>{RUNNING_NAME}</p>
          <p className={`text-slate ${itemText}`}>{slide.text.split(': ')[1]}</p>
          <ul className="mt-4 space-y-2.5">
            {slide.points.map((x) => (
              <li key={x} className={`flex gap-3 rounded-2xl bg-surface p-3.5 shadow-[var(--shadow)] ${itemText}`}><CheckCircle2 size={large ? 30 : 24} className={`shrink-0 ${t.text}`} aria-hidden />{x}</li>
            ))}
          </ul>
        </div>
      );
      break;
    case 'check': {
      const key = `${week.n}-${index}`;
      const picked = course.answers[key];
      body = (
        <div className="mt-4">
          <p className={`font-semibold ${labelText}`}>{slide.question}</p>
          <ul className="mt-4 space-y-2.5">
            {slide.options.map((o, k) => {
              const show = picked !== undefined && (k === picked || o.correct);
              return (
                <li key={o.text}>
                  <button
                    type="button"
                    onClick={() => updateCourse((s) => void (s.answers[key] = k))}
                    aria-pressed={picked === k}
                    className={`w-full rounded-2xl border-2 bg-surface p-3.5 text-left shadow-[var(--shadow)] ${itemText} ${show ? (o.correct ? 'border-[var(--ok)]' : 'border-[var(--err)]') : 'border-transparent hover:border-line-strong'}`}
                  >
                    <span className="font-semibold">{o.text}</span>
                    {show && <span className={`mt-1 block ${o.correct ? 'text-ok' : 'text-err'}`}>{o.correct ? 'Correct. ' : 'Not quite. '}{o.why}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      );
      break;
    }
  }

  return (
    <div className={`flex flex-col rounded-[24px] p-5 sm:p-8 ${t.soft} ${large ? 'min-h-[60vh]' : 'min-h-[380px] sm:min-h-[460px]'}`}>
      <p className={`font-bold uppercase tracking-[0.1em] ${t.text} ${large ? 'text-[1.125rem]' : 'text-[0.9375rem]'}`}>
        {slide.kind === 'check' ? 'Check your understanding' : slide.kind === 'case' ? 'Running example' : `Week ${week.n} · ${index + 1}`}
      </p>
      {title}
      {body}
      {caption}
    </div>
  );
}

/* ═════════ Assignment ═════════ */
function AssignmentPanel({ week, course }: { week: CourseWeek; course: CourseState }) {
  const n = week.n;
  const t = TONE_CLASSES[week.tone];
  const w = work(course, n);
  const status = assignmentStatus(course, n);
  const locked = status === 'submitted';
  const settings = useSettings();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const missing = missingRequired(course, n);

  const doSubmit = async () => {
    submit(n);
    setConfirm(false);
    toast('Assignment submitted');
    try {
      const { exportAssignment } = await import('@/lib/courseDocx');
      await exportAssignment(n);
    } catch {
      /* download is a convenience; submission is already saved */
    }
  };

  const mailto = () => {
    const body = `${assignmentText(course, n, w.submitted ?? w.values)}\n\n— Submitted ${new Date(w.submittedAt ?? Date.now()).toLocaleString()} from ResearchForge${settings.learnerName ? ` by ${settings.learnerName}` : ''}. The Word file is attached.`;
    const url = `mailto:${encodeURIComponent(settings.facultyEmail)}?subject=${encodeURIComponent(`ResearchForge Week ${n}: ${week.assignment.title}${settings.learnerName ? ` — ${settings.learnerName}` : ''}`)}&body=${encodeURIComponent(body.slice(0, 1800))}`;
    window.location.href = url;
  };

  const transfer = async () => {
    setBusy(true);
    try {
      const weeks = COURSE.filter((x) => x.n <= n || assignmentStatus(course, x.n) !== 'not_started').map((x) => x.n);
      const r = await bringToConcierge(weeks);
      toast(r.kept ? `Copied ${r.filled} answers. Kept ${r.kept} you had already changed in the Concierge.` : `Copied ${r.filled} answers into the Concierge.`);
      navigate(`/p/${r.projectId}/stage/${Math.min(n + 1, 7)}`);
    } catch {
      toast('Could not open the Concierge. Your course work is safe.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`mt-8 rounded-[24px] p-5 sm:p-7 ${t.soft}`} aria-labelledby="asg-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={`text-[1rem] font-bold uppercase tracking-[0.08em] ${t.text}`}>Assignment · Week {n}</p>
          <h2 id="asg-h" className="mt-1 text-[1.875rem] leading-tight">{week.assignment.title}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-[1rem] font-semibold ${locked ? 'bg-ok-soft text-ok' : 'bg-surface'}`}>
          {locked ? `Submitted ${new Date(w.submittedAt!).toLocaleDateString()}` : STATUS_TEXT[status]}
        </span>
      </div>
      <ol className="mt-3 flex flex-wrap gap-2">
        {week.assignment.steps.map((s, k) => (
          <li key={s} className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[1.0625rem]">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-[0.875rem] font-bold ${t.bg} text-ink`}>{k + 1}</span>{s}
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[1.125rem]"><strong>You’ll hand in:</strong> {week.assignment.output}</p>
      <ul className="mt-2 flex flex-wrap gap-2 text-[1rem] font-semibold" aria-label="Logistics">
        <li className="rounded-full bg-surface px-3 py-1">Due Wednesday 8:00 AM</li>
        <li className="rounded-full bg-surface px-3 py-1">About {week.assignment.time}</li>
        <li className="rounded-full bg-surface px-3 py-1">Formative · feedback by Wednesday afternoon</li>
      </ul>
      <p className="mt-2 text-[1rem] text-slate">Tip: tap <strong>Use starter</strong> to drop in a fill-in-the-blank sentence.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {week.assignment.fields.map((f) => (
          <AssignmentInput key={f.key} n={n} f={f} value={w.values[f.key] ?? ''} starter={starterFor(f, w.values)} locked={locked} wide={f.kind === 'long'} />
        ))}
      </div>

      {n === 5 && <ProtocolPreview course={course} />}

      {/* Submit */}
      <div className="mt-6 rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
        {locked ? (
          <div className="flex flex-wrap items-center gap-2">
            <p className="flex w-full items-center gap-2 text-[1.125rem] font-semibold text-ok"><CheckCircle2 size={22} aria-hidden /> Submitted{w.submissions > 1 ? ` (version ${w.submissions})` : ''}</p>
            {settings.facultyEmail ? (
              <button className="btn btn-primary" onClick={mailto}><Mail size={20} aria-hidden /> Email to faculty</button>
            ) : (
              <Link to="/settings" className="btn btn-secondary">Add faculty email</Link>
            )}
            <button className="btn btn-secondary" onClick={async () => (await import('@/lib/courseDocx')).exportAssignment(n)}><Download size={20} aria-hidden /> Word file</button>
            <button className="btn btn-ghost" onClick={() => reopen(n)}><Pencil size={18} aria-hidden /> Edit & resubmit</button>
          </div>
        ) : confirm ? (
          <div>
            <p className="text-[1.125rem] font-semibold">Submit Week {n}?</p>
            <p className="mt-1 text-[1rem] text-slate">We save a dated final copy and download a Word file. Then email it to your faculty. ResearchForge has no gradebook.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={doSubmit}><Send size={20} aria-hidden /> Yes, submit</button>
              <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn btn-primary !min-h-[52px] !px-6 !text-[1.125rem]" disabled={missing.length > 0} onClick={() => setConfirm(true)}>
              <Send size={20} aria-hidden /> Submit assignment
            </button>
            <span className="text-[1rem] text-slate">{missing.length ? `Still needed: ${missing.join(', ')}` : 'Ready to submit. Saved as you type.'}</span>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <AiFeedback n={n} course={course} />
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface-2 p-4">
          <p className="flex items-center gap-2 text-[1.125rem] font-semibold"><Compass size={20} className="text-teal" aria-hidden /> Optional: keep refining</p>
          <p className="mt-1 text-[1rem] text-slate">Copy your answers into the free Concierge. Nothing is retyped; nothing there is overwritten.</p>
          <button className="btn btn-secondary mt-3" onClick={transfer} disabled={busy}>
            {busy ? <Loader2 size={18} className="animate-spin" aria-hidden /> : <ArrowRight size={18} aria-hidden />} Bring into Concierge
          </button>
        </div>
      </div>
    </section>
  );
}

function AssignmentInput({ n, f, value, starter, locked, wide }: { n: number; f: AssignmentField; value: string; starter?: string; locked: boolean; wide: boolean }) {
  const [ex, setEx] = useState(false);
  const id = `a${n}-${f.key}`;
  return (
    <div className={wide ? 'md:col-span-2' : ''}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="field-label !text-[1.125rem]">
          {f.label}{f.required && <span className="text-teal"> *</span>}
        </label>
        {f.example && (
          <button type="button" className="text-[0.9375rem] font-semibold text-teal underline-offset-2 hover:underline" aria-expanded={ex} onClick={() => setEx((x) => !x)}>
            {ex ? 'Hide example' : 'See example'}
          </button>
        )}
      </div>
      {f.hint && <span className="field-hint">{f.hint}</span>}
      {ex && f.example && <p className="mt-1 rounded-xl bg-surface-2 px-3 py-2 text-[1rem] italic">{f.example}</p>}
      {starter && !locked && (!value.trim() || (isBlankAnswer(f, value) && value.trim() !== starter.trim())) && (
        <button type="button" className="mt-1.5 inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3 text-[0.9375rem] font-semibold text-teal hover:bg-sage" onClick={() => setValue(n, f.key, starter)}>
          <Pencil size={15} aria-hidden /> Use starter
        </button>
      )}
      {f.kind === 'select' ? (
        <select id={id} className="input mt-1.5" value={value} disabled={locked} onChange={(e) => setValue(n, f.key, e.target.value)}>
          <option value="">Choose…</option>
          {f.options!.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : f.kind === 'long' ? (
        <textarea id={id} className="input mt-1.5 min-h-[120px] text-[1.0625rem]" value={value} readOnly={locked} onChange={(e) => setValue(n, f.key, e.target.value)} />
      ) : (
        <input id={id} className="input mt-1.5" value={value} readOnly={locked} onChange={(e) => setValue(n, f.key, e.target.value)} />
      )}
      {f.key === 'search' && value.trim() && (
        <div className="mt-2 flex flex-wrap gap-2">
          <a className="btn btn-secondary btn-sm" href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(value.trim())}`} target="_blank" rel="noopener noreferrer">Run in PubMed <ExternalLink size={15} aria-hidden /></a>
          <a className="btn btn-ghost btn-sm" href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(value.trim())}&filter=pubt.guideline&filter=pubt.systematicreview`} target="_blank" rel="noopener noreferrer">Guidelines & reviews only <ExternalLink size={15} aria-hidden /></a>
        </div>
      )}
      {f.key.startsWith('source') && (f.key === 'source1') && (
        <p className="mt-1.5 text-[0.9375rem] text-slate">Check each reference exists (PubMed or DOI) and that you read it. The free Concierge’s Evidence Library can verify them for you.</p>
      )}
    </div>
  );
}

function ProtocolPreview({ course }: { course: CourseState }) {
  const filled = COURSE.slice(0, 4).map((w) => ({ w, n: w.assignment.fields.filter((f) => (work(course, w.n).values[f.key] ?? '').trim()).length }));
  return (
    <div className="mt-6 rounded-2xl bg-surface p-4 shadow-[var(--shadow)]">
      <p className="text-[1.25rem] font-semibold">Your protocol pulls in Weeks 1–4</p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {filled.map(({ w, n }) => (
          <li key={w.n} className="flex items-center gap-2 text-[1.0625rem]">
            {n ? <CheckCircle2 size={20} className="text-ok" aria-hidden /> : <AlertTriangle size={20} className="text-warn" aria-hidden />}
            <Link to={`/academy/week/${w.n}`}>Week {w.n}: {w.short}</Link> <span className="text-slate">({n}/{w.assignment.fields.length})</span>
          </li>
        ))}
      </ul>
      <button className="btn btn-secondary mt-3" onClick={async () => (await import('@/lib/courseDocx')).exportProtocol()}><Download size={20} aria-hidden /> Export full proposal (Word)</button>
    </div>
  );
}

/* ═════════ Optional AI feedback (paid credits) ═════════ */
function AiFeedback({ n, course }: { n: number; course: CourseState }) {
  const settings = useSettings();
  const w = work(course, n);
  const [stage, setStage] = useState<'idle' | 'confirm' | 'running'>('idle');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const abort = useRef<AbortController | null>(null);
  const draft = assignmentText(course, n);
  const hasDraft = Object.values(w.values).some((v) => v.trim());

  const run = async () => {
    const phi = phiWarnings(draft);
    if (phi.length) {
      setError(`Your draft may contain ${phi.join(', ')}. Remove it before asking the AI.`);
      setStage('idle');
      return;
    }
    if (!settings.aiNoticeAccepted) setSettings({ aiNoticeAccepted: true });
    setStage('running');
    setText('');
    setError('');
    const ctl = new AbortController();
    abort.current = ctl;
    let acc = '';
    try {
      await askConcierge(
        {
          mode: 'chat',
          messages: [{ role: 'user', content: `Give brief, specific formative feedback on my Research Design Academy Week ${n} assignment. Use 3 strengths and 3 improvements, each one short line, then one sentence on the single most important next step. Do not rewrite it for me, do not use proposal blocks, and do not invent citations.\n\n${draft}` }],
          context: `Research Design Academy, Week ${n}: ${COURSE[n - 1].title}. Frameworks: ${COURSE[n - 1].frameworks.join(', ')}. This is a course assignment, not a Concierge project.`,
          signal: ctl.signal
        },
        { onText: (d) => { acc += d; setText(acc); }, onCitation: () => {}, onSearch: () => {} }
      );
      updateCourse((s) => {
        const x = (s.weeks[n] ??= { values: {}, submissions: 0 });
        x.aiFeedback = acc;
        x.aiFeedbackAt = new Date().toISOString();
      });
      setStage('idle');
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError(e instanceof AIError ? e.message : 'The AI could not respond. Your work is safe.');
      setStage('idle');
    }
  };

  const shown = stage === 'running' ? text : w.aiFeedback;
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface-2 p-4">
      <p className="flex flex-wrap items-center gap-2 text-[1.125rem] font-semibold">
        <Sparkles size={20} className="text-teal" aria-hidden /> Optional AI feedback
        <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-[0.875rem] font-semibold text-warn">Uses paid credits</span>
      </p>
      <p className="mt-1 text-[1rem] text-slate">Not required. Your faculty’s feedback is what counts.</p>
      {stage === 'confirm' ? (
        <div className="mt-3 rounded-xl bg-surface p-3 text-[1rem]">
          <p>This sends your draft to Claude (Anthropic) and uses <strong>paid API credits</strong> on your program’s account. No patient information.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn btn-primary btn-sm" onClick={run}>Use credits — get feedback</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setStage('idle')}>Cancel</button>
          </div>
        </div>
      ) : stage === 'running' ? (
        <button className="btn btn-secondary mt-3" onClick={() => abort.current?.abort()}>Stop</button>
      ) : (
        <button className="btn btn-secondary mt-3" disabled={!hasDraft} onClick={() => setStage('confirm')}>
          <Sparkles size={18} aria-hidden /> {w.aiFeedback ? 'Ask again' : 'Get AI feedback'}
        </button>
      )}
      {error && <p className="mt-2 text-[1rem] text-err" role="alert">{error}</p>}
      {shown && (
        <div className="mt-3 rounded-xl bg-surface p-3" aria-live="polite">
          <Markdown text={shown} />
          <p className="mt-1 text-[0.875rem] text-slate">AI feedback can be wrong. Check it with your faculty.</p>
        </div>
      )}
    </div>
  );
}
