import type { Metadata } from "next";
import { HubPlacePage } from "@/app/components/hub-place-page";

export const metadata: Metadata = {
  title: "Connections",
  description:
    "Find people with shared interests and life stages — low-pressure introductions on KIN.",
};

export default function ConnectionsPage() {
  return (
    <HubPlacePage
      title="Connections"
      description="Not networking for its own sake — just human bridges. Running buddies, study partners, hobby co-pilots. No DMs required until you’re ready."
      samples={[
        {
          meta: "New here",
          title: "Looking for an easy-pace running buddy",
          body: "Mornings before 7, 3–5 miles. Training for nothing in particular except consistency.",
        },
        {
          meta: "Creative",
          title: "Amateur photographer seeking critique partner",
          body: "Monthly coffee, swap a few images, kind but honest feedback. Street and portrait focus.",
        },
        {
          meta: "Offering",
          title: "Retired teacher — free algebra drop-in",
          body: "Saturdays 10–12 at the library study room. First come; middle school level preferred this month.",
        },
        {
          meta: "Social",
          title: "Board-game night hosts wanted",
          body: "We have a rotating group of eight — looking for one more host with a big table and patience for rule explanations.",
        },
      ]}
    />
  );
}
