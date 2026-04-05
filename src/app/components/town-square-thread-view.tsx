"use client";

import {
  FeedCard,
  KinCard,
  LinkifiedText,
  PageContainer,
  PageMain,
} from "@/app/components/kin-ui";
import { checkContentSafety } from "@/app/lib/content-safety";
import { addMentionTokenPrefix, createMentionPings } from "@/app/lib/mentions";
import { createModerationFlag } from "@/app/lib/moderation-flags";
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

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function describeReportError(err: unknown): string {
  const raw =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: string }).message ?? "")
      : err instanceof Error
        ? err.message
        : "Could not send report. Please try again.";
  const lower = raw.toLowerCase();
  if (lower.includes("moderation_flags") || lower.includes("does not exist")) {
    return "Reporting is not set up yet. Run docs/moderation-flags-setup.sql in Supabase.";
  }
  if (
    lower.includes("row-level security") ||
    lower.includes("policy") ||
    lower.includes("rls")
  ) {
    return "Could not send report due to permissions. Confirm moderation_flags policies from docs/moderation-flags-setup.sql.";
  }
  return raw || "Could not send report. Please try again.";
}

export function TownSquareThreadView({ postId }: { postId: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [post, setPost] = useState<PostRow | null>(null);
  const [displayName, setDisplayName] = useState("Neighbor");
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string | null>(null);
  const [replies, setReplies] = useState<EnrichedReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replySaving, setReplySaving] = useState(false);
  const [replyMessage, setReplyMessage] = useState<string | null>(null);
  const [reportMessageByKey, setReportMessageByKey] = useState<
    Record<string, string | null>
  >({});
  const [reportingByKey, setReportingByKey] = useState<Record<string, boolean>>(
    {},
  );

  const loadThread = useCallback(async () => {
    setLoadError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: postRow, error: postError } = await supabase
        .from("posts")
        .select("id, title, body, image_url, author_name, author_id, created_at")
        .eq("id", postId)
        .maybeSingle();
      if (postError) throw postError;
      if (!postRow) {
        setPost(null);
        setReplies([]);
        return;
      }

      const p = postRow as PostRow;
      setPost(p);

      const { data: replyRows, error: repliesError } = await supabase
        .from("post_replies")
        .select("id, post_id, user_id, body, created_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      const repliesTableMissing =
        !!repliesError &&
        typeof repliesError === "object" &&
        "message" in repliesError &&
        String((repliesError as { message?: string }).message)
          .toLowerCase()
          .includes("post_replies");
      if (repliesError && !repliesTableMissing) throw repliesError;

      const replyList = repliesTableMissing ? [] : ((replyRows as ReplyRow[]) ?? []);
      const profileIds = [
        ...new Set([p.author_id, ...replyList.map((r) => r.user_id)].filter(Boolean)),
      ];
      const { data: profileRows } =
        profileIds.length > 0
          ? await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .in("id", profileIds)
          : { data: [] };

      const profileMap = new Map<
        string,
        { full_name: string | null; avatar_url: string | null }
      >();
      for (const row of profileRows ?? []) {
        const r = row as { id: string; full_name: string | null; avatar_url: string | null };
        profileMap.set(r.id, { full_name: r.full_name, avatar_url: r.avatar_url });
      }

      const postProfile = profileMap.get(p.author_id);
      setDisplayName(postProfile?.full_name?.trim() || p.author_name?.trim() || "Neighbor");
      setAuthorAvatarUrl(postProfile?.avatar_url ?? null);

      setReplies(
        replyList.map((r) => {
          const prof = profileMap.get(r.user_id);
          return {
            ...r,
            displayName: prof?.full_name?.trim() || "Neighbor",
            postedAtLabel: formatDate(r.created_at),
          };
        }),
      );
    } catch (e) {
      setLoadError(
        e instanceof Error ? e.message : "Could not load this post right now.",
      );
      setPost(null);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

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
    loadThread();
  }, [loadThread]);

  async function handleReplySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !post) return;
    const body = replyDraft.trim();
    if (!body) {
      setReplyMessage("Write a short reply before posting.");
      return;
    }
    setReplySaving(true);
    setReplyMessage(null);
    try {
      const safety = checkContentSafety(body);
      if (!safety.ok) {
        throw new Error(safety.message);
      }
      const supabase = getSupabaseBrowserClient();
      const { data: inserted, error } = await supabase
        .from("post_replies")
        .insert({
          post_id: post.id,
          user_id: userId,
          body,
        })
        .select("id")
        .single();
      if (error || !inserted?.id) {
        throw error ?? new Error("Could not post reply. Please try again.");
      }

      await createMentionPings({
        supabase,
        text: body,
        mentionedByUserId: userId,
        sourceType: "reply",
        sourcePostId: post.id,
        sourceReplyId: inserted.id,
      });
      setReplyDraft("");
      setReplyMessage("Reply posted.");
      await loadThread();
    } catch (err) {
      setReplyMessage(describeReplyError(err));
    } finally {
      setReplySaving(false);
    }
  }

  async function handleReport({
    key,
    sourceType,
    sourceId,
  }: {
    key: string;
    sourceType: "post" | "reply";
    sourceId: string;
  }) {
    if (!userId) return;
    setReportingByKey((prev) => ({ ...prev, [key]: true }));
    setReportMessageByKey((prev) => ({ ...prev, [key]: null }));
    try {
      const supabase = getSupabaseBrowserClient();
      await createModerationFlag({
        supabase,
        reporterUserId: userId,
        sourceType,
        sourceId,
      });
      setReportMessageByKey((prev) => ({ ...prev, [key]: "Report sent." }));
    } catch (err) {
      setReportMessageByKey((prev) => ({
        ...prev,
        [key]: describeReportError(err),
      }));
    } finally {
      setReportingByKey((prev) => ({ ...prev, [key]: false }));
    }
  }

  return (
    <PageMain>
      <PageContainer width="narrow">
        <p className="mb-4">
          <Link
            href="/town-square"
            className="text-sm font-medium text-[#2f6f74] underline underline-offset-4"
          >
            Back to Town Square
          </Link>
        </p>

        {loading ? (
          <p className="text-sm text-[#5f6f72]">Loading post…</p>
        ) : loadError ? (
          <p className="text-sm text-red-700" role="alert">
            {loadError}
          </p>
        ) : !post ? (
          <KinCard>
            <p className="text-sm text-[#4a5a5d]">
              This post was not found or may have been removed.
            </p>
          </KinCard>
        ) : (
          <div className="space-y-4">
            <FeedCard
              title={post.title}
              body={post.body}
              imageUrl={post.image_url}
              meta={displayName}
              authorAvatarUrl={authorAvatarUrl}
              postedAtLabel={formatDate(post.created_at)}
              linkifyBody
            />
            {userId ? (
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="text-xs font-medium text-[#6b4d2f] underline underline-offset-4"
                  onClick={() =>
                    void handleReport({
                      key: `post:${post.id}`,
                      sourceType: "post",
                      sourceId: post.id,
                    })
                  }
                  disabled={reportingByKey[`post:${post.id}`]}
                >
                  {reportingByKey[`post:${post.id}`] ? "Reporting..." : "Report post"}
                </button>
                {reportMessageByKey[`post:${post.id}`] ? (
                  <p className="text-xs text-[#5f6f72]">
                    {reportMessageByKey[`post:${post.id}`]}
                  </p>
                ) : null}
              </div>
            ) : null}

            <KinCard className="border-[#e5dacb] bg-[#fffaf2] p-4">
              <h2 className="text-sm font-semibold text-[#223436]">
                Replies ({replies.length})
              </h2>
              {replies.length ? (
                <ul className="mt-3 space-y-2">
                  {replies.map((reply) => (
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
                              setReplyDraft((prev) =>
                                addMentionTokenPrefix(prev, reply.displayName),
                              )
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
                      {userId ? (
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            className="text-xs font-medium text-[#6b4d2f] underline underline-offset-4"
                            onClick={() =>
                              void handleReport({
                                key: `reply:${reply.id}`,
                                sourceType: "reply",
                                sourceId: reply.id,
                              })
                            }
                            disabled={reportingByKey[`reply:${reply.id}`]}
                          >
                            {reportingByKey[`reply:${reply.id}`]
                              ? "Reporting..."
                              : "Report"}
                          </button>
                          {reportMessageByKey[`reply:${reply.id}`] ? (
                            <p className="text-xs text-[#5f6f72]">
                              {reportMessageByKey[`reply:${reply.id}`]}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-[#5f6f72]">
                  No replies yet. Start the conversation.
                </p>
              )}

              {userId ? (
                <form className="mt-4 space-y-2" onSubmit={handleReplySubmit}>
                  <textarea
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    className="w-full rounded-xl border border-[#d8cbb8] bg-white px-3 py-2 text-sm text-[#223436] outline-none ring-[#2f6f74] focus:ring-2"
                    rows={2}
                    maxLength={1500}
                    placeholder="Write a reply or ask a question..."
                    disabled={replySaving}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-[#d8cbb8] bg-white px-3 py-2 text-xs font-medium text-[#2f474a] hover:bg-[#f7f3ec]"
                        onClick={() =>
                          setReplyDraft((prev) =>
                            addMentionTokenPrefix(prev, displayName),
                          )
                        }
                        disabled={replySaving}
                      >
                        Reply to {displayName}
                      </button>
                      <button
                        type="submit"
                        disabled={replySaving}
                        className="rounded-lg bg-[#2f6f74] px-3 py-2 text-sm font-medium text-[#f7f3ec] hover:bg-[#285f63] disabled:opacity-60"
                      >
                        {replySaving ? "Posting..." : "Post reply"}
                      </button>
                    </div>
                    {replyMessage ? (
                      <p className="text-xs text-[#5f6f72]">{replyMessage}</p>
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
          </div>
        )}
      </PageContainer>
    </PageMain>
  );
}
