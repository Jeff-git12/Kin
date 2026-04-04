"use client";

import { AvatarUpload } from "@/app/components/avatar-upload";
import {
  PageMain,
  containerNarrowClass,
} from "@/app/components/kin-ui";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const fieldClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-400 focus:ring-2 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100";

const prose =
  "text-base leading-relaxed text-stone-700 dark:text-stone-300";
const proseHeading =
  "text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50";
const covenantList =
  "mt-4 list-disc space-y-2 pl-5 text-stone-700 dark:text-stone-300";

/** Turn PostgREST / Supabase errors into one readable line for the UI */
function describeError(err: unknown): string {
  if (!err || typeof err !== "object") {
    return "Something went wrong. Please try again.";
  }
  const o = err as {
    message?: string;
    details?: string;
    hint?: string;
  };
  const parts = [o.message, o.details, o.hint].filter(
    (s): s is string => typeof s === "string" && s.length > 0,
  );
  return parts.length > 0
    ? parts.join(" — ")
    : "Something went wrong. Please try again.";
}

export default function OnboardingPage() {
  const router = useRouter();
  /** `undefined` = still checking auth; `null` = not signed in (redirect to login) */
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [agreedToStandards, setAgreedToStandards] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadExistingProfile = useCallback(async (uid: string) => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, city, bio, avatar_url")
      .eq("id", uid)
      .maybeSingle();

    if (error) {
      console.warn("[onboarding] Could not load profile:", describeError(error));
      return;
    }
    if (!data) return;

    const row = data as {
      full_name?: string | null;
      city?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
    };
    if (row.full_name) setFullName(row.full_name);
    if (row.city) setCity(row.city);
    if (row.bio) setBio(row.bio);
    if (row.avatar_url !== undefined && row.avatar_url !== null) {
      setAvatarUrl(row.avatar_url);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let cancelled = false;

    async function syncUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        setUserId(session.user.id);
        await loadExistingProfile(session.user.id);
        return;
      }

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
      await loadExistingProfile(user.id);
    }

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setUserId(session.user.id);
        void loadExistingProfile(session.user.id);
      } else {
        setUserId(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadExistingProfile]);

  useEffect(() => {
    if (userId !== null) return;
    if (userId === undefined) return;
    router.replace("/login?next=/onboarding");
  }, [userId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    if (!agreedToStandards) {
      setMessage({
        type: "error",
        text: "Please agree to the KIN community standards to continue.",
      });
      return;
    }

    setMessage(null);
    setSaving(true);

    try {
      const supabase = getSupabaseBrowserClient();

      const row: {
        id: string;
        full_name: string;
        city: string;
        bio: string;
        avatar_url?: string | null;
      } = {
        id: userId,
        full_name: fullName.trim(),
        city: city.trim(),
        bio: bio.trim(),
      };

      if (avatarUrl) {
        row.avatar_url = avatarUrl;
      }

      const { error } = await supabase.from("profiles").upsert(row, {
        onConflict: "id",
      });

      if (error) {
        setMessage({
          type: "error",
          text: describeError(error),
        });
        return;
      }

      setMessage({
        type: "success",
        text: "Profile saved. Redirecting…",
      });
      setTimeout(() => {
        router.push("/profile");
        router.refresh();
      }, 500);
    } catch (err) {
      setMessage({
        type: "error",
        text: describeError(err),
      });
    } finally {
      setSaving(false);
    }
  }

  if (userId === undefined) {
    return (
      <PageMain className="flex flex-col items-center justify-center gap-2 py-16">
        <p className="text-stone-600 dark:text-stone-400">Checking your sign-in…</p>
        <p className="max-w-sm text-center text-sm text-stone-500 dark:text-stone-500">
          If you just signed up, finish email confirmation if your project
          requires it — then refresh this page.
        </p>
      </PageMain>
    );
  }

  if (userId === null) {
    return (
      <PageMain className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-stone-600 dark:text-stone-400">
          Redirecting to log in…
        </p>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <div className={containerNarrowClass}>
        <header className="border-b border-stone-200 pb-12 dark:border-stone-800">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 md:text-5xl">
            Welcome to KIN
          </h1>
          <p className={`${prose} mt-8`}>
            KIN exists to create a better environment for real connection.
          </p>
          <p className={`${prose} mt-6`}>
            Before you begin, we ask for one simple commitment:
          </p>

          <h2 className={`${proseHeading} mt-12`}>The KIN Standard</h2>
          <ul className={covenantList}>
            <li>I will treat others with respect</li>
            <li>I will engage in good faith</li>
            <li>
              I understand that disagreement is allowed, but disrespect is not
            </li>
            <li>I will not post harmful, explicit, or abusive content</li>
            <li>
              I understand that violating these standards may result in removal
            </li>
          </ul>

          <p className={`${prose} mt-8`}>This is not just a platform.</p>
          <p className={`${prose} mt-4`}>
            {"It's a shared environment."}
          </p>
          <p className={`${prose} mt-4`}>
            And how we show up here matters.
          </p>
        </header>

        <section className="pt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Your profile
          </h2>
          <p className={`${prose} mt-2 text-sm`}>
            Tell us a bit about you. This is saved to your account in Supabase.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-1">
              <label htmlFor="full_name" className="text-sm font-medium">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={fieldClass}
                disabled={saving}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="city" className="text-sm font-medium">
                City
              </label>
              <input
                id="city"
                name="city"
                type="text"
                autoComplete="address-level2"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={fieldClass}
                disabled={saving}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`${fieldClass} resize-y`}
                disabled={saving}
              />
            </div>

            <AvatarUpload
              userId={userId}
              value={avatarUrl}
              onChangeUrl={setAvatarUrl}
              disabled={saving}
            />

            <div className="flex items-start gap-3 pt-2">
              <input
                id="agree_standards"
                name="agree_standards"
                type="checkbox"
                required
                checked={agreedToStandards}
                onChange={(e) => setAgreedToStandards(e.target.checked)}
                disabled={saving}
                className="mt-1 size-4 shrink-0 rounded border-stone-300 text-stone-900 focus:ring-2 focus:ring-stone-400 dark:border-stone-600 dark:text-stone-100"
              />
              <label
                htmlFor="agree_standards"
                className="text-sm leading-snug text-stone-800 dark:text-stone-200"
              >
                I agree to the KIN community standards
              </label>
            </div>

            {message && (
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
            )}

            <button
              type="submit"
              disabled={saving || !agreedToStandards}
              className="w-full rounded-lg bg-stone-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {saving ? "Saving your profile…" : "Save and continue"}
            </button>
          </form>
        </section>
      </div>
    </PageMain>
  );
}
