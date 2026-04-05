"use client";

import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import {
  SERVICE_CATEGORY_OPTIONS,
  type ServiceCategory,
} from "@/app/lib/service-categories";
import { checkContentSafety } from "@/app/lib/content-safety";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const fieldClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-stone-400 focus:ring-2 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100";

function friendlyInsertError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const msg = String((err as { message: string }).message);
    const lower = msg.toLowerCase();
    if (lower.includes("row-level security") || lower.includes("policy")) {
      return "We couldn’t save your listing. Make sure you’re signed in.";
    }
    return msg;
  }
  return err instanceof Error ? err.message : "Something went wrong. Try again.";
}

type Props = {
  userId: string;
  onCreated: () => void;
};

export function CreateServiceListingForm({ userId, onCreated }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("contractor");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [contactName, setContactName] = useState("");
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
      const trimmedTitle = title.trim();
      const trimmedDescription = description.trim();
      const trimmedLocation = location.trim();
      const trimmedContactName = contactName.trim();
      const safety = checkContentSafety(
        `${trimmedTitle}\n${trimmedDescription}\n${trimmedLocation}\n${trimmedContactName}`,
      );
      if (!safety.ok) {
        throw new Error(safety.message);
      }

      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("service_listings").insert({
        user_id: userId,
        category,
        title: trimmedTitle,
        description: trimmedDescription,
        location: trimmedLocation,
        contact_name: trimmedContactName,
      });

      if (error) throw error;

      setTitle("");
      setCategory("contractor");
      setDescription("");
      setLocation("");
      setContactName("");
      setMessage({
        type: "success",
        text: "Thanks — your recommendation is now in the directory.",
      });
      onCreated();
      router.refresh();
    } catch (err) {
      setMessage({ type: "error", text: friendlyInsertError(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      aria-labelledby="add-listing-heading"
    >
      <h2
        id="add-listing-heading"
        className="text-lg font-semibold text-stone-900 dark:text-stone-50"
      >
        Recommend someone trustworthy
      </h2>
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Share a person or small business neighbors can rely on. Be accurate —
        your name is tied to this listing.
      </p>

      <div className="space-y-1">
        <label htmlFor="svc-title" className="text-sm font-medium">
          Title
        </label>
        <input
          id="svc-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
          required
          maxLength={200}
          placeholder="e.g. Oak Street Handyman — licensed electrician"
          disabled={saving}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="svc-category" className="text-sm font-medium">
          Category
        </label>
        <select
          id="svc-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ServiceCategory)}
          className={fieldClass}
          disabled={saving}
        >
          {SERVICE_CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="svc-desc" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="svc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${fieldClass} min-h-[100px] resize-y`}
          required
          maxLength={2000}
          placeholder="What do they do well? Any helpful context for neighbors?"
          disabled={saving}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="svc-location" className="text-sm font-medium">
          Location
        </label>
        <input
          id="svc-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={fieldClass}
          required
          maxLength={120}
          placeholder="e.g. Westside, within 15 min drive"
          disabled={saving}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="svc-contact" className="text-sm font-medium">
          Contact name
        </label>
        <input
          id="svc-contact"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className={fieldClass}
          required
          maxLength={120}
          placeholder="How neighbors should ask for them (name or business name)"
          disabled={saving}
        />
      </div>

      {message ? (
        <p
          role="alert"
          className={
            message.type === "error"
              ? "text-sm text-red-600 dark:text-red-400"
              : "text-sm text-green-800 dark:text-green-300"
          }
        >
          {message.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
      >
        {saving ? "Adding…" : "Add listing"}
      </button>
    </form>
  );
}
