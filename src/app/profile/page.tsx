"use client";

import { AvatarUpload, ProfileAvatarImage } from "@/app/components/avatar-upload";
import {
  PageMain,
  containerNarrowClass,
} from "@/app/components/kin-ui";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const fieldClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-400 focus:ring-2 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100";

const AVATAR_NEED_PROFILE_FIRST =
  "Please save your profile details first, then add a photo.";

function describeDbError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const o = err as { message?: string; details?: string; hint?: string };
    const parts = [o.message, o.details, o.hint].filter(
      (s): s is string => typeof s === "string" && s.length > 0,
    );
    if (parts.length > 0) return parts.join(" — ");
  }
  return err instanceof Error ? err.message : "Could not save.";
}

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async (uid: string) => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, city, bio, avatar_url")
      .eq("id", uid)
      .maybeSingle();

    if (error || !data) return;

    const row = data as {
      full_name: string;
      city: string;
      bio: string;
      avatar_url: string | null;
    };
    setFullName(row.full_name ?? "");
    setCity(row.city ?? "");
    setBio(row.bio ?? "");
    setAvatarUrl(row.avatar_url ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (error || !user) {
          setUserId(null);
          return;
        }
        setUserId(user.id);
        await loadProfile(user.id);
      } catch {
        if (!cancelled) setUserId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadProfile]);

  /**
   * Avatar auto-save: only UPDATE an existing row (never insert via upsert).
   * If no row exists yet, Save profile must run first to create it.
   */
  const persistAvatarUrl = useCallback(
    async (url: string | null) => {
      if (!userId) return { error: "Not signed in." };

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", userId)
        .select("id");

      if (error) return { error: describeDbError(error) };
      if (!data || data.length === 0) {
        return { error: AVATAR_NEED_PROFILE_FIRST };
      }

      router.refresh();
      return {};
    },
    [userId, router],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setMessage(null);
    setSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();
      // Upsert keeps `avatar_url` in sync with state and creates a row if needed (e.g. skipped onboarding).
      const { error } = await supabase.from("profiles").upsert(
        {
          id: userId,
          full_name: fullName.trim(),
          city: city.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl,
        },
        { onConflict: "id" },
      );

      if (error) throw error;
      setMessage({ type: "success", text: "Profile saved." });
      router.refresh();
    } catch (err) {
      setMessage({
        type: "error",
        text: describeDbError(err),
      });
    } finally {
      setSaving(false);
    }
  }

  if (userId === undefined) {
    return (
      <PageMain className="flex flex-col items-center justify-center py-16">
        <p className="text-stone-600 dark:text-stone-400">Loading…</p>
      </PageMain>
    );
  }

  if (userId === null) {
    return (
      <PageMain className="flex flex-col items-center justify-center px-6 py-16">
        <p className="text-center text-stone-600 dark:text-stone-400">
          Sign in to view your profile.
        </p>
        <Link
          href="/signup"
          className="mt-4 text-sm font-medium text-stone-900 underline dark:text-stone-100"
        >
          Sign up
        </Link>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <div className={containerNarrowClass}>
        <div className="flex items-start gap-4">
          <ProfileAvatarImage
            url={avatarUrl}
            name={fullName || "Member"}
            size={64}
          />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              Your profile
            </h1>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Save your name, city, and bio once first — then your photo can
              update automatically. Use Save profile anytime to change your
              details.
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/40">
          <AvatarUpload
            userId={userId}
            value={avatarUrl}
            onChangeUrl={setAvatarUrl}
            persistAvatarUrl={persistAvatarUrl}
            disabled={saving}
          />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
            About you
          </h2>

          <div className="space-y-1">
            <label htmlFor="profile-name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="profile-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={fieldClass}
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="profile-city" className="text-sm font-medium">
              City
            </label>
            <input
              id="profile-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={fieldClass}
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="profile-bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`${fieldClass} min-h-[120px] resize-y`}
              required
              disabled={saving}
            />
          </div>

          {message ? (
            <p
              role="alert"
              className={
                message.type === "error"
                  ? "text-sm text-red-600 dark:text-red-400"
                  : "text-sm text-green-700 dark:text-green-400"
              }
            >
              {message.text}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </PageMain>
  );
}
