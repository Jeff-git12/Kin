import type { Metadata } from "next";
import {
  PageMain,
  containerNarrowClass,
} from "@/app/components/kin-ui";

export const metadata: Metadata = {
  title: "Community Standards",
  description:
    "KIN is built on trust, respect, and shared responsibility. These standards are not suggestions.",
};

const body = "text-base leading-relaxed text-stone-700 dark:text-stone-300";
const h2 =
  "mt-12 text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50";
const list = "mt-4 list-disc space-y-2 pl-5 text-stone-700 dark:text-stone-300";

export default function StandardsPage() {
  return (
    <PageMain>
      <article className={containerNarrowClass}>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 md:text-5xl">
          Community Standards
        </h1>

        <p className={`${body} mt-8`}>
          KIN is built on trust, respect, and shared responsibility.
        </p>
        <p className={`${body} mt-6`}>
          These standards are not suggestions. They are what make this
          platform work.
        </p>

        <h2 className={h2}>Core expectations</h2>
        <ul className={list}>
          <li>Treat people with respect</li>
          <li>No harassment, bullying, or shaming</li>
          <li>No sexualized or explicit content</li>
          <li>No graphic or violent content</li>
          <li>Disagreement is allowed — disrespect is not</li>
          <li>Engage in good faith</li>
          <li>Add value where you can</li>
        </ul>

        <h2 className={h2}>What this means in practice</h2>
        <p className={`${body} mt-4`}>You can disagree.</p>
        <p className={`${body} mt-4`}>You can challenge ideas.</p>
        <p className={`${body} mt-4`}>You can have strong opinions.</p>
        <p className={`${body} mt-6`}>But you cannot:</p>
        <ul className={list}>
          <li>attack people</li>
          <li>demean others</li>
          <li>create chaos for attention</li>
        </ul>

        <h2 className={h2}>Enforcement</h2>
        <p className={`${body} mt-4`}>We take these standards seriously.</p>
        <p className={`${body} mt-6`}>Violations may result in:</p>
        <ul className={list}>
          <li>content removal</li>
          <li>warnings</li>
          <li>temporary restrictions</li>
          <li>account suspension</li>
        </ul>
        <p className={`${body} mt-6`}>
          This is how we protect the environment for everyone.
        </p>

        <h2 className={h2}>Why this matters</h2>
        <p className={`${body} mt-4`}>Most platforms manage chaos.</p>
        <p className={`${body} mt-6`}>KIN is designed to prevent it.</p>
        <p className={`${body} mt-6`}>
          That only works if everyone participates in upholding the standard.
        </p>
      </article>
    </PageMain>
  );
}
