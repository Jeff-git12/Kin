import type { Metadata } from "next";
import { HubPlacePage } from "@/app/components/hub-place-page";

export const metadata: Metadata = {
  title: "Home & Family",
  description:
    "Parenting, caregiving, and household life — practical support in a calmer environment.",
};

export default function HomeFamilyPage() {
  return (
    <HubPlacePage
      title="Home & Family"
      description="The family room of the community center — schools, routines, care networks, and the small wins that keep a household running."
      samples={[
        {
          meta: "Referral",
          title: "Pediatric dentist who takes anxious kids?",
          body: "First cleaning in two years — need someone who won’t rush and explains every tool. East side preferred.",
        },
        {
          meta: "Kitchen table",
          title: "Packing lunches that aren’t boring — ideas?",
          body: "Middle schooler suddenly ‘over’ sandwiches. Nut-free classroom. What’s working in your house?",
        },
        {
          meta: "Care",
          title: "Reliable backup sitter for date nights",
          body: "Two kids, 6 and 9, bedtime by 8:30. Would love someone local with references from other KIN families.",
        },
        {
          meta: "Routines",
          title: "Homework routine that works for middle schoolers",
          body: "We’re fighting the same battle — share what’s realistic, not Pinterest-perfect.",
        },
      ]}
    />
  );
}
