import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, Info, AlertTriangle, Siren, CheckCircle2, XCircle } from 'lucide-react';

/* ───────────── Callout ─────────────
 * Risk and caution always pair an icon with plain-language text — never color alone. */
type CalloutTone = 'info' | 'caution' | 'urgent' | 'success' | 'error';
const toneStyles: Record<CalloutTone, { bg: string; border: string; icon: ReactNode; label: string }> = {
  info: { bg: 'var(--sage)', border: 'var(--line)', icon: <Info size={18} aria-hidden />, label: 'Note' },
  caution: { bg: 'var(--terra-soft)', border: 'var(--terra-ui)', icon: <AlertTriangle size={18} aria-hidden />, label: 'Caution' },
  urgent: { bg: 'var(--err-soft)', border: 'var(--err)', icon: <Siren size={18} aria-hidden />, label: 'Get care' },
  success: { bg: 'var(--ok-soft)', border: 'var(--ok)', icon: <CheckCircle2 size={18} aria-hidden />, label: 'Done' },
  error: { bg: 'var(--err-soft)', border: 'var(--err)', icon: <XCircle size={18} aria-hidden />, label: 'Error' }
};

export function Callout({
  tone = 'info',
  title,
  children,
  className = '',
  hideLabel = false
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
  className?: string;
  hideLabel?: boolean;
}) {
  const t = toneStyles[tone];
  const color = tone === 'caution' ? 'var(--terra)' : tone === 'urgent' || tone === 'error' ? 'var(--err)' : tone === 'success' ? 'var(--ok)' : 'var(--teal)';
  return (
    <div
      className={`flex gap-3 rounded-xl border p-3 sm:p-4 text-[15px] ${className}`}
      style={{ background: t.bg, borderColor: t.border }}
      role={tone === 'urgent' || tone === 'error' ? 'alert' : undefined}
    >
      <span className="mt-0.5 shrink-0" style={{ color }}>{t.icon}</span>
      <div className="min-w-0">
        {(title || !hideLabel) && (
          <p className="font-semibold" style={{ color: tone === 'info' ? 'var(--ink)' : color }}>
            {title ?? t.label}
          </p>
        )}
        <div className="text-ink">{children}</div>
      </div>
    </div>
  );
}

/* ───────────── Accordion ───────────── */
export function Accordion({
  summary,
  children,
  defaultOpen = false,
  id,
  level = 3
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  id?: string;
  level?: 2 | 3 | 4;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const auto = useId();
  const panelId = `${id ?? auto}-panel`;
  const H = `h${level}` as 'h2';
  return (
    <div className="border-b border-line last:border-b-0" id={id}>
      <H className="text-[16px] font-semibold">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 py-3.5 text-left min-h-[48px]"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="min-w-0">{summary}</span>
          <ChevronDown
            size={20}
            aria-hidden
            className="shrink-0 text-slate transition-transform"
            style={{ transform: open ? 'rotate(180deg)' : undefined }}
          />
        </button>
      </H>
      <div id={panelId} hidden={!open} className="pb-4 text-[15px] leading-relaxed">
        {children}
      </div>
    </div>
  );
}

/* ───────────── Responsive table → stacked cards on phones ───────────── */
export function StackedTable({ title, columns, rows, caption }: { title?: string; columns: string[]; rows: string[][]; caption?: string }) {
  return (
    <figure className="min-w-0">
      {title && <figcaption className="mb-2 text-[15px] font-semibold">{title}</figcaption>}
      {/* Desktop/tablet: real table */}
      <div className="hidden sm:block overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full border-collapse text-[14px]">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="bg-sage text-left">
              {columns.map((c) => (
                <th key={c} scope="col" className="px-3 py-2.5 font-semibold text-ink border-b border-line">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="align-top even:bg-surface-2">
                {r.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row" className="px-3 py-2.5 font-medium text-ink border-b border-line text-left">
                      {cell}
                    </th>
                  ) : (
                    <td key={j} className="px-3 py-2.5 border-b border-line">
                      {cell}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Phone: stacked key/value cards */}
      <ul className="sm:hidden space-y-2" aria-label={title}>
        {rows.map((r, i) => (
          <li key={i} className="card p-3">
            <p className="font-semibold text-[15px]">{r[0]}</p>
            <dl className="mt-1.5 space-y-1">
              {r.slice(1).map((cell, j) => (
                <div key={j} className="grid grid-cols-[minmax(0,40%)_1fr] gap-2 text-[14px]">
                  <dt className="text-slate">{columns[j + 1]}</dt>
                  <dd className="m-0">{cell}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/* ───────────── Segmented control (radio group) ───────────── */
export function Segmented<T extends string | number>({
  label,
  value,
  onChange,
  options,
  name
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
  name: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 text-[14px] font-semibold">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const id = `${name}-${o.value}`;
          const checked = o.value === value;
          return (
            <label
              key={String(o.value)}
              htmlFor={id}
              className={`chip ${checked ? '!bg-primary !text-white !border-primary' : ''}`}
              title={o.hint}
            >
              <input
                id={id}
                type="radio"
                name={name}
                className="sr-only"
                checked={checked}
                onChange={() => onChange(o.value)}
              />
              {o.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card p-6 text-center">
      <p className="text-[17px] font-semibold">{title}</p>
      {children && <div className="mt-2 text-slate text-[15px]">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function PageTitle({ eyebrow, title, children, actions }: { eyebrow?: string; title: string; children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="text-[22px] sm:text-[26px] lg:text-[28px] font-bold">{title}</h1>
        {children && <div className="mt-1 text-slate text-[15px]">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
