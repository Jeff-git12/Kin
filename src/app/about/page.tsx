import type { Metadata } from "next";
import {
  Card,
  KinPageTitle,
  PageMain,
  PageContainer,
  Section,
  bodyTextClass,
} from "@/app/components/kin-ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "What KIN is, why it exists, and how it creates a calmer community experience.",
};

export default function AboutPage() {
  return (
    <PageMain>
      <PageContainer width="narrow" className="space-y-12">
        <header className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#5f6f72]">
            About KIN
          </p>
          <KinPageTitle>Connect. Grow. Belong.</KinPageTitle>
          <p className={`${bodyTextClass} max-w-xl`}>
            KIN is a trust-first social platform built to feel like a modern
            community center: useful, respectful, and calm.
          </p>
        </header>

        <Section title="What KIN is" titleId="what-kin-is">
          <Card>
            <p className={bodyTextClass}>
              KIN is a place to ask for help, share practical knowledge, and
              build relationships with people who care about community - not
              just attention.
            </p>
          </Card>
        </Section>

        <Section title="Why it exists" titleId="why-it-exists">
          <p className={bodyTextClass}>
            We built KIN because many social experiences reward outrage, speed,
            and performance. That environment makes healthy conversation harder.
          </p>
          <p className={bodyTextClass}>
            KIN is designed with different incentives: trust over virality,
            usefulness over noise, and standards over chaos.
          </p>
        </Section>

        <Section
          title="How KIN is different"
          titleId="how-kin-different"
          subtitle="Traditional social platforms often optimize for engagement at any cost. KIN optimizes for community quality."
        >
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#3f5255]">
            <li>Conversation that values people over performance</li>
            <li>Space for disagreement without hostility</li>
            <li>Design choices that lower noise and increase clarity</li>
            <li>Community standards that are visible and enforced</li>
          </ul>
        </Section>
      </PageContainer>
    </PageMain>
  );
}
