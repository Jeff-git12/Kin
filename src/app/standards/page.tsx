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
  title: "Community Standards",
  description:
    "Simple community standards that keep KIN respectful, calm, and useful.",
};

export default function StandardsPage() {
  return (
    <PageMain>
      <PageContainer width="narrow" className="space-y-12">
        <header className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#5f6f72]">
            Community Standards
          </p>
          <KinPageTitle>Shared standards for a better environment</KinPageTitle>
          <p className={bodyTextClass}>
            KIN works because members agree to protect the quality of the
            environment together.
          </p>
        </header>

        <Section title="Core rules" titleId="core-rules">
          <Card>
            <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-[#3f5255]">
              <li>Respect others.</li>
              <li>No harassment or shaming.</li>
              <li>No sexualized content.</li>
              <li>No rage-driven behavior.</li>
              <li>Disagree without hostility.</li>
            </ul>
          </Card>
        </Section>

        <Section
          title="How enforcement works"
          titleId="enforcement"
          subtitle="When standards are broken, we act to protect the community."
        >
          <p className={bodyTextClass}>
            Depending on severity, enforcement may include content removal,
            warnings, temporary restrictions, or account suspension.
          </p>
          <p className={bodyTextClass}>
            The goal is not punishment for its own sake. The goal is preserving
            a calmer, safer, more respectful place to connect.
          </p>
        </Section>
      </PageContainer>
    </PageMain>
  );
}
