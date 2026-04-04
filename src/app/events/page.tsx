import type { Metadata } from "next";
import { HubPlacePage } from "@/app/components/hub-place-page";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Gatherings, meetups, and community moments on KIN — show up with intention.",
};

export default function EventsPage() {
  return (
    <HubPlacePage
      title="Events"
      description="A bulletin of real-world moments — potlucks, civic sessions, and low-key meetups. RSVPs and full scheduling will connect here as KIN grows."
      samples={[
        {
          meta: "This week",
          title: "Community potluck — bring a dish to share",
          body: "Sunday 5–7pm at the rec center. Vegetarian options especially welcome. Kids’ table planned.",
        },
        {
          meta: "Civic",
          title: "Town budget listening session",
          body: "Wednesday evening, hybrid format. Focus on questions, not speeches — facilitators from the library.",
        },
        {
          meta: "Wellness",
          title: "Beginner-friendly yoga in the park",
          body: "Saturday 9am near the fountain. Bring a mat or towel; instructor donates time.",
        },
        {
          meta: "Service",
          title: "Blood drive at the fire hall",
          body: "Walk-ins OK 10–2. Snacks and stickers for donors — neighbors helping neighbors.",
        },
      ]}
    />
  );
}
