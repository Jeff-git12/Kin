import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Complete your KIN profile and agree to community standards.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
