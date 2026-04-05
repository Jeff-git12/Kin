import type { ReactNode } from "react";

type PageVisualKind = "town-square" | "events" | "trusted-services";

const badgeStyleByKind: Record<
  PageVisualKind,
  {
    wrap: string;
    icon: string;
    glyph: ReactNode;
  }
> = {
  "town-square": {
    wrap: "border-[#d8cbb8] bg-[#f3ebe0]",
    icon: "bg-[#2f6f74]/12 text-[#2f6f74]",
    glyph: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.7" />
        <path
          d="M12 4.5V19.5M4.5 12H19.5M7.4 7.4L16.6 16.6M16.6 7.4L7.4 16.6"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  events: {
    wrap: "border-[#cfded9] bg-[#eaf3f1]",
    icon: "bg-[#2f6f74]/12 text-[#2f6f74]",
    glyph: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <rect
          x="4.5"
          y="5.5"
          width="15"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M8 3.8V7.2M16 3.8V7.2M4.5 10H19.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  "trusted-services": {
    wrap: "border-[#d8cbb8] bg-[#f5eee4]",
    icon: "bg-[#8a6851]/12 text-[#8a6851]",
    glyph: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <path
          d="M12 5L17.6 7.2V11.7C17.6 15 15.2 17.9 12 19C8.8 17.9 6.4 15 6.4 11.7V7.2L12 5Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M9.6 11.9L11.2 13.5L14.6 10.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

type Props = {
  kind: PageVisualKind;
  label: string;
  hint: string;
};

export function PageMemoryBadge({ kind, label, hint }: Props) {
  const style = badgeStyleByKind[kind];
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-2xl border px-3 py-2 ${style.wrap}`.trim()}
      aria-label={label}
      title={hint}
    >
      <span
        className={`inline-flex size-8 items-center justify-center rounded-xl ${style.icon}`}
      >
        {style.glyph}
      </span>
      <div className="leading-tight">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4a5a5d]">
          {label}
        </p>
        <p className="text-xs text-[#5f6f72]">{hint}</p>
      </div>
    </div>
  );
}

const panelImageByKind: Record<PageVisualKind, { src: string; alt: string }> = {
  "town-square": {
    src: "/page-memory/town-square.svg",
    alt: "Illustration of a neighborhood town square",
  },
  events: {
    src: "/page-memory/events.svg",
    alt: "Illustration of an events calendar board",
  },
  "trusted-services": {
    src: "/page-memory/trusted-services.svg",
    alt: "Illustration of a trusted services directory",
  },
};

type PanelProps = {
  kind: PageVisualKind;
  title: string;
  subtitle: string;
};

export function PageMemoryPanel({ kind, title, subtitle }: PanelProps) {
  const image = panelImageByKind[kind];
  return (
    <div className="mt-6 grid gap-4 rounded-2xl border border-[#d8cbb8] bg-[#fffdf9] p-4 shadow-[0_8px_24px_rgba(42,51,53,0.06)] sm:grid-cols-[180px_1fr] sm:items-center">
      <div className="h-[104px] overflow-hidden rounded-xl border border-[#c7ced6] bg-[#e8ecf1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} className="h-full w-full object-contain" />
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#4a5a5d]">
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[#5f6f72]">{subtitle}</p>
      </div>
    </div>
  );
}
