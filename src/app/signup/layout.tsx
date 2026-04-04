import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your KIN account — connect, grow, and belong.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
