import type { Metadata } from "next";
import { HubPlacePage } from "@/app/components/hub-place-page";

export const metadata: Metadata = {
  title: "Local Life",
  description:
    "Shops, services, civic life, and everyday recommendations near you — on KIN.",
};

export default function LocalLifePage() {
  return (
    <HubPlacePage
      title="Local Life"
      description="Where to go, who to call, and what’s changing on the ground — curated by people who live here, not algorithms chasing clicks."
      samples={[
        {
          meta: "Update",
          title: "Farmers market — new winter hours",
          body: "Opens 9am Sundays only through March; hot cider stand rotating vendors.",
        },
        {
          meta: "Question",
          title: "Quietest coffee shop corner for reading?",
          body: "Need a two-hour stretch with minimal playlist drama. Laptop OK but I’ll keep typing soft.",
        },
        {
          meta: "Volunteer",
          title: "Park clean-up Saturday — gloves provided",
          body: "Kids welcome with a guardian. Trash bags and donuts at the pavilion at 9.",
        },
        {
          meta: "Kids",
          title: "Library story time ages 2–4",
          body: "Thursday mornings; tickets free but limited — arrive ten minutes early for a floor cushion.",
        },
      ]}
    />
  );
}
