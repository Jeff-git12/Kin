"use client";

import { FeedCard, KinCard } from "@/app/components/kin-ui";
import { PostComposer } from "@/app/components/post-composer";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PostRow = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  author_name: string | null;
  author_id: string;
  created_at: string;
};

type EnrichedPost = PostRow & {
  displayName: string;
  authorAvatarUrl: string | null;
  postedAtLabel: string;
};

function formatPostDate(iso: string): string {
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

const EMPTY_PROMPTS = [
  "Introduce yourself to the community",
  "What kind of space are you hoping to find here?",
  "What’s one thing you wish social platforms did better?",
] as const;

export function TownSquareFeed() {
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoadError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: rows, error } = await supabase
        .from("posts")
        .select(
          "id, title, body, image_url, author_name, author_id, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(40);

      if (error) throw error;

      const list = (rows as PostRow[]) ?? [];
      const authorIds = [
        ...new Set(list.map((p) => p.author_id).filter(Boolean)),
      ];

      const profileMap = new Map<
        string,
        { full_name: string | null; avatar_url: string | null }
      >();

      if (authorIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", authorIds);

        for (const p of profs ?? []) {
          const row = p as {
            id: string;
            full_name: string | null;
            avatar_url: string | null;
          };
          profileMap.set(row.id, {
            full_name: row.full_name,
            avatar_url: row.avatar_url,
          });
        }
      }

      const enriched: EnrichedPost[] = list.map((p) => {
        const prof = profileMap.get(p.author_id);
        const fromProfile = prof?.full_name?.trim();
        return {
          ...p,
          displayName: fromProfile || p.author_name?.trim() || "Neighbor",
          authorAvatarUrl: prof?.avatar_url ?? null,
          postedAtLabel: formatPostDate(p.created_at),
        };
      });

      setPosts(enriched);
    } catch (e) {
      setLoadError(
        e instanceof Error
          ? e.message
          : "We couldn’t load posts right now. Try again shortly.",
      );
      setPosts([]);
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
    loadPosts();
  }, [loadPosts]);

  return (
    <div className="space-y-12">
      {userId ? (
        <PostComposer userId={userId} onPosted={loadPosts} />
      ) : (
        <KinCard className="border-stone-200/90 bg-white/90 p-6 dark:border-stone-800 dark:bg-stone-900/50">
          <p className="text-sm font-medium text-stone-900 dark:text-stone-50">
            You’re welcome to look around
          </p>
          <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            To post in the Town Square, sign in with your KIN account. It only
            takes a minute — we’re glad you’re here.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link
              href="/login?next=/town-square"
              className="font-medium text-stone-900 underline decoration-stone-400 underline-offset-4 hover:decoration-stone-600 dark:text-stone-100 dark:decoration-stone-500 dark:hover:decoration-stone-300"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="font-medium text-stone-900 underline decoration-stone-400 underline-offset-4 hover:decoration-stone-600 dark:text-stone-100 dark:decoration-stone-500 dark:hover:decoration-stone-300"
            >
              Sign up
            </Link>
          </p>
        </KinCard>
      )}

      <section aria-labelledby="feed-heading">
        <h2
          id="feed-heading"
          className="text-xl font-semibold text-stone-900 dark:text-stone-50"
        >
          Recent posts
        </h2>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Newest first — read calmly, reply with care.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-stone-500 dark:text-stone-400">
            Loading posts…
          </p>
        ) : loadError ? (
          <p className="mt-8 text-sm text-red-600 dark:text-red-400" role="alert">
            {loadError}{" "}
            <span className="text-stone-600 dark:text-stone-400">
              (If you’re setting up Supabase, add the{" "}
              <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">
                posts
              </code>{" "}
              table and policies from{" "}
              <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">
                docs/kin-data-model.md
              </code>
              .)
            </span>
          </p>
        ) : posts.length === 0 ? (
          <KinCard className="mt-8 border-dashed border-stone-300 bg-stone-50/50 p-8 dark:border-stone-600 dark:bg-stone-900/30">
            <p className="text-base font-medium text-stone-900 dark:text-stone-50">
              Nothing has been posted here yet. Start the first conversation.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
              Not sure what to say? Here are a few gentle ways to begin:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-stone-700 dark:text-stone-300">
              {EMPTY_PROMPTS.map((prompt) => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ul>
            {userId ? (
              <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">
                Use the form above when you’re ready — your voice helps set the
                tone.
              </p>
            ) : (
              <p className="mt-6 text-sm text-stone-600 dark:text-stone-400">
                <Link href="/signup" className="font-medium underline">
                  Sign up
                </Link>{" "}
                or{" "}
                <Link href="/login?next=/town-square" className="font-medium underline">
                  log in
                </Link>{" "}
                to publish the first post.
              </p>
            )}
          </KinCard>
        ) : (
          <ul className="mt-8 list-none space-y-6 p-0">
            {posts.map((p) => (
              <li key={p.id}>
                <FeedCard
                  title={p.title}
                  body={p.body}
                  imageUrl={p.image_url}
                  meta={p.displayName}
                  authorAvatarUrl={p.authorAvatarUrl}
                  postedAtLabel={p.postedAtLabel}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
