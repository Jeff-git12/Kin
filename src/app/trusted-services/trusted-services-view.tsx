"use client";

import { CreateServiceListingForm } from "@/app/components/create-service-listing-form";
import { PageMemoryPanel } from "@/app/components/page-memory-badge";
import {
  PageMain,
  bodyTextClass,
  containerClass,
  KinCard,
  KinPageTitle,
  KinSectionTitle,
} from "@/app/components/kin-ui";
import {
  type CategoryFilter,
  getServiceCategoryLabel,
  normalizeServiceCategory,
  SERVICE_CATEGORY_OPTIONS,
} from "@/app/lib/service-categories";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const FILTER_BUTTONS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "All" },
  ...SERVICE_CATEGORY_OPTIONS.map((category) => ({
    key: category.value,
    label: category.browseLabel,
  })),
];

type ListingRow = {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  contact_name: string;
  created_at: string;
};

function formatListedDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const filterBtnBase =
  "rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400";
const filterBtnIdle =
  "border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-200 dark:hover:bg-stone-800";
const filterBtnActive =
  "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900";

export function TrustedServicesView() {
  const [userId, setUserId] = useState<string | null>(null);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const loadListings = useCallback(async () => {
    setLoadError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("service_listings")
        .select(
          "id, title, category, description, location, contact_name, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setListings((data as ListingRow[]) ?? []);
    } catch (e) {
      setLoadError(
        e instanceof Error
          ? e.message
          : "Couldn’t load listings. Try again in a moment.",
      );
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const visibleListings = useMemo(() => {
    if (categoryFilter === "all") return listings;
    return listings.filter(
      (l) => normalizeServiceCategory(l.category) === categoryFilter,
    );
  }, [listings, categoryFilter]);

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
    loadListings();
  }, [loadListings]);

  return (
    <PageMain>
      <div className={containerClass}>
        <KinPageTitle>Trusted Services</KinPageTitle>
        <PageMemoryPanel
          kind="trusted-services"
          title="Trusted Services"
          subtitle="A trusted directory for practical recommendations from people in your community."
        />
        <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-stone-800 dark:text-stone-200">
          Find trusted recommendations from the community, or share someone you
          trust.
        </p>
        <p className={`${bodyTextClass} mt-5 max-w-2xl text-lg`}>
          Neighbor-sourced picks for home help, family support, local food, pet
          care, and what&apos;s new around town - browse by category or add your
          own.
        </p>
        <p className={`${bodyTextClass} mt-3 max-w-2xl`}>
          KIN doesn’t verify every listing; we keep the format simple so you can
          follow up directly and decide what fits your family.
        </p>

        {userId ? (
          <KinCard className="mt-12 max-w-xl">
            <CreateServiceListingForm
              userId={userId}
              onCreated={loadListings}
            />
          </KinCard>
        ) : (
          <KinCard className="mt-12 max-w-xl border-dashed border-stone-300 bg-stone-50/60 dark:border-stone-600 dark:bg-stone-900/40">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
              Want to recommend someone?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Sign in to add a listing. Everyone can still browse what’s here.
            </p>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link
                href="/login?next=/trusted-services"
                className="font-medium text-stone-900 underline decoration-stone-400 underline-offset-4 dark:text-stone-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="font-medium text-stone-900 underline decoration-stone-400 underline-offset-4 dark:text-stone-100"
              >
                Sign up
              </Link>
            </p>
          </KinCard>
        )}

        <KinSectionTitle className="mt-14">Community recommendations</KinSectionTitle>
        <p className={`${bodyTextClass} mt-3 max-w-2xl`}>
          Newest first. Tap a category to narrow the list — nothing reloads from
          the server.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-stone-500 dark:text-stone-400">
            Loading listings…
          </p>
        ) : loadError ? (
          <p className="mt-8 text-sm text-red-600 dark:text-red-400" role="alert">
            {loadError}{" "}
            <span className="text-stone-600 dark:text-stone-400">
              (Run{" "}
              <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">
                docs/service-listings-setup.sql
              </code>{" "}
              in Supabase if you haven’t yet.)
            </span>
          </p>
        ) : listings.length === 0 ? (
          <KinCard className="mt-8 max-w-2xl border-dashed border-stone-300 bg-stone-50/50 dark:border-stone-600 dark:bg-stone-900/30">
            <p className="text-base font-medium text-stone-900 dark:text-stone-50">
              No trusted services have been shared yet.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Be the first to recommend someone useful to the community.
            </p>
            {!userId ? (
              <p className="mt-4 text-sm text-stone-600 dark:text-stone-400">
                <Link href="/signup" className="font-medium underline">
                  Sign up
                </Link>{" "}
                or{" "}
                <Link
                  href="/login?next=/trusted-services"
                  className="font-medium underline"
                >
                  log in
                </Link>{" "}
                to add a listing.
              </p>
            ) : null}
          </KinCard>
        ) : (
          <>
            <div
              className="mt-8 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
              role="toolbar"
              aria-label="Filter by category"
            >
              {FILTER_BUTTONS.map(({ key, label }) => {
                const selected = categoryFilter === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategoryFilter(key)}
                    className={`${filterBtnBase} ${selected ? filterBtnActive : filterBtnIdle}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {visibleListings.length === 0 ? (
              <KinCard className="mt-8 max-w-2xl border-dashed border-stone-300 bg-stone-50/40 py-8 dark:border-stone-600 dark:bg-stone-900/25">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
                  No listings in this category yet.
                </p>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  Try another filter, or be the first to add one — neighbors will
                  thank you.
                </p>
                <button
                  type="button"
                  onClick={() => setCategoryFilter("all")}
                  className="mt-4 text-sm font-medium text-stone-900 underline decoration-stone-400 underline-offset-4 dark:text-stone-100"
                >
                  Show all categories
                </button>
              </KinCard>
            ) : (
              <ul className="mt-8 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                {visibleListings.map((item) => {
                  const catLabel = getServiceCategoryLabel(item.category);
                  const listed = formatListedDate(item.created_at);
                  return (
                    <li key={item.id}>
                      <KinCard className="flex h-full flex-col p-6">
                        <span className="inline-flex w-fit rounded-md bg-stone-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                          {catLabel}
                        </span>
                        <h2 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-stone-900 dark:text-stone-50">
                          {item.title}
                        </h2>
                        <p
                          className={`${bodyTextClass} mt-3 flex-1 text-sm leading-relaxed`}
                        >
                          {item.description}
                        </p>
                        <dl className="mt-6 space-y-3 border-t border-stone-100 pt-5 text-sm dark:border-stone-800">
                          <div>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                              Location
                            </dt>
                            <dd className="mt-0.5 text-stone-700 dark:text-stone-300">
                              {item.location}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                              Contact
                            </dt>
                            <dd className="mt-0.5 text-stone-700 dark:text-stone-300">
                              {item.contact_name}
                            </dd>
                          </div>
                          {listed ? (
                            <div>
                              <dt className="sr-only">Listed</dt>
                              <dd className="text-xs text-stone-500 dark:text-stone-500">
                                Added {listed}
                              </dd>
                            </div>
                          ) : null}
                        </dl>
                      </KinCard>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </PageMain>
  );
}
