"use client";

import { useState } from "react";

const fieldClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-400 focus:ring-2 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100";

export function CreateCommunityForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p
        className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 dark:border-green-900 dark:bg-green-950/40 dark:text-green-100"
        role="status"
      >
        Thanks — your community idea was received. Full creation tools are
        coming soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="community-name" className="text-sm font-medium">
          Community name
        </label>
        <input
          id="community-name"
          name="name"
          type="text"
          required
          className={fieldClass}
          placeholder="e.g. Westside Parents"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="community-desc" className="text-sm font-medium">
          Short description
        </label>
        <textarea
          id="community-desc"
          name="description"
          rows={3}
          required
          className={`${fieldClass} resize-y`}
          placeholder="What is this group for? Who should join?"
        />
      </div>
      <button
        type="submit"
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
      >
        Submit idea
      </button>
    </form>
  );
}
