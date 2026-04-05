"use client";

import { CreateEventForm } from "@/app/components/create-event-form";
import { PageMemoryPanel } from "@/app/components/page-memory-badge";
import {
  KinCard,
  KinPageTitle,
  KinSectionTitle,
  PageContainer,
  PageMain,
  bodyTextClass,
} from "@/app/components/kin-ui";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type EventRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  starts_at: string;
  created_at: string;
};

const sampleEvents = [
  {
    title: "Coffee meetup for new neighbors",
    description:
      "A relaxed one-hour meetup to say hello and share local tips with people new to the area.",
    location: "Corner Cup Cafe",
    startsAtLabel: "Saturday, 10:00 AM",
  },
  {
    title: "Evening walking group",
    description:
      "Gentle 45-minute neighborhood walk. All ages welcome, strollers welcome.",
    location: "Maple Park entrance",
    startsAtLabel: "Tuesday, 6:30 PM",
  },
  {
    title: "Young families dinner table",
    description:
      "Casual dinner for parents of young kids. Bring one easy dish to share.",
    location: "Community Hall Room B",
    startsAtLabel: "Thursday, 5:45 PM",
  },
  {
    title: "Networking breakfast",
    description:
      "Low-pressure local professional breakfast: intros, referrals, and practical support.",
    location: "Riverside Deli",
    startsAtLabel: "Friday, 8:00 AM",
  },
  {
    title: "Neighborhood game night",
    description:
      "Bring a board game or join one. Friendly, welcoming, and beginner-friendly.",
    location: "Library meeting room",
    startsAtLabel: "Saturday, 7:00 PM",
  },
] as const;

function formatEventDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date to be confirmed";
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function EventsView() {
  const [userId, setUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    setLoadError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("events")
        .select("id, title, description, location, starts_at, created_at")
        .order("starts_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      setEvents((data as EventRow[]) ?? []);
    } catch (e) {
      setLoadError(
        e instanceof Error
          ? e.message
          : "Couldn’t load events. Please try again in a moment.",
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) setUserId(user?.id ?? null);
      } catch {
        if (!cancelled) setUserId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const sortedEvents = useMemo(() => {
    const now = Date.now();
    return [...events].sort((a, b) => {
      const aTime = new Date(a.starts_at).getTime();
      const bTime = new Date(b.starts_at).getTime();
      const aUpcoming = !Number.isNaN(aTime) && aTime >= now;
      const bUpcoming = !Number.isNaN(bTime) && bTime >= now;

      if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
      if (aUpcoming && bUpcoming) return aTime - bTime;
      if (!aUpcoming && !bUpcoming) return bTime - aTime;
      return 0;
    });
  }, [events]);

  return (
    <PageMain>
      <PageContainer width="wide">
        <KinPageTitle>Events</KinPageTitle>
        <PageMemoryPanel
          kind="events"
          title="Events"
          subtitle="A clear calendar-style space for gatherings people can actually attend."
        />
        <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-[#2f474a]">
          Shared moments help community become real. Browse local gatherings, or
          host one your neighbors would value.
        </p>
        <p className={`${bodyTextClass} mt-3 max-w-2xl`}>
          Keep events practical, welcoming, and clear. KIN is for gatherings
          that build trust in real life.
        </p>

        {userId ? (
          <KinCard className="mt-10 max-w-xl">
            <CreateEventForm userId={userId} onCreated={loadEvents} />
          </KinCard>
        ) : (
          <KinCard className="mt-10 max-w-xl border-dashed border-[#d8cbb8] bg-[#f3ebe0]">
            <p className="text-sm font-medium text-[#223436]">Want to host an event?</p>
            <p className="mt-2 text-sm leading-relaxed text-[#4a5a5d]">
              Sign in to post one. Everyone can still browse events.
            </p>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link
                href="/login?next=/events"
                className="font-medium text-[#2f6f74] underline underline-offset-4"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="font-medium text-[#2f6f74] underline underline-offset-4"
              >
                Sign up
              </Link>
            </p>
          </KinCard>
        )}

        <KinSectionTitle className="mt-14">Community events</KinSectionTitle>
        <p className={`${bodyTextClass} mt-3 max-w-2xl`}>
          Upcoming events appear first. Past events stay visible for context.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-[#5f6f72]">Loading events…</p>
        ) : loadError ? (
          <p className="mt-8 text-sm text-red-700" role="alert">
            {loadError}{" "}
            <span className="text-[#5f6f72]">
              (Run{" "}
              <code className="rounded bg-[#efe5d8] px-1">
                docs/events-setup.sql
              </code>{" "}
              in Supabase if you have not created the table yet.)
            </span>
          </p>
        ) : sortedEvents.length === 0 ? (
          <>
            <KinCard className="mt-8 max-w-2xl border-dashed border-[#d8cbb8] bg-[#f3ebe0]">
              <p className="text-base font-medium text-[#223436]">
                No community events have been posted yet.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4a5a5d]">
                Start simple - a coffee meetup or evening walk is enough to
                bring people together.
              </p>
            </KinCard>

            <p className="mt-8 text-sm font-medium uppercase tracking-wider text-[#5f6f72]">
              Example event ideas
            </p>
            <ul className="mt-3 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {sampleEvents.map((event) => (
                <li key={event.title}>
                  <KinCard className="flex h-full flex-col p-6">
                    <h2 className="text-lg font-semibold leading-snug tracking-tight text-[#223436]">
                      {event.title}
                    </h2>
                    <p className={`${bodyTextClass} mt-3 flex-1 text-sm leading-relaxed`}>
                      {event.description}
                    </p>
                    <dl className="mt-5 space-y-2 border-t border-[#e5dacb] pt-4 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6f72]">
                          Location
                        </dt>
                        <dd className="mt-0.5 text-[#3f5255]">{event.location}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6f72]">
                          Time
                        </dt>
                        <dd className="mt-0.5 text-[#3f5255]">{event.startsAtLabel}</dd>
                      </div>
                    </dl>
                  </KinCard>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <ul className="mt-8 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {sortedEvents.map((event) => (
                <li key={event.id}>
                  <KinCard className="flex h-full flex-col p-6">
                    <h2 className="text-lg font-semibold leading-snug tracking-tight text-[#223436]">
                      {event.title}
                    </h2>
                    <p className={`${bodyTextClass} mt-3 flex-1 text-sm leading-relaxed`}>
                      {event.description}
                    </p>
                    <dl className="mt-5 space-y-2 border-t border-[#e5dacb] pt-4 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6f72]">
                          Location
                        </dt>
                        <dd className="mt-0.5 text-[#3f5255]">{event.location}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-[#5f6f72]">
                          Date & time
                        </dt>
                        <dd className="mt-0.5 text-[#3f5255]">
                          {formatEventDateTime(event.starts_at)}
                        </dd>
                      </div>
                    </dl>
                  </KinCard>
                </li>
              ))}
            </ul>

            <KinCard className="mt-10 max-w-3xl border-[#d8cbb8] bg-[#f3ebe0]">
              <h3 className="text-base font-semibold text-[#223436]">
                Need ideas? Try one of these event formats
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#4a5a5d]">
                These examples are here to spark useful gatherings. Keep your
                title and details clear, and post when you are ready.
              </p>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-[#3f5255]">
                {sampleEvents.map((event) => (
                  <li key={`idea-${event.title}`}>{event.title}</li>
                ))}
              </ul>
            </KinCard>
          </>
        )}
      </PageContainer>
    </PageMain>
  );
}
