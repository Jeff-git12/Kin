import Link from "next/link";
import type { ReactNode } from "react";

/** Full-width main area below the header */
export const mainSurfaceClass =
  "min-h-screen flex-1 bg-stone-50 dark:bg-stone-950";

/** Default content width for hub-style pages */
export const containerClass =
  "mx-auto w-full max-w-5xl px-6 py-12 md:py-16 lg:py-20";

/** Narrow width for long-form reading */
export const containerNarrowClass =
  "mx-auto w-full max-w-2xl px-6 py-12 md:py-16 lg:py-20";

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

export function KinCard({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/60 ${className}`.trim()}
    >
      {children}
    </div>
  );
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

const btnBase =
  "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400";

export function KinButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonLinkProps) {
  const variantClass =
    variant === "primary"
      ? "bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
      : "border border-stone-300 bg-transparent text-stone-800 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-100 dark:hover:bg-stone-800";

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
      className={`text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 md:text-3xl ${className}`.trim()}
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
      className={`text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 md:text-5xl ${className}`.trim()}
    >
      {children}
    </h1>
  );
}

export const bodyTextClass =
  "text-base leading-relaxed text-stone-700 dark:text-stone-300";

export function FeedCard({
  title,
  body,
  meta,
  imageUrl,
  authorAvatarUrl,
  postedAtLabel,
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
}) {
  return (
    <KinCard className="overflow-hidden p-6">
      {imageUrl ? (
        <div className="-mx-6 -mt-6 mb-5 overflow-hidden rounded-b-xl bg-stone-100 dark:bg-stone-800">
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
          <div className="mt-0.5 size-9 shrink-0 overflow-hidden rounded-full border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={authorAvatarUrl}
              alt=""
              className="size-full object-cover"
            />
          </div>
        ) : (
          <div
            className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-600 dark:bg-stone-700 dark:text-stone-300"
            aria-hidden
          >
            {(meta ?? "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
              {meta ?? "Community"}
            </p>
            {postedAtLabel ? (
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {postedAtLabel}
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-stone-900 dark:text-stone-50">
            {title}
          </h3>
          <p className={`${bodyTextClass} mt-3 text-sm leading-relaxed`}>
            {body}
          </p>
        </div>
      </div>
    </KinCard>
  );
}
