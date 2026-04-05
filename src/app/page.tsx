import {
  bodyTextClass,
  Card,
  KinButtonLink,
  KinCard,
  KinPageTitle,
  PageContainer,
  PageMain,
  Section,
} from "@/app/components/kin-ui";

const pillars = [
  {
    title: "Connect",
    body: "Build real relationships with people nearby through useful conversations, thoughtful introductions, and trusted referrals.",
  },
  {
    title: "Grow",
    body: "Learn from shared experience, practical guidance, and everyday support that helps families and communities move forward.",
  },
  {
    title: "Belong",
    body: "Show up as a real person in a respectful environment designed for belonging, not performance.",
  },
] as const;

const spaces = [
  {
    title: "Town Square",
    description: "A calm place for community conversation and everyday updates.",
    href: "/town-square",
  },
  {
    title: "Trusted Services",
    description: "Browse and share recommendations for people neighbors trust.",
    href: "/trusted-services",
  },
  {
    title: "Meetups",
    description: "Low-pressure gatherings that make local connections easier.",
    href: "/meetups",
  },
] as const;

export default function Home() {
  return (
    <PageMain>
      <PageContainer className="space-y-14" width="wide">
        <Section className="max-w-3xl" titleId="home-hero">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#5f6f72]">
            Trust-first community platform
          </p>
          <KinPageTitle id="home-hero" className="mt-3">
            Connect. Grow. Belong.
          </KinPageTitle>
          <p className={`${bodyTextClass} mt-6 text-lg`}>
            KIN is a calmer digital community center designed for people who
            want meaningful connection without chaos, outrage, or performative
            social pressure.
          </p>
          <p className={`${bodyTextClass} mt-3`}>
            We focus on trust, usefulness, and belonging so you can find help,
            share what you know, and build stronger local relationships.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <KinButtonLink href="/about">Why KIN exists</KinButtonLink>
            <KinButtonLink href="/standards" variant="secondary">
              Read community standards
            </KinButtonLink>
          </div>
        </Section>

        <Section
          title="Why KIN exists"
          titleId="why-kin"
          subtitle="Most social products optimize for attention. KIN is built around community health. We believe respectful environments help people contribute more, ask for help earlier, and stay connected longer."
        >
          <Card className="max-w-3xl bg-[#f3ebe0]">
            <p className="text-sm leading-relaxed text-[#3f5255]">
              KIN is for neighbors, families, and professionals who want one
              thoughtful place to connect and build together - not another feed
              designed to keep people angry and scrolling.
            </p>
          </Card>
        </Section>

        <Section
          title="Three pillars"
          titleId="pillars"
          subtitle="Every feature in KIN is shaped by these principles."
        >
          <ul className="grid list-none gap-5 p-0 md:grid-cols-3">
            {pillars.map((pillar) => (
              <li key={pillar.title}>
                <KinCard className="h-full">
                  <h3 className="text-lg font-semibold text-[#223436]">
                    {pillar.title}
                  </h3>
                  <p className={`${bodyTextClass} mt-3 text-sm`}>{pillar.body}</p>
                </KinCard>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="A quick standards preview"
          titleId="standards-preview"
          subtitle="The tone here is intentional: respectful, useful, and humane."
        >
          <Card className="max-w-3xl">
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#3f5255]">
              <li>Respect people, even when you disagree.</li>
              <li>No harassment, shaming, or rage-driven behavior.</li>
              <li>No sexualized content or harmful posting.</li>
              <li>Contribute in good faith and keep things constructive.</li>
            </ul>
          </Card>
        </Section>

        <Section
          title="Start exploring"
          titleId="explore"
          subtitle="A few places where KIN is immediately useful."
        >
          <ul className="grid list-none gap-5 p-0 md:grid-cols-3">
            {spaces.map((space) => (
              <li key={space.href}>
                <KinCard className="flex h-full flex-col">
                  <h3 className="text-lg font-semibold text-[#223436]">
                    {space.title}
                  </h3>
                  <p className={`${bodyTextClass} mt-2 flex-1 text-sm`}>
                    {space.description}
                  </p>
                  <div className="mt-5">
                    <KinButtonLink href={space.href} variant="secondary">
                      Open
                    </KinButtonLink>
                  </div>
                </KinCard>
              </li>
            ))}
          </ul>
        </Section>
      </PageContainer>
    </PageMain>
  );
}
