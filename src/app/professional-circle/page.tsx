import type { Metadata } from "next";
import { HubPlacePage } from "@/app/components/hub-place-page";

export const metadata: Metadata = {
  title: "Professional Circle",
  description:
    "Trusted referrals and local collaboration for people who work and build — on KIN.",
};

export default function ProfessionalCirclePage() {
  return (
    <HubPlacePage
      title="Professional Circle"
      description="A quieter room for work — referrals, vetted introductions, and local collaboration without the hustle culture noise."
      samples={[
        {
          meta: "Referral",
          title: "Looking for a trusted web developer",
          body: "Small nonprofit site refresh — accessibility matters, timeline is flexible, budget is modest but fair.",
        },
        {
          meta: "Marketing",
          title: "Marketing help for a local bakery launch",
          body: "Need someone who understands neighborhood word-of-mouth, not just ads. Prefer to hire from within KIN first.",
        },
        {
          meta: "Finance",
          title: "Bookkeeping recommendation for a two-person shop",
          body: "Outgrowing spreadsheets; want monthly reconciliation and someone who explains reports in plain English.",
        },
        {
          meta: "Collaboration",
          title: "Photographer + writer for a community history project",
          body: "Volunteer-led, grant-funded stipend. Looking for collaborators who’ve done oral history or similar before.",
        },
        {
          meta: "Introductions",
          title: "Trusted introduction to a commercial landlord",
          body: "Expanding a tutoring space — seeking a landlord known for fair leases, not just lowest square-foot cost.",
        },
        {
          meta: "Legal",
          title: "Small-business attorney for contract review",
          body: "Vendor agreement template — want a one-hour read, not a retainer. Referrals from other owners appreciated.",
        },
      ]}
    />
  );
}
