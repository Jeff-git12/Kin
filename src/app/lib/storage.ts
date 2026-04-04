import type { SupabaseClient } from "@supabase/supabase-js";

/** User-facing hint when Storage returns bucket missing / 404 */
export function describeStorageUploadError(err: unknown, bucketId: string): string {
  const raw =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: string }).message)
      : err instanceof Error
        ? err.message
        : String(err);

  const lower = raw.toLowerCase();

  if (
    lower.includes("bucket not found") ||
    lower.includes("not found") ||
    raw.includes("404")
  ) {
    return `Storage bucket "${bucketId}" is missing. Create it in Supabase Storage.`;
  }

  if (
    lower.includes("payload too large") ||
    lower.includes("size") ||
    lower.includes("too large")
  ) {
    return "Image is too large. Please upload an image under 3MB.";
  }

  return raw || "Upload failed.";
}

/**
 * Create these buckets in Supabase Dashboard → Storage (public buckets work well for MVP).
 * See docs/kin-data-model.md for RLS and SQL.
 */
export const STORAGE_BUCKETS = {
  avatars: "avatars",
  postImages: "post-images",
} as const;

function extensionFromFile(file: File): string {
  const name = file.name;
  const dot = name.lastIndexOf(".");
  if (dot >= 0 && dot < name.length - 1) {
    return name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

/**
 * Upload a file to a public bucket and return its public URL.
 */
export async function uploadPublicImage(
  supabase: SupabaseClient,
  bucket: string,
  objectPath: string,
  file: File,
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(objectPath, file, {
    cacheControl: "3600",
    upsert: true,
    contentType: file.type || "image/jpeg",
  });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

/**
 * Same Storage object path is reused for avatars, so the public URL string does not change.
 * Append a fresh query param so the browser loads the new image instead of a cached one.
 */
export function appendCacheBustQuery(
  publicUrl: string,
  timestamp = Date.now(),
): string {
  const sep = publicUrl.includes("?") ? "&" : "?";
  return `${publicUrl}${sep}t=${timestamp}`;
}

/** One avatar per user; path is stable so re-uploads replace the file. */
export function avatarObjectPath(userId: string): string {
  return `${userId}/avatar`;
}

/** Unique object path per post image. */
export function postImageObjectPath(userId: string, file: File): string {
  const ext = extensionFromFile(file);
  return `${userId}/${crypto.randomUUID()}.${ext}`;
}
