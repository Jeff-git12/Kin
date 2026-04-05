"use client";

import { AvatarUpload } from "@/app/components/avatar-upload";
import {
  Button,
  Card,
  PageMain,
  PageContainer,
} from "@/app/components/kin-ui";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const fieldClass =
  "w-full rounded-xl border border-[#d8cbb8] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#223436] outline-none ring-[#2f6f74] focus:ring-2";

const prose = "text-base leading-relaxed text-[#4a5a5d]";
const proseHeading = "text-xl font-semibold tracking-tight text-[#223436]";
const covenantList =
  "mt-4 list-disc space-y-2 pl-5 text-[#4a5a5d]";

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
        <p className="text-[#4a5a5d]">Checking your sign-in…</p>
        <p className="max-w-sm text-center text-sm text-[#5f6f72]">
          If you just signed up, finish email confirmation if your project
          requires it — then refresh this page.
        </p>
      </PageMain>
    );
  }

  if (userId === null) {
    return (
      <PageMain className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-[#4a5a5d]">
          Redirecting to log in…
        </p>
      </PageMain>
    );
  }

  return (
    <PageMain>
      <PageContainer width="narrow" className="space-y-8">
        <header className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#5f6f72]">
            Welcome
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[#223436] md:text-5xl">
            Welcome to KIN
          </h1>
          <p className={`${prose}`}>
            KIN is a calmer, safer place to connect and build community.
          </p>
          <p className={`${prose}`}>
            Before you get started, please review the mission and standards that
            shape this space.
          </p>
        </header>

        <Card className="space-y-4 bg-[#f3ebe0]">
          <h2 className={proseHeading}>Why KIN exists</h2>
          <p className={prose}>
            We built KIN for people who want useful conversation without rage
            cycles, shaming, or performative posting.
          </p>
        </Card>

        <Card className="space-y-4">
          <h2 className={proseHeading}>KIN standards summary</h2>
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
        </Card>

        <section className="space-y-3 pt-1">
          <h2 className="text-2xl font-semibold tracking-tight text-[#223436]">
            Your place in KIN
          </h2>
          <p className={`${prose} text-sm`}>
            Tell us a bit about you. This is saved to your account in Supabase.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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
                className="mt-1 size-4 shrink-0 rounded border-[#cdbfa9] text-[#2f6f74] focus:ring-2 focus:ring-[#2f6f74]"
              />
              <label
                htmlFor="agree_standards"
                className="text-sm leading-snug text-[#2f474a]"
              >
                I agree to the KIN community standards
              </label>
            </div>

            {message && (
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
            )}

            <Button
              type="submit"
              disabled={saving || !agreedToStandards}
              className="w-full"
            >
              {saving ? "Saving your profile…" : "Save and continue"}
            </Button>
          </form>
        </section>
      </PageContainer>
    </PageMain>
  );
}
