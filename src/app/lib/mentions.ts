import type { SupabaseClient } from "@supabase/supabase-js";

const bracketMentionPattern = /@\[(.+?)\]/g;
const plainMentionPattern = /(^|\s)@([A-Za-z0-9_]{2,40})/g;

export function mentionToken(displayName: string): string {
  return `@[${displayName.trim()}]`;
}

export function addMentionTokenPrefix(draft: string, displayName: string): string {
  const token = mentionToken(displayName);
  if (token === "@[]") return draft;
  if (draft.includes(token)) return draft;
  return `${token} ${draft}`.trimEnd();
}

function extractMentionNames(text: string): string[] {
  const names = new Set<string>();
  for (const m of text.matchAll(bracketMentionPattern)) {
    const name = (m[1] ?? "").trim();
    if (name) names.add(name);
  }
  for (const m of text.matchAll(plainMentionPattern)) {
    const handle = (m[2] ?? "").trim();
    if (handle) names.add(handle);
  }
  return [...names];
}

async function resolveMentionUserIds(
  supabase: SupabaseClient,
  names: string[],
): Promise<string[]> {
  const ids = new Set<string>();
  for (const name of names) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .ilike("full_name", name)
      .limit(8);

    const match = (data ?? []).find((row) => {
      const r = row as { full_name?: string | null };
      return (r.full_name ?? "").toLowerCase() === name.toLowerCase();
    }) as { id?: string } | undefined;

    if (match?.id) ids.add(match.id);
  }
  return [...ids];
}

type PingArgs = {
  supabase: SupabaseClient;
  text: string;
  mentionedByUserId: string;
  sourceType: "post" | "reply";
  sourcePostId: string;
  sourceReplyId?: string;
};

export async function createMentionPings({
  supabase,
  text,
  mentionedByUserId,
  sourceType,
  sourcePostId,
  sourceReplyId,
}: PingArgs): Promise<void> {
  const names = extractMentionNames(text);
  if (names.length === 0) return;

  const mentionedUserIds = await resolveMentionUserIds(supabase, names);
  const rows = mentionedUserIds
    .filter((id) => id !== mentionedByUserId)
    .map((mentionedUserId) => ({
      mentioned_user_id: mentionedUserId,
      mentioned_by_user_id: mentionedByUserId,
      source_type: sourceType,
      source_post_id: sourcePostId,
      source_reply_id: sourceReplyId ?? null,
      mention_text: text,
    }));

  if (rows.length === 0) return;
  const { error } = await supabase.from("mention_pings").insert(rows);
  if (error) {
    // Mention pings should not block post/reply publishing.
    console.warn("[mentions] Could not save mention pings:", error.message);
  }
}
