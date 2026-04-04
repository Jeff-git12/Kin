import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communities",
  description:
    "Browse KIN communities — trust-first spaces for real connection.",
};

export default function CommunitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
