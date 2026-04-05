"use client";

import { AvatarUpload, ProfileAvatarImage } from "@/app/components/avatar-upload";
import {
  Button,
  Card,
  PageMain,
  PageContainer,
  bodyTextClass,
} from "@/app/components/kin-ui";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const fieldClass =
  "w-full rounded-xl border border-[#d8cbb8] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#223436] outline-none ring-[#2f6f74] focus:ring-2";

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
  const [mentionPings, setMentionPings] = useState<
    {
      id: string;
      mention_text: string;
      source_post_id: string;
      mentioned_by_name: string;
      created_at: string;
    }[]
  >([]);
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

  const loadMentionPings = useCallback(async (uid: string) => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("mention_pings")
      .select(
        "id, mention_text, source_post_id, created_at, mentioned_by_user_id",
      )
      .eq("mentioned_user_id", uid)
      .order("created_at", { ascending: false })
      .limit(12);

    if (error || !data) {
      setMentionPings([]);
      return;
    }

    const pings = data as {
      id: string;
      mention_text: string;
      source_post_id: string;
      created_at: string;
      mentioned_by_user_id: string;
    }[];
    const senderIds = [...new Set(pings.map((p) => p.mentioned_by_user_id))];
    const { data: senderRows } =
      senderIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", senderIds)
        : { data: [] };

    const senderMap = new Map<string, string>();
    for (const row of senderRows ?? []) {
      const r = row as { id: string; full_name: string | null };
      senderMap.set(r.id, r.full_name?.trim() || "Neighbor");
    }

    setMentionPings(
      pings.map((ping) => ({
        id: ping.id,
        mention_text: ping.mention_text,
        source_post_id: ping.source_post_id,
        mentioned_by_name: senderMap.get(ping.mentioned_by_user_id) || "Neighbor",
        created_at: ping.created_at,
      })),
    );
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
        await loadMentionPings(user.id);
      } catch {
        if (!cancelled) setUserId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMentionPings, loadProfile]);

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
      await loadMentionPings(userId);
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
        <p className="text-[#4a5a5d]">Loading…</p>
      </PageMain>
    );
  }

  if (userId === null) {
    return (
      <PageMain className="flex flex-col items-center justify-center px-6 py-16">
        <p className="text-center text-[#4a5a5d]">
          Sign in to view your profile.
        </p>
        <Link
          href="/signup"
          className="mt-4 text-sm font-medium text-[#2f6f74] underline"
        >
          Sign up
        </Link>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <PageContainer width="narrow" className="space-y-8">
        <div className="flex items-start gap-4">
          <ProfileAvatarImage
            url={avatarUrl}
            name={fullName || "Member"}
            size={64}
          />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#223436]">
              Your place in KIN
            </h1>
            <p className="mt-1 text-sm text-[#4a5a5d]">
              Save your name, city, and bio once first — then your photo can
              update automatically. Use Save profile anytime to change your
              details.
            </p>
          </div>
        </div>

        <Card>
          <AvatarUpload
            userId={userId}
            value={avatarUrl}
            onChangeUrl={setAvatarUrl}
            persistAvatarUrl={persistAvatarUrl}
            disabled={saving}
          />
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-semibold text-[#223436]">
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
                  ? "text-sm text-red-700"
                  : "text-sm text-[#2f6f74]"
              }
            >
              {message.text}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </form>
        <Card className="space-y-3 border-[#d8cbb8] bg-[#f3ebe0]">
          <h2 className="text-lg font-semibold text-[#223436]">Mention pings</h2>
          {mentionPings.length === 0 ? (
            <p className="text-sm text-[#5f6f72]">
              No mentions yet. When someone tags you in Town Square, it will
              appear here.
            </p>
          ) : (
            <ul className="space-y-2">
              {mentionPings.map((ping) => (
                <li key={ping.id} className="rounded-xl bg-white px-3 py-2">
                  <p className="text-xs font-medium text-[#2f474a]">
                    {ping.mentioned_by_name} mentioned you
                  </p>
                  <p className="mt-1 text-sm text-[#3f5255]">
                    {ping.mention_text.slice(0, 140)}
                    {ping.mention_text.length > 140 ? "…" : ""}
                  </p>
                  <Link
                    href={`/town-square/${ping.source_post_id}`}
                    className="mt-1 inline-block text-xs font-medium text-[#2f6f74] underline underline-offset-4"
                  >
                    Open post
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <p className={`${bodyTextClass} text-sm`}>
          Your profile helps neighbors understand who they are connecting with.
        </p>
      </PageContainer>
    </PageMain>
  );
}
