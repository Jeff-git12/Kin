import type { Metadata } from "next";
import { TrustedServicesView } from "@/app/trusted-services/trusted-services-view";

export const metadata: Metadata = {
  title: "Trusted Services",
  description:
    "Neighbor-sourced directory for contractors, tutors, sitters, accountants, and dog care on KIN.",
};

export default function TrustedServicesPage() {
  return <TrustedServicesView />;
}
