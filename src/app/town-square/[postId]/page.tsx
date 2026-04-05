import type { Metadata } from "next";
import { TownSquareThreadView } from "@/app/components/town-square-thread-view";

export const metadata: Metadata = {
  title: "Town Square Post",
  description: "View and reply to a specific Town Square post.",
};

export default async function TownSquarePostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  return <TownSquareThreadView postId={postId} />;
}
