import type { Metadata } from "next";
import { HubPlacePage } from "@/app/components/hub-place-page";

export const metadata: Metadata = {
  title: "Conversations",
  description:
    "Thoughtful threads on KIN — room for nuance, disagreement without disrespect.",
};

export default function ConversationsPage() {
  return (
    <HubPlacePage
      title="Conversations"
      description="Longer-form discussion — ideas that need paragraphs, not hot takes. Curiosity and good faith are the price of entry."
      samples={[
        {
          meta: "Civic",
          title: "Disagreeing about zoning without tearing the neighborhood apart",
          body: "What ground rules have worked in your town halls? How do we keep fear from steering the whole conversation?",
        },
        {
          meta: "Values",
          title: "What does ‘support local’ mean in practice?",
          body: "Budgets are tight — when do you prioritize price, ethics, convenience, or relationships?",
        },
        {
          meta: "Home",
          title: "Phones at the dinner table — where’s your line?",
          body: "Teens, parents, and partners all navigating this. Rules that stuck vs. rules that backfired?",
        },
        {
          meta: "Housing",
          title: "Affordable housing ideas that don’t devolve into flame wars",
          body: "Looking for concrete models — mixed income, ADUs, co-ops — and how neighbors were brought in early.",
        },
      ]}
    />
  );
}
