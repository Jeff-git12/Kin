"use client";

import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import {
  STORAGE_BUCKETS,
  appendCacheBustQuery,
  avatarObjectPath,
  describeStorageUploadError,
  uploadPublicImage,
} from "@/app/lib/storage";
import { useEffect, useState } from "react";

const labelClass = "text-sm font-medium text-stone-900 dark:text-stone-100";

type Props = {
  userId: string;
  /** Current avatar URL from `profiles.avatar_url` */
  value: string | null;
  onChangeUrl: (url: string | null) => void;
  /**
   * When set (e.g. on `/profile`), after a successful Storage upload or remove,
   * this runs so `profiles.avatar_url` is saved immediately. Return `{ error }` on failure.
   * Omit on onboarding — parent saves on form submit.
   */
  persistAvatarUrl?: (publicUrl: string | null) => Promise<{ error?: string }>;
  disabled?: boolean;
};

/**
 * Profile photo: upload to `avatars` bucket, optionally persist to DB right away.
 */
export function AvatarUpload({
  userId,
  value,
  onChangeUrl,
  persistAvatarUrl,
  disabled,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successHint, setSuccessHint] = useState<string | null>(null);

  useEffect(() => {
    if (!successHint) return;
    const t = setTimeout(() => setSuccessHint(null), 3500);
    return () => clearTimeout(t);
  }, [successHint]);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || disabled || busy) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setError(
        "This image is too large. Please choose one under 3MB (smaller photos load faster for neighbors, too).",
      );
      return;
    }

    setError(null);
    setSuccessHint(null);
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const path = avatarObjectPath(userId);
      const baseUrl = await uploadPublicImage(
        supabase,
        STORAGE_BUCKETS.avatars,
        path,
        file,
      );
      const url = appendCacheBustQuery(baseUrl);

      if (persistAvatarUrl) {
        const result = await persistAvatarUrl(url);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccessHint("Profile photo updated");
      }

      onChangeUrl(url);
    } catch (err) {
      setError(describeStorageUploadError(err, STORAGE_BUCKETS.avatars));
    } finally {
      setBusy(false);
    }
  }

  async function onRemove() {
    if (disabled || busy) return;
    setError(null);
    setSuccessHint(null);

    if (persistAvatarUrl) {
      setBusy(true);
      try {
        const result = await persistAvatarUrl(null);
        if (result.error) {
          setError(result.error);
          return;
        }
        setSuccessHint("Profile photo removed");
        onChangeUrl(null);
      } finally {
        setBusy(false);
      }
      return;
    }

    onChangeUrl(null);
  }

  return (
    <div className="space-y-2">
      <p className={labelClass}>Profile photo (optional)</p>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-stone-200 bg-stone-100 text-lg font-semibold text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="size-full object-cover"
            />
          ) : (
            <span aria-hidden>?</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="inline-block">
            <span className="sr-only">Upload profile photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={disabled || busy}
              onChange={onPickFile}
            />
            <span className="inline-flex cursor-pointer rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800">
              {busy ? "Working…" : value ? "Replace photo" : "Add photo"}
            </span>
          </label>
          {value ? (
            <button
              type="button"
              className="text-left text-sm text-stone-600 underline dark:text-stone-400"
              disabled={disabled || busy}
              onClick={() => void onRemove()}
            >
              Remove photo
            </button>
          ) : null}
        </div>
      </div>
      {successHint ? (
        <p
          className="text-sm text-stone-600 dark:text-stone-400"
          role="status"
          aria-live="polite"
        >
          {successHint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Round avatar for headers and lists */
export function ProfileAvatarImage({
  url,
  name,
  size = 40,
}: {
  url: string | null;
  name: string;
  size?: number;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-stone-100 dark:ring-stone-800"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-stone-200 text-sm font-semibold text-stone-600 dark:bg-stone-700 dark:text-stone-200"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
