import type { Metadata } from "next";
import {
  PageMain,
  containerNarrowClass,
} from "@/app/components/kin-ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "KIN is a trust-first platform built for people who want real connection without the chaos.",
};

const body = "text-base leading-relaxed text-stone-700 dark:text-stone-300";
const h2 =
  "mt-12 text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50";
const list = "mt-4 list-disc space-y-2 pl-5 text-stone-700 dark:text-stone-300";

export default function AboutPage() {
  return (
    <PageMain>
      <article className={containerNarrowClass}>
        <div className="space-y-6">
          <p className={body}>
            KIN exists to create a better environment for real connection.
          </p>
          <p className={body}>
            We believe people are not the problem — the environment is. Most
            platforms reward outrage, noise, and division.
          </p>
          <p className={body}>KIN is built differently.</p>
          <p className={body}>
            {
              "Here, connection comes before attention. Usefulness matters more than virality. And how we treat each other is not optional — it's the foundation."
            }
          </p>
          <p className={`${body} font-medium text-stone-900 dark:text-stone-100`}>
            Connect. Grow. Belong.
          </p>
        </div>

        <h1 className="mt-16 text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 md:text-5xl">
          Connect. Grow. Belong.
        </h1>

        <p className={`${body} mt-8`}>
          KIN is a trust-first platform built for people who want real
          connection without the chaos.
        </p>
        <p className={`${body} mt-6`}>
          Social media was meant to bring people together. Instead, it often
          rewards outrage, division, and noise.
        </p>
        <p className={`${body} mt-6`}>KIN takes a different approach.</p>

        <h2 className={h2}>Why KIN exists</h2>
        <p className={`${body} mt-4`}>
          {"We believe the problem isn't people — it's the environment."}
        </p>
        <p className={`${body} mt-6`}>
          When platforms reward attention at all costs, behavior changes.
          Conversations break down. Trust disappears. Noise takes over.
        </p>
        <p className={`${body} mt-6`}>KIN is designed to reverse that.</p>

        <h2 className={h2}>What makes KIN different</h2>
        <ul className={list}>
          <li>Connection over attention</li>
          <li>Usefulness over noise</li>
          <li>Standards over anything goes</li>
        </ul>
        <p className={`${body} mt-6`}>
          {
            "This is not a platform for going viral. It's a platform for showing up with intention."
          }
        </p>

        <h2 className={h2}>What you can expect</h2>
        <ul className={list}>
          <li>Thoughtful conversations</li>
          <li>Respectful disagreement</li>
          <li>Real people, not personas</li>
          <li>A calmer, more meaningful experience</li>
        </ul>
        <p className={`${body} mt-8`}>KIN is not for everyone.</p>
        <p className={`${body} mt-4`}>
          {"It's for people who want something better."}
        </p>
      </article>
    </PageMain>
  );
}
