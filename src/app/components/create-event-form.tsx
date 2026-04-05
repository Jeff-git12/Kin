"use client";

import { getSupabaseBrowserClient } from "@/app/lib/supabase";
import { useState } from "react";

const fieldClass =
  "w-full rounded-xl border border-[#d8cbb8] bg-[#fffdf9] px-3 py-2.5 text-sm text-[#223436] outline-none ring-[#2f6f74] focus:ring-2";

function describeInsertError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const message = String((err as { message: string }).message);
    const lower = message.toLowerCase();
    if (lower.includes("row-level security") || lower.includes("policy")) {
      return "We couldn’t create this event. Please make sure you’re signed in.";
    }
    return message;
  }
  return err instanceof Error ? err.message : "Couldn’t create event. Try again.";
}

type Props = {
  userId: string;
  onCreated: () => void;
};

export function CreateEventForm({ userId, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startsAtLocal, setStartsAtLocal] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      const startsAtIso = new Date(startsAtLocal).toISOString();
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("events").insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        starts_at: startsAtIso,
      });

      if (error) throw error;

      setTitle("");
      setDescription("");
      setLocation("");
      setStartsAtLocal("");
      setMessage({
        type: "success",
        text: "Event created. It is now visible to the community.",
      });
      onCreated();
    } catch (err) {
      setMessage({
        type: "error",
        text: describeInsertError(err),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="add-event-heading">
      <h2 id="add-event-heading" className="text-lg font-semibold text-[#223436]">
        Host an event
      </h2>
      <p className="text-sm leading-relaxed text-[#4a5a5d]">
        Share a gathering people can actually show up to. Keep details clear so
        neighbors know what to expect.
      </p>

      <div className="space-y-1">
        <label htmlFor="event-title" className="text-sm font-medium text-[#2f474a]">
          Title
        </label>
        <input
          id="event-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
          required
          maxLength={200}
          placeholder="e.g. Saturday morning walking group"
          disabled={saving}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="event-description" className="text-sm font-medium text-[#2f474a]">
          Description
        </label>
        <textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${fieldClass} min-h-[100px] resize-y`}
          required
          maxLength={2000}
          placeholder="Who it is for, what to bring, and anything helpful to know."
          disabled={saving}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="event-location" className="text-sm font-medium text-[#2f474a]">
          Location
        </label>
        <input
          id="event-location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={fieldClass}
          required
          maxLength={120}
          placeholder="e.g. Riverfront Cafe, Main Street"
          disabled={saving}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="event-starts-at" className="text-sm font-medium text-[#2f474a]">
          Date and time
        </label>
        <input
          id="event-starts-at"
          type="datetime-local"
          value={startsAtLocal}
          onChange={(e) => setStartsAtLocal(e.target.value)}
          className={fieldClass}
          required
          disabled={saving}
        />
      </div>

      {message ? (
        <p
          role="alert"
          className={message.type === "error" ? "text-sm text-red-700" : "text-sm text-[#2f6f74]"}
        >
          {message.text}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#2f6f74] px-4 py-2.5 text-sm font-medium text-[#f7f3ec] transition hover:bg-[#285f63] disabled:opacity-60"
      >
        {saving ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
