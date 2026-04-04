import {
  bodyTextClass,
  containerClass,
  KinButtonLink,
  KinCard,
  KinPageTitle,
  KinSectionTitle,
  PageMain,
} from "@/app/components/kin-ui";

const exploreCards = [
  {
    title: "Town Square",
    description:
      "Open conversation and neighborhood pulse — notices, ideas, and what’s on people’s minds.",
    href: "/town-square",
  },
  {
    title: "Community Board",
    description:
      "Offers, asks, and local resources posted by people you can actually trust.",
    href: "/community-board",
  },
  {
    title: "Connections",
    description:
      "Find people with shared interests, skills, or life stages in a low-pressure space.",
    href: "/connections",
  },
  {
    title: "Home & Family",
    description:
      "Parenting, caregiving, schools, and household life — practical and supportive.",
    href: "/home-family",
  },
  {
    title: "Local Life",
    description:
      "What’s happening nearby: shops, services, civic life, and everyday recommendations.",
    href: "/local-life",
  },
  {
    title: "Conversations",
    description:
      "Threaded discussion with room for nuance — disagreement without disrespect.",
    href: "/conversations",
  },
  {
    title: "Events",
    description:
      "Gatherings, meetups, and community moments worth showing up for.",
    href: "/events",
  },
] as const;

const usefulSpaceCards = [
  {
    title: "Trusted Services",
    description:
      "Neighbor-vetted referrals for people who do good work — contractors, tutors, caregivers, and more.",
    href: "/trusted-services",
  },
  {
    title: "Meetups",
    description:
      "Low-key gatherings in real life: coffee, walks, game nights — show up as yourself.",
    href: "/meetups",
  },
  {
    title: "Support Circle",
    description:
      "Meal trains, rides, encouragement, and practical help when life gets heavy.",
    href: "/support-circle",
  },
  {
    title: "Professional Circle",
    description:
      "Referrals, collaborations, and trusted introductions for people who work and build locally.",
    href: "/professional-circle",
  },
] as const;

const todayItems = [
  {
    title: "Need a trusted contractor recommendation",
    preview:
      "Small bathroom refresh — looking for someone licensed who’s done work for neighbors.",
  },
  {
    title: "Looking for a math tutor for 6th grade",
    preview:
      "Prefer afternoons, in-person or hybrid. Happy to coordinate with another family.",
  },
  {
    title: "Best date-night restaurants nearby",
    preview:
      "Quiet tables, not too loud — celebrating an anniversary this weekend.",
  },
  {
    title: "What should I cook tonight?",
    preview:
      "Have chicken, kale, and a well-stocked pantry. Open to something new.",
  },
  {
    title: "Anyone interested in a coffee meetup?",
    preview:
      "Saturday mid-morning, downtown. No agenda — just good conversation.",
  },
  {
    title: "Introduce yourself to the community",
    preview:
      "New here — moved in last month, two kids, love hiking and local bookshops.",
  },
] as const;

/** Calm separation between major hub blocks */
const sectionRule =
  "mt-16 border-t border-stone-200/80 pt-14 dark:border-stone-800 md:mt-20 md:pt-16";

export default function Home() {
  return (
    <PageMain>
      <div className={containerClass}>
        {/* 1 — Welcome / mission */}
        <section aria-labelledby="welcome-heading" className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Connect. Grow. Belong.
          </p>
          <KinPageTitle className="mt-3" id="welcome-heading">
            Welcome to KIN
          </KinPageTitle>
          <p className={`${bodyTextClass} mt-6 text-lg`}>
            KIN is a better environment for real connection — where usefulness
            matters more than noise, and how we treat each other is the
            foundation.
          </p>
          <p className={`${bodyTextClass} mt-4`}>
            Think of KIN as a modern digital community center: one calm front
            desk for your neighborhood and networks, built for trust and
            intention.
          </p>
        </section>

        {/* 2 — Explore KIN */}
        <section
          aria-labelledby="explore-heading"
          className={`${sectionRule} scroll-mt-24`}
        >
          <KinSectionTitle id="explore-heading">Explore KIN</KinSectionTitle>
          <p className={`${bodyTextClass} mt-3 max-w-2xl`}>
            Pick a room to browse — each area is designed for a different kind
            of helpful, human exchange.
          </p>
          <ul className="mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {exploreCards.map((card) => (
              <li key={card.href}>
                <KinCard className="flex h-full flex-col">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                    {card.title}
                  </h3>
                  <p className={`${bodyTextClass} mt-2 flex-1 text-sm`}>
                    {card.description}
                  </p>
                  <KinButtonLink
                    href={card.href}
                    variant="secondary"
                    className="mt-5 w-full sm:w-auto"
                  >
                    Open
                  </KinButtonLink>
                </KinCard>
              </li>
            ))}
          </ul>
        </section>

        {/* 3 — Today in KIN */}
        <section
          aria-labelledby="today-heading"
          className={`${sectionRule} scroll-mt-24`}
        >
          <KinSectionTitle id="today-heading">Today in KIN</KinSectionTitle>
          <p className={`${bodyTextClass} mt-3 max-w-2xl`}>
            A sample of what people are sharing — thoughtful asks, local tips,
            and friendly introductions.
          </p>
          <ul className="mt-10 max-w-3xl list-none space-y-4 p-0">
            {todayItems.map((item) => (
              <li key={item.title}>
                <KinCard className="p-5">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-50">
                    {item.title}
                  </h3>
                  <p className={`${bodyTextClass} mt-2 text-sm`}>
                    {item.preview}
                  </p>
                </KinCard>
              </li>
            ))}
          </ul>
        </section>

        {/* 4 — Useful spaces */}
        <section
          aria-labelledby="useful-spaces-heading"
          className={`${sectionRule} scroll-mt-24`}
        >
          <KinSectionTitle id="useful-spaces-heading">
            Useful spaces on KIN
          </KinSectionTitle>
          <p className={`${bodyTextClass} mt-3 max-w-2xl`}>
            Extra rooms for everyday needs — referrals, gatherings, care, and
            professional trust. Thoughtfully separated so the rest of KIN stays
            calm.
          </p>
          <ul className="mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {usefulSpaceCards.map((card) => (
              <li key={card.href}>
                <KinCard className="flex h-full flex-col">
                  <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                    {card.title}
                  </h3>
                  <p className={`${bodyTextClass} mt-2 flex-1 text-sm`}>
                    {card.description}
                  </p>
                  <KinButtonLink
                    href={card.href}
                    variant="secondary"
                    className="mt-5 w-full sm:w-auto"
                  >
                    Open
                  </KinButtonLink>
                </KinCard>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageMain>
  );
}
