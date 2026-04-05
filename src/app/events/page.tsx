import type { Metadata } from "next";
import { EventsView } from "@/app/components/events-view";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Gatherings, meetups, and community moments on KIN — show up with intention.",
};

export default function EventsPage() {
  return <EventsView />;
}
