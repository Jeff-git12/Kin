import {
  bodyTextClass,
  containerClass,
  FeedCard,
  KinPageTitle,
  PageMain,
} from "@/app/components/kin-ui";

export type HubSample = {
  title: string;
  body: string;
  meta?: string;
};

export function HubPlacePage({
  title,
  description,
  samples,
}: {
  title: string;
  description: string;
  samples: HubSample[];
}) {
  return (
    <PageMain>
      <div className={containerClass}>
        <KinPageTitle>{title}</KinPageTitle>
        <p className={`${bodyTextClass} mt-6 max-w-2xl`}>{description}</p>
        <ul className="mt-12 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {samples.map((s) => (
            <li key={s.title}>
              <FeedCard title={s.title} body={s.body} meta={s.meta} />
            </li>
          ))}
        </ul>
      </div>
    </PageMain>
  );
}
