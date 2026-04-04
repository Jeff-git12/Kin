"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/standards", label: "Standards" },
  { href: "/communities", label: "Communities" },
  { href: "/events", label: "Events" },
  { href: "/profile", label: "Profile" },
] as const;

const linkClass =
  "rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-stone-50";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-md dark:border-stone-800/80 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50"
        >
          KIN
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-stone-300 p-2 text-stone-700 md:hidden dark:border-stone-600 dark:text-stone-200"
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

        <nav
          className={`absolute left-0 right-0 top-full flex-col gap-1 border-b border-stone-200 bg-white px-6 py-4 dark:border-stone-800 dark:bg-stone-950 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:bg-transparent md:p-0 ${
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
          <Link
            href="/login"
            className={linkClass}
            onClick={() => setMenuOpen(false)}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className={`${linkClass} md:ml-1 md:bg-stone-900 md:text-white md:hover:bg-stone-800 md:dark:bg-stone-100 md:dark:text-stone-900 md:dark:hover:bg-stone-200`}
            onClick={() => setMenuOpen(false)}
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
