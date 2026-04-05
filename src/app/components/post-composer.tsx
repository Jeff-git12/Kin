"use client";

import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import {
  STORAGE_BUCKETS,
  describeStorageUploadError,
  postImageObjectPath,
  uploadPublicImage,
} from "@/app/lib/storage";
import { createMentionPings } from "@/app/lib/mentions";
import { useEffect, useState } from "react";

const fieldClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-400 focus:ring-2 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100";

function friendlyPostError(err: unknown): string {
  const raw =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : err instanceof Error
        ? err.message
        : String(err);

  const lower = raw.toLowerCase();
  if (
    lower.includes("bucket") ||
    lower.includes("storage") ||
    lower.includes("payload") ||
    lower.includes("413") ||
    lower.includes("too large")
  ) {
    return describeStorageUploadError(err, STORAGE_BUCKETS.postImages);
  }

  if (
    lower.includes("row-level security") ||
    lower.includes("rls") ||
    lower.includes("policy")
  ) {
    return "We couldn’t save your post. Check that you’re signed in and the posts table allows inserts.";
  }

  if (!raw || raw === "null") {
    return "Something went wrong. Please try again in a moment.";
  }

  return raw;
}

type Props = {
  userId: string;
  onPosted: () => void;
};

/**
 * Create a post with optional image; saves `image_url` and row in `posts`.
 */
export function PostComposer({ userId, onPosted }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!message || message.type !== "success") return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

      const authorName =
        (profile as { full_name?: string } | null)?.full_name?.trim() ||
        "Neighbor";

      let imageUrl: string | null = null;
      if (file) {
        if (!file.type.startsWith("image/")) {
          throw new Error("That file isn’t an image. Try JPG, PNG, or WebP.");
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(
            "That photo is a bit large. Please pick one under 5MB.",
          );
        }
        const path = postImageObjectPath(userId, file);
        imageUrl = await uploadPublicImage(
          supabase,
          STORAGE_BUCKETS.postImages,
          path,
          file,
        );
      }

      const trimmedTitle = title.trim();
      const trimmedBody = body.trim();
      const { data: inserted, error } = await supabase
        .from("posts")
        .insert({
          author_id: userId,
          author_name: authorName,
          title: trimmedTitle,
          body: trimmedBody,
          image_url: imageUrl,
        })
        .select("id")
        .single();

      if (error || !inserted?.id) throw error ?? new Error("Could not create post.");

      await createMentionPings({
        supabase,
        text: `${trimmedTitle}\n${trimmedBody}`,
        mentionedByUserId: userId,
        sourceType: "post",
        sourcePostId: inserted.id,
      });

      setTitle("");
      setBody("");
      setFile(null);
      setMessage({ type: "success", text: "Post published" });
      onPosted();
    } catch (err) {
      setMessage({
        type: "error",
        text: friendlyPostError(err),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/60"
    >
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
        Start a post
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
        Share a thought, ask a question, or start a conversation. Keep it kind
        and useful — this is your neighbors’ living room, not a loud feed.
      </p>

      <div className="mt-6 space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="post-title" className="text-sm font-medium">
            Headline
          </label>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            A few words so people know what your post is about.
          </p>
          <input
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
            required
            maxLength={200}
            placeholder="e.g. Looking for a walking buddy on Saturday mornings"
            disabled={saving}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="post-body" className="text-sm font-medium">
            Your message
          </label>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Add context, details, or an invitation to reply.
          </p>
          <textarea
            id="post-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={`${fieldClass} min-h-[120px] resize-y`}
            required
            maxLength={4000}
            placeholder="Write what you’d like the community to know…"
            disabled={saving}
          />
        </div>

        <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/80 px-4 py-4 dark:border-stone-700 dark:bg-stone-900/40">
          <label htmlFor="post-image" className="text-sm font-medium">
            Photo <span className="font-normal text-stone-500">(optional)</span>
          </label>
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
            Only if a picture helps — max 5MB. Most posts are fine without one.
          </p>
          <input
            id="post-image"
            type="file"
            accept="image/*"
            disabled={saving}
            className="mt-3 block w-full text-sm text-stone-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-800 dark:text-stone-400 dark:file:bg-stone-800 dark:file:text-stone-100"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
              <span className="truncate">Selected: {file.name}</span>
              <button
                type="button"
                className="font-medium text-stone-800 underline dark:text-stone-200"
                onClick={() => setFile(null)}
                disabled={saving}
              >
                Remove
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {message ? (
        <p
          role="alert"
          className={
            message.type === "error"
              ? "mt-4 text-sm text-red-600 dark:text-red-400"
              : "mt-4 text-sm text-green-800 dark:text-green-300"
          }
        >
          {message.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="mt-5 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
      >
        {saving ? "Publishing…" : "Publish post"}
      </button>
    </form>
  );
}
