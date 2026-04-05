"use client";

import { FeedCard, KinCard, LinkifiedText } from "@/app/components/kin-ui";
import { PostComposer } from "@/app/components/post-composer";
import { addMentionTokenPrefix, createMentionPings } from "@/app/lib/mentions";
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

type ReplyRow = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

type EnrichedReply = ReplyRow & {
  displayName: string;
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

function describeReplyError(err: unknown): string {
  const raw =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: string }).message ?? "")
      : err instanceof Error
        ? err.message
        : "Could not post reply. Please try again.";

  const lower = raw.toLowerCase();
  if (lower.includes("post_replies") || lower.includes("does not exist")) {
    return "Replies are not set up yet. Run docs/post-replies-setup.sql in Supabase.";
  }
  if (
    lower.includes("row-level security") ||
    lower.includes("policy") ||
    lower.includes("rls")
  ) {
    return "Could not post reply due to permissions. Confirm post_replies RLS/policies from docs/post-replies-setup.sql.";
  }
  return raw || "Could not post reply. Please try again.";
}

const EMPTY_PROMPTS = [
  "Introduce yourself to the community",
  "What kind of space are you hoping to find here?",
  "What’s one thing you wish social platforms did better?",
] as const;

export function TownSquareFeed() {
  const [userId, setUserId] = useState<string | null>(null);
  const [posts, setPosts] = useState<EnrichedPost[]>([]);
  const [repliesByPostId, setRepliesByPostId] = useState<
    Record<string, EnrichedReply[]>
  >({});
  const [replyDraftByPostId, setReplyDraftByPostId] = useState<
    Record<string, string>
  >({});
  const [replySavingByPostId, setReplySavingByPostId] = useState<
    Record<string, boolean>
  >({});
  const [replyMessageByPostId, setReplyMessageByPostId] = useState<
    Record<string, string | null>
  >({});
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
      const postIds = list.map((p) => p.id);
      const { data: replyRows, error: repliesError } =
        postIds.length > 0
          ? await supabase
              .from("post_replies")
              .select("id, post_id, user_id, body, created_at")
              .in("post_id", postIds)
              .order("created_at", { ascending: true })
          : { data: [], error: null };

      const repliesTableMissing =
        !!repliesError &&
        typeof repliesError === "object" &&
        "message" in repliesError &&
        String((repliesError as { message?: string }).message)
          .toLowerCase()
          .includes("post_replies");

      if (repliesError && !repliesTableMissing) throw repliesError;
      if (repliesTableMissing) {
        console.warn(
          "[town-square] post_replies table missing; loading posts without replies.",
        );
      }

      const replies = repliesTableMissing ? [] : ((replyRows as ReplyRow[]) ?? []);
      const authorIds = [
        ...new Set(
          [...list.map((p) => p.author_id), ...replies.map((r) => r.user_id)].filter(
            Boolean,
          ),
        ),
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

      const enrichedRepliesByPost: Record<string, EnrichedReply[]> = {};
      for (const reply of replies) {
        const profile = profileMap.get(reply.user_id);
        const displayName = profile?.full_name?.trim() || "Neighbor";
        const enrichedReply: EnrichedReply = {
          ...reply,
          displayName,
          postedAtLabel: formatPostDate(reply.created_at),
        };
        if (!enrichedRepliesByPost[reply.post_id]) {
          enrichedRepliesByPost[reply.post_id] = [];
        }
        enrichedRepliesByPost[reply.post_id].push(enrichedReply);
      }
      setRepliesByPostId(enrichedRepliesByPost);
    } catch (e) {
      setLoadError(
        e instanceof Error
          ? e.message
          : "We couldn’t load posts right now. Try again shortly.",
      );
      setPosts([]);
      setRepliesByPostId({});
    } finally {
      setLoading(false);
    }
  }, []);

  async function handleReplySubmit(postId: string) {
    if (!userId) return;
    const draft = (replyDraftByPostId[postId] ?? "").trim();
    if (!draft) {
      setReplyMessageByPostId((prev) => ({
        ...prev,
        [postId]: "Write a short reply before posting.",
      }));
      return;
    }

    setReplySavingByPostId((prev) => ({ ...prev, [postId]: true }));
    setReplyMessageByPostId((prev) => ({ ...prev, [postId]: null }));
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: inserted, error } = await supabase
        .from("post_replies")
        .insert({
          post_id: postId,
          user_id: userId,
          body: draft,
        })
        .select("id")
        .single();
      if (error || !inserted?.id) {
        throw error ?? new Error("Could not post reply. Please try again.");
      }

      await createMentionPings({
        supabase,
        text: draft,
        mentionedByUserId: userId,
        sourceType: "reply",
        sourcePostId: postId,
        sourceReplyId: inserted.id,
      });

      setReplyDraftByPostId((prev) => ({ ...prev, [postId]: "" }));
      setReplyMessageByPostId((prev) => ({
        ...prev,
        [postId]: "Reply posted.",
      }));
      await loadPosts();
    } catch (err) {
      setReplyMessageByPostId((prev) => ({
        ...prev,
        [postId]: describeReplyError(err),
      }));
    } finally {
      setReplySavingByPostId((prev) => ({ ...prev, [postId]: false }));
    }
  }

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
              and{" "}
              <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">
                post_replies
              </code>{" "}
              tables and policies from{" "}
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
                  linkifyBody
                />
                <div className="mt-2 flex justify-end">
                  <span className="mr-3 inline-flex items-center rounded-full border border-[#d8cbb8] bg-[#f3ebe0] px-2.5 py-1 text-xs font-medium text-[#4a5a5d]">
                    {repliesByPostId[p.id]?.length ?? 0} replies
                  </span>
                  <Link
                    href={`/town-square/${p.id}`}
                    className="text-sm font-medium text-[#2f6f74] underline underline-offset-4"
                  >
                    Open post
                  </Link>
                </div>
                <KinCard className="mt-3 border-[#e5dacb] bg-[#fffaf2] p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-semibold text-[#223436]">
                      Replies
                    </h3>
                    <p className="text-xs text-[#5f6f72]">
                      {repliesByPostId[p.id]?.length ?? 0}
                    </p>
                  </div>

                  {repliesByPostId[p.id]?.length ? (
                    <ul className="mt-3 space-y-2">
                      {repliesByPostId[p.id].map((reply) => (
                        <li key={reply.id} className="rounded-xl bg-white px-3 py-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-medium text-[#2f474a]">
                              {reply.displayName}
                              {reply.postedAtLabel ? (
                                <span className="ml-2 font-normal text-[#7a8c8f]">
                                  {reply.postedAtLabel}
                                </span>
                              ) : null}
                            </p>
                            {userId ? (
                              <button
                                type="button"
                                className="text-xs font-medium text-[#2f6f74] underline underline-offset-4"
                                onClick={() =>
                                  setReplyDraftByPostId((prev) => ({
                                    ...prev,
                                    [p.id]: addMentionTokenPrefix(
                                      prev[p.id] ?? "",
                                      reply.displayName,
                                    ),
                                  }))
                                }
                              >
                                Reply to {reply.displayName}
                              </button>
                            ) : null}
                          </div>
                          <LinkifiedText
                            text={reply.body}
                            className="mt-1 text-sm leading-relaxed text-[#3f5255]"
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-[#5f6f72]">
                      No replies yet. Be the first to ask a question or respond.
                    </p>
                  )}

                  {userId ? (
                    <form
                      className="mt-4 space-y-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        void handleReplySubmit(p.id);
                      }}
                    >
                      <textarea
                        value={replyDraftByPostId[p.id] ?? ""}
                        onChange={(e) =>
                          setReplyDraftByPostId((prev) => ({
                            ...prev,
                            [p.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-[#d8cbb8] bg-white px-3 py-2 text-sm text-[#223436] outline-none ring-[#2f6f74] focus:ring-2"
                        rows={2}
                        maxLength={1500}
                        placeholder="Write a reply or ask a question..."
                        disabled={replySavingByPostId[p.id]}
                      />
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-[#d8cbb8] bg-white px-3 py-2 text-xs font-medium text-[#2f474a] hover:bg-[#f7f3ec]"
                            onClick={() =>
                              setReplyDraftByPostId((prev) => ({
                                ...prev,
                                [p.id]: addMentionTokenPrefix(
                                  prev[p.id] ?? "",
                                  p.displayName,
                                ),
                              }))
                            }
                            disabled={replySavingByPostId[p.id]}
                          >
                            Reply to {p.displayName}
                          </button>
                          <button
                            type="submit"
                            disabled={replySavingByPostId[p.id]}
                            className="rounded-lg bg-[#2f6f74] px-3 py-2 text-sm font-medium text-[#f7f3ec] hover:bg-[#285f63] disabled:opacity-60"
                          >
                            {replySavingByPostId[p.id] ? "Posting..." : "Post reply"}
                          </button>
                        </div>
                        {replyMessageByPostId[p.id] ? (
                          <p className="text-xs text-[#5f6f72]">
                            {replyMessageByPostId[p.id]}
                          </p>
                        ) : null}
                      </div>
                    </form>
                  ) : (
                    <p className="mt-4 text-sm text-[#5f6f72]">
                      <Link
                        href="/login?next=/town-square"
                        className="font-medium text-[#2f6f74] underline underline-offset-4"
                      >
                        Log in
                      </Link>{" "}
                      to reply or ask a follow-up question.
                    </p>
                  )}
                </KinCard>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
