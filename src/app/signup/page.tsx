"use client";

import { KinCard, PageMain } from "@/app/components/kin-ui";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-400 focus:ring-2 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    let error: Error | { message: string } | null = null;
    try {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase.auth.signUp({
        email,
        password,
      });
      error = result.error;
    } catch (err) {
      error =
        err instanceof Error ? err : { message: "Something went wrong." };
    }

    setLoading(false);

    if (error) {
      setMessage({
        type: "error",
        text: "message" in error ? error.message : String(error),
      });
      return;
    }

    setMessage({
      type: "success",
      text: "Account created. Redirecting…",
    });
    setTimeout(() => {
      router.push("/onboarding");
    }, 600);
  }

  return (
    <PageMain className="flex flex-col items-center justify-center py-12 md:py-16">
      <div className="w-full max-w-md px-6">
        <KinCard>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Sign up
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Join KIN — connection before attention.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={fieldClass}
              />
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
              disabled={loading}
              className="w-full rounded-lg bg-stone-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {loading ? "Signing up…" : "Sign up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-600 dark:text-stone-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-stone-900 underline dark:text-stone-100"
            >
              Log in
            </Link>
          </p>
        </KinCard>
      </div>
    </PageMain>
  );
}
