"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/standards", label: "Standards" },
  { href: "/communities", label: "Communities" },
  { href: "/events", label: "Events" },
  { href: "/profile", label: "Profile" },
] as const;

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium text-[#3f5255] transition hover:bg-[#efe5d8] hover:text-[#223436]";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const shareCopyByPath: Record<string, { title: string; text: string }> = {
    "/town-square": {
      title: "KIN Town Square — Connect. Grow. Belong.",
      text: "Join me in Town Square on KIN for calm, trust-first community conversation.",
    },
    "/events": {
      title: "KIN Events — Connect. Grow. Belong.",
      text: "Join me on KIN Events to discover and host thoughtful community gatherings.",
    },
    "/trusted-services": {
      title: "KIN Trusted Services — Connect. Grow. Belong.",
      text: "Join me on KIN Trusted Services for practical, community-trusted recommendations.",
    },
    "/profile": {
      title: "KIN — Connect. Grow. Belong.",
      text: "Join me on KIN, a calm trust-first community platform built for real connection.",
    },
  };

  function getInviteContext() {
    const shareUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${pathname ?? ""}`
        : "https://kin-roan.vercel.app";
    const copy = shareCopyByPath[pathname ?? ""] ?? {
      title: "KIN — Connect. Grow. Belong.",
      text: "Join me on KIN, a calm trust-first community space for real connection.",
    };
    const inviteMessage = `${copy.text}\n\n${shareUrl}`;
    return { shareUrl, ...copy, inviteMessage };
  }

  function openSmsInvite() {
    if (typeof window === "undefined") return;
    const { inviteMessage } = getInviteContext();
    const encoded = encodeURIComponent(inviteMessage);
    window.location.href = `sms:?&body=${encoded}`;
    setShareMessage("Opening text message...");
    window.setTimeout(() => setShareMessage(null), 3000);
  }

  async function handleShareKin() {
    const { shareUrl, title: shareTitle, text: shareText } = getInviteContext();

    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        setShareMessage("Shared.");
      } else if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage("Invite link copied.");
      } else if (typeof window !== "undefined") {
        window.prompt("Copy this KIN invite link:", shareUrl);
        setShareMessage("Invite link ready to copy.");
      }
    } catch {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          setShareMessage("Invite link copied.");
          return;
        } catch {
          // fall through to final message
        }
      }
      setShareMessage("Couldn’t share right now. Try again.");
    } finally {
      window.setTimeout(() => setShareMessage(null), 3000);
    }
  }

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;
    try {
      const supabase = getSupabaseBrowserClient();
      void (async () => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!mounted) return;
          setIsSignedIn(!!user);
        } catch {
          if (mounted) setIsSignedIn(false);
        }
      })();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsSignedIn(!!session?.user);
      });
      unsubscribe = () => subscription.unsubscribe();
    } catch {
      if (mounted) setIsSignedIn(false);
    }

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  async function handleLogOut() {
    setSigningOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      setMenuOpen(false);
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <header className="relative sticky top-0 z-50 border-b border-[#dfd5c7]/90 bg-[#f7f3ec]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-[#223436]"
        >
          KIN
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 md:hidden">
            {isSignedIn !== true ? (
              <>
                <Link
                  href="/login"
                  className="rounded-lg border border-[#d8cbb8] bg-[#fffdf9] px-2.5 py-1.5 text-xs font-medium text-[#3f5255]"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-[#2f6f74] px-2.5 py-1.5 text-xs font-medium text-[#f7f3ec]"
                >
                  Sign up
                </Link>
              </>
            ) : null}
            {isSignedIn === true ? (
              <button
                type="button"
                className="rounded-lg border border-[#d8cbb8] bg-[#fffdf9] px-2.5 py-1.5 text-xs font-medium text-[#3f5255]"
                onClick={handleLogOut}
                disabled={signingOut}
              >
                {signingOut ? "Logging out..." : "Log out"}
              </button>
            ) : null}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg border border-[#d8cbb8] bg-[#fffdf9] p-2 text-[#3f5255] md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="sr-only">Menu</span>
            {menuOpen ? (
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        <nav
          className={`absolute left-0 right-0 top-full flex-col gap-1 border-b border-[#dfd5c7] bg-[#f7f3ec] px-6 py-4 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 ${
            menuOpen ? "flex" : "hidden md:flex"
          }`}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={linkClass}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            className={linkClass}
            onClick={handleShareKin}
          >
            Share KIN
          </button>
          <button
            type="button"
            className={`${linkClass} md:hidden`}
            onClick={openSmsInvite}
          >
            Text Invite
          </button>
          <Link
            href="/login"
            className={`${linkClass} ${isSignedIn === true ? "hidden" : "hidden md:inline-flex"}`}
            onClick={() => setMenuOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`${linkClass} ${isSignedIn === true ? "hidden" : "hidden md:ml-1 md:inline-flex md:bg-[#2f6f74] md:text-[#f7f3ec] md:hover:bg-[#285f63]"}`}
            onClick={() => setMenuOpen(false)}
          >
            Sign Up
          </Link>
          {isSignedIn === true ? (
            <button
              type="button"
              className={`${linkClass} hidden md:inline-flex`}
              onClick={handleLogOut}
              disabled={signingOut}
            >
              {signingOut ? "Logging out..." : "Log out"}
            </button>
          ) : null}
        </nav>
      </div>
      {shareMessage ? (
        <p className="px-6 pb-3 text-xs font-medium text-[#2f6f74]" role="status">
          {shareMessage}
        </p>
      ) : null}
    </header>
  );
}
