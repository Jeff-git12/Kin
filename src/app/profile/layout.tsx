import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your KIN profile and photo.",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
