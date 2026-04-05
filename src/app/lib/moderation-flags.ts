import type { SupabaseClient } from "@supabase/supabase-js";

export type ModerationSourceType = "post" | "reply" | "service_listing" | "event";

type CreateModerationFlagArgs = {
  supabase: SupabaseClient;
  reporterUserId: string;
  sourceType: ModerationSourceType;
  sourceId: string;
  reason?: string;
  notes?: string;
};

export async function createModerationFlag({
  supabase,
  reporterUserId,
  sourceType,
  sourceId,
  reason = "inappropriate_content",
  notes,
}: CreateModerationFlagArgs): Promise<void> {
  const { error } = await supabase.from("moderation_flags").insert({
    reporter_user_id: reporterUserId,
    source_type: sourceType,
    source_id: sourceId,
    reason,
    notes: notes?.trim() || null,
  });
  if (error) throw error;
}
