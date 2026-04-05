import Link from "next/link";
import type { ReactNode } from "react";

/** Full-width main area below the header */
export const mainSurfaceClass =
  "min-h-screen flex-1 bg-[var(--background)]";

/** Default content width for hub-style pages */
export const containerClass =
  "mx-auto w-full max-w-5xl px-6 py-12 md:py-16 lg:py-20";

/** Narrow width for long-form reading */
export const containerNarrowClass =
  "mx-auto w-full max-w-2xl px-6 py-12 md:py-16 lg:py-20";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  width?: "narrow" | "wide";
};

export function PageContainer({
  children,
  className = "",
  width = "wide",
}: PageContainerProps) {
  const base = width === "narrow" ? containerNarrowClass : containerClass;
  return <div className={`${base} ${className}`.trim()}>{children}</div>;
}

export function PageMain({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <main className={`${mainSurfaceClass} ${className}`.trim()}>{children}</main>;
}

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-[var(--border-soft)] bg-[var(--surface)] p-6 shadow-[0_8px_24px_rgba(42,51,53,0.07)] ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function KinCard({ children, className = "" }: CardProps) {
  return <Card className={className}>{children}</Card>;
}

type SectionProps = {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  titleId?: string;
};

export function Section({
  children,
  className = "",
  title,
  subtitle,
  titleId,
}: SectionProps) {
  return (
    <section className={`space-y-5 ${className}`.trim()} aria-labelledby={titleId}>
      {title ? (
        <div className="space-y-2">
          <h2
            id={titleId}
            className="text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="max-w-3xl text-base leading-relaxed text-[var(--foreground)]/80">
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

const btnBase =
  "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6f74]";

const btnPrimary =
  "bg-[var(--accent)] text-[var(--background)] hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60";
const btnSecondary =
  "border border-[var(--field-border)] bg-[var(--accent-soft)] text-[var(--foreground)] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  onClick,
}: ButtonProps) {
  const variantClass = variant === "primary" ? btnPrimary : btnSecondary;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${btnBase} ${variantClass} ${className}`.trim()}
    >
      {children}
    </button>
  );
}

export function KinButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  const variantClass = variant === "primary" ? btnPrimary : btnSecondary;

  return (
    <Link
      href={href}
      className={`${btnBase} ${variantClass} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}

export function KinSectionTitle({
  children,
  as: Tag = "h2",
  className = "",
  id,
}: {
  children: ReactNode;
  as?: "h2" | "h3";
  className?: string;
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={`text-2xl font-semibold tracking-tight text-[var(--foreground)] md:text-3xl ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}

export function KinPageTitle({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <h1
      id={id}
      className={`text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl ${className}`.trim()}
    >
      {children}
    </h1>
  );
}

export const bodyTextClass =
  "text-base leading-relaxed text-[var(--foreground)]/80";

export function FeedCard({
  title,
  body,
  meta,
  imageUrl,
  authorAvatarUrl,
  postedAtLabel,
  linkifyBody = false,
}: {
  title: string;
  body: string;
  /** e.g. author name or section label */
  meta?: string;
  /** Public Storage URL; shown above the text when set */
  imageUrl?: string | null;
  /** Small round photo next to author line (Town Square) */
  authorAvatarUrl?: string | null;
  /** Short date line next to author */
  postedAtLabel?: string;
  /** Turn plain URLs in body into clickable links */
  linkifyBody?: boolean;
}) {
  return (
    <KinCard className="overflow-hidden p-6">
      {imageUrl ? (
        <div className="-mx-6 -mt-6 mb-5 overflow-hidden rounded-b-xl bg-[#efe5d8]">
          <div className="max-h-44 w-full sm:max-h-48">
            {/* eslint-disable-next-line @next/next/no-img-element -- Supabase public URLs; avoids dynamic remotePatterns per project */}
            <img
              src={imageUrl}
              alt=""
              className="h-44 w-full object-cover sm:h-48"
            />
          </div>
        </div>
      ) : null}
      <div className="flex items-start gap-3">
        {authorAvatarUrl ? (
          <div className="mt-0.5 size-9 shrink-0 overflow-hidden rounded-full border border-[#d8cbb8] bg-[#f3ebe0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={authorAvatarUrl}
              alt=""
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e5dacb] text-xs font-semibold text-[#4a5a5d]"
            aria-hidden
          >
            {(meta ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-medium text-[#223436]">
              {meta ?? "Community"}
            </p>
            {postedAtLabel ? (
              <span className="text-xs text-[#5f6f72]">
                {postedAtLabel}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-[#223436]">
            {title}
          </h3>
          {linkifyBody ? (
            <LinkifiedText
              text={body}
              className={`${bodyTextClass} mt-3 text-sm leading-relaxed`}
            />
          ) : (
            <p className={`${bodyTextClass} mt-3 text-sm leading-relaxed`}>
              {body}
            </p>
          )}
        </div>
      </div>
    </KinCard>
  );
}

function normalizeUrl(raw: string): string {
  return raw.startsWith("www.") ? `https://${raw}` : raw;
}

function trimUrlPunctuation(raw: string): { url: string; trailing: string } {
  let url = raw;
  let trailing = "";
  while (url.length > 0 && /[),.;!?]$/.test(url)) {
    trailing = url.slice(-1) + trailing;
    url = url.slice(0, -1);
  }
  return { url, trailing };
}

export function LinkifiedText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const tokenPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|@\[[^\]]+\]|@[A-Za-z0-9_]+)/gi;
  const parts = text.split(tokenPattern);
  return (
    <p className={className}>
      {parts.map((part, idx) => {
        const isUrl = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i.test(part);
        const isMention = /^@\[[^\]]+\]$|^@[A-Za-z0-9_]+$/.test(part);
        if (!isUrl && !isMention) return <span key={`txt-${idx}`}>{part}</span>;

        if (isMention) {
          const label =
            part.startsWith("@[") && part.endsWith("]")
              ? `@${part.slice(2, -1)}`
              : part;
          return (
            <strong key={`m-${idx}`} className="font-semibold text-[#2f6f74]">
              {label}
            </strong>
          );
        }

        const { url, trailing } = trimUrlPunctuation(part);
        const href = normalizeUrl(url);
        return (
          <span key={`url-${idx}`}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#2f6f74] underline underline-offset-4"
            >
              {url}
            </a>
            {trailing}
          </span>
        );
      })}
    </p>
  );
}
