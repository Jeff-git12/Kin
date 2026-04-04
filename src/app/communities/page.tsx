import { CreateCommunityForm } from "@/app/components/create-community-form";
import {
  bodyTextClass,
  containerClass,
  KinButtonLink,
  KinCard,
  KinPageTitle,
  KinSectionTitle,
  PageMain,
} from "@/app/components/kin-ui";

const popularSpaces = [
  {
    name: "Town Square",
    description:
      "The open center for neighborhood pulse — quick updates and neighborly questions.",
    href: "/town-square",
  },
  {
    name: "Trusted Services",
    description:
      "Vetted referrals for people who show up and do the job right the first time.",
    href: "/trusted-services",
  },
  {
    name: "Meetups",
    description:
      "Coffee, walks, game nights — low-key ways to be in the same room.",
    href: "/meetups",
  },
  {
    name: "Support Circle",
    description:
      "Meal trains, rides, and encouragement when someone nearby needs backup.",
    href: "/support-circle",
  },
  {
    name: "Local Life",
    description:
      "Shops, civic life, and the small details that make a place feel like home.",
    href: "/local-life",
  },
  {
    name: "Professional Circle",
    description:
      "Referrals and collaborations for people building something in the community.",
    href: "/professional-circle",
  },
] as const;

const sectionDivider =
  "mt-16 border-t border-stone-200/80 pt-14 dark:border-stone-800 md:mt-20 md:pt-16";

const communities = [
  {
    name: "Neighbors & Newcomers",
    description:
      "Welcome wagons, block etiquette, and gentle introductions for people new to the area.",
    href: "/town-square",
  },
  {
    name: "Parents & Caregivers",
    description:
      "Schools, childcare swaps, and sanity-saving tips from people in the same season of life.",
    href: "/home-family",
  },
  {
    name: "Local Makers & Services",
    description:
      "Trusted referrals for trades, tutors, and small businesses your neighbors already use.",
    href: "/community-board",
  },
  {
    name: "Civic & Community Life",
    description:
      "Town halls, volunteer days, and constructive conversation about where we live.",
    href: "/local-life",
  },
  {
    name: "Hobbies & Learning",
    description:
      "Book clubs, running groups, language practice — low-key ways to connect.",
    href: "/connections",
  },
  {
    name: "Thoughtful Discussions",
    description:
      "Longer threads for ideas that need more than a headline — respect required.",
    href: "/conversations",
  },
] as const;

export default function CommunitiesPage() {
  return (
    <PageMain>
      <div className={containerClass}>
        <KinPageTitle>Communities</KinPageTitle>
        <p className={`${bodyTextClass} mt-6 max-w-2xl text-lg`}>
          Browse groups that feel like rooms in a community center — each one
          with a clear purpose and a calmer pace than typical social feeds.
        </p>
        <p className={`${bodyTextClass} mt-4 max-w-2xl`}>
          Choose a community to step inside. More spaces will appear as KIN
          grows.
        </p>

        <ul className="mt-12 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <li key={c.name}>
              <KinCard className="flex h-full flex-col">
                <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                  {c.name}
                </h2>
                <p className={`${bodyTextClass} mt-2 flex-1 text-sm`}>
                  {c.description}
                </p>
                <KinButtonLink href={c.href} className="mt-5 w-full sm:w-auto">
                  Enter
                </KinButtonLink>
              </KinCard>
            </li>
          ))}
        </ul>

        <section className={sectionDivider}>
          <KinSectionTitle id="popular-spaces-heading">
            Popular spaces on KIN
          </KinSectionTitle>
          <p className={`${bodyTextClass} mt-3 max-w-2xl`}>
            Stepping-stones people use every week — from the town square to
            trusted help and real-world meetups.
          </p>
          <ul className="mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {popularSpaces.map((space) => (
              <li key={space.href}>
                <KinCard className="flex h-full flex-col">
                  <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                    {space.name}
                  </h2>
                  <p className={`${bodyTextClass} mt-2 flex-1 text-sm`}>
                    {space.description}
                  </p>
                  <KinButtonLink
                    href={space.href}
                    variant="secondary"
                    className="mt-5 w-full sm:w-auto"
                  >
                    View
                  </KinButtonLink>
                </KinCard>
              </li>
            ))}
          </ul>
        </section>

        <section className={sectionDivider}>
          <KinSectionTitle>Start a community</KinSectionTitle>
          <p className={`${bodyTextClass} mt-3 max-w-2xl`}>
            Have an idea for a group? Tell us what you have in mind. We’ll use
            this to shape upcoming features.
          </p>
          <KinCard className="mt-8 max-w-xl">
            <CreateCommunityForm />
          </KinCard>
        </section>
      </div>
    </PageMain>
  );
}
