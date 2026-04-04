import type { Metadata } from "next";
import { HubPlacePage } from "@/app/components/hub-place-page";

export const metadata: Metadata = {
  title: "Meetups",
  description:
    "Casual in-person gatherings on KIN — coffee, walks, families, and low-pressure connection.",
};

export default function MeetupsPage() {
  return (
    <HubPlacePage
      title="Meetups"
      description="Real-world rooms off the feed — short commitments, clear expectations, and room for people who prefer showing up to scrolling."
      samples={[
        {
          meta: "Casual",
          title: "Saturday coffee — no agenda",
          body: "Mid-morning downtown. Bring a book if you want quiet company, or just chat. First table on the left.",
        },
        {
          meta: "Active",
          title: "Neighborhood walking group",
          body: "Easy pace, 45 minutes, rain-or-shine except thunderstorms. Meet at the community garden gate.",
        },
        {
          meta: "Families",
          title: "Young families get-together at the playground",
          body: "Sunday late afternoon — juice boxes optional, sunscreen required. Parents swap survival tips while kids tire themselves out.",
        },
        {
          meta: "Professional",
          title: "Small networking breakfast",
          body: "Eight seats, 7:30am, no pitches — just “what are you working on?” and mutual introductions.",
        },
        {
          meta: "Social",
          title: "Casual game night — board games provided",
          body: "Friday 7pm, snacks to share welcome. Rules taught patiently; competitive spirits leave egos at the door.",
        },
        {
          meta: "Creative",
          title: "Sketching in the park",
          body: "All levels, pencils or tablets. Two hours, optional critique circle at the end.",
        },
      ]}
    />
  );
}
