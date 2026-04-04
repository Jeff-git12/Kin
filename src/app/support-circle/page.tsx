import type { Metadata } from "next";
import { HubPlacePage } from "@/app/components/hub-place-page";

export const metadata: Metadata = {
  title: "Support Circle",
  description:
    "Practical and emotional support on KIN — meal trains, rides, encouragement, and neighborly care.",
};

export default function SupportCirclePage() {
  return (
    <HubPlacePage
      title="Support Circle"
      description="When life gets heavy, this is the room for specific asks and gentle offers — meals, rides, encouragement, and check-ins without performance."
      samples={[
        {
          meta: "Meals",
          title: "Meal train for a family with a newborn",
          body: "Drop-off window 5–7pm; allergies listed in the signup sheet. Paper goods and freezer meals especially appreciated.",
        },
        {
          meta: "Encouragement",
          title: "Could use a few words of encouragement this week",
          body: "Caregiver burnout creeping in — not looking for advice, just kind notes or a quick walk if you’re free.",
        },
        {
          meta: "Recovery",
          title: "Help for a neighbor after surgery",
          body: "Light errands and trash bins for two weeks. Already have a schedule; one more afternoon slot open.",
        },
        {
          meta: "Transport",
          title: "Ride needed for a Tuesday appointment",
          body: "East side to clinic, 10am pickup, ~90 minutes total. Happy to cover gas and coffee.",
        },
        {
          meta: "Check-in",
          title: "Solo parent — could use a Friday check-in call",
          body: "Ten minutes max. Kids are fine; I just miss talking to another adult some weeks.",
        },
        {
          meta: "Kids",
          title: "After-school snack host one day this month",
          body: "Three middle schoolers, nut-free household. Homework quiet time 3:30–5; games after if energy allows.",
        },
      ]}
    />
  );
}
