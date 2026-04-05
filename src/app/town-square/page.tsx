import type { Metadata } from "next";
import { PageMemoryPanel } from "@/app/components/page-memory-badge";
import { TownSquareFeed } from "@/app/components/town-square-feed";
import {
  PageMain,
  bodyTextClass,
  containerClass,
  KinPageTitle,
} from "@/app/components/kin-ui";

export const metadata: Metadata = {
  title: "Town Square",
  description:
    "Open conversation and neighborhood pulse — post updates, asks, and photos on KIN.",
};

export default function TownSquarePage() {
  return (
    <PageMain>
      <div className={containerClass}>
        <KinPageTitle>Town Square</KinPageTitle>
        <PageMemoryPanel
          kind="town-square"
          title="Town Square"
          subtitle="The central circle where neighbors share updates, asks, and local conversation."
        />
        <p className={`${bodyTextClass} mt-6 max-w-2xl`}>
          The open center of KIN — a calm place for updates, questions, and
          real conversation. No rush, no noise: just neighbors showing up with
          intention.
        </p>
        <div className="mt-12 max-w-2xl">
          <TownSquareFeed />
        </div>
      </div>
    </PageMain>
  );
}
