import type { Metadata } from "next";
import { HubPlacePage } from "@/app/components/hub-place-page";

export const metadata: Metadata = {
  title: "Community Board",
  description:
    "Offers, asks, and local resources posted by people you can trust — KIN’s community bulletin.",
};

export default function CommunityBoardPage() {
  return (
    <HubPlacePage
      title="Community Board"
      description="Pin your offer or your ask — tools, time, furniture, skills. Keep it honest and specific; reputation here is everything."
      samples={[
        {
          meta: "Offering",
          title: "Bike tune-ups Sunday afternoon",
          body: "Basic adjustments and flat fixes — not full restorations. Two slots left; tools provided if you want to learn alongside.",
        },
        {
          meta: "Looking for",
          title: "Responsible teen for after-school dog walk",
          body: "Friendly golden, 20 minutes Mon/Wed. Prefer someone a neighbor can vouch for.",
        },
        {
          meta: "Free",
          title: "Moving boxes — curb alert on Oak",
          body: "Broken down and dry. Please take only what you’ll use; trying to avoid a soggy pile tonight.",
        },
        {
          meta: "Free",
          title: "Small desk — good for a student nook",
          body: "Light wear, all drawers slide. Porch pickup; I’ll help load if needed.",
        },
      ]}
    />
  );
}
