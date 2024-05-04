import path from "path";
import sanitize from "sanitize-filename";

export const FILESYSTEM_PREFIX = "public/fs";
export const WEB_FILESYSTEM_PREFIX = "fs";
export const ARTICLE_PREFIX = "novica";

// turn to relative path and remove backslashes
export function normalize_slashes_to_relative(str: string) {
  const normalized = path.normalize(str);

  return normalized.replace(/^\/|^\\/, "").replace(/\\/g, "/");
}

export function normalize_slashes_to_absolute(str: string) {
  const normalized = path.normalize(str);

  return path.join("/", normalized).replace(/\\/g, "/")
}

export function remove_article_prefix(str: string) {
  const slashes = normalize_slashes_to_relative(str);
  const removed_prefix = slashes.split("/").slice(1).join("/");
  return removed_prefix;
}

export function sanitize_for_fs(str: string) {
  const decoded = decodeURIComponent(str);
  const slashes = normalize_slashes_to_relative(decoded);
  const sanitized = sanitize(slashes);
  return sanitized.replace(/\s/g, "-");
}
