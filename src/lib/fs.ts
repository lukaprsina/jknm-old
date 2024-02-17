import path from "path"
import sanitize from "sanitize-filename"

export const FILESYSTEM_PREFIX = "public/fs"
export const WEB_FILESYSTEM_PREFIX = "fs"
export const ARTICLE_PREFIX = "novicka"

// turn to relative path and remove backslashes
export function fix_slashes(str: string) {
    return path.normalize(str).replace(/^\/|^\\/, '').replace(/\\/g, '/')
}

export function remove_article_prefix(str: string) {
    const slashes = fix_slashes(str)
    const removed_prefix = slashes.split('/').slice(1).join('/')
    return removed_prefix
}

export function sanitize_for_fs(str: string) {
    const slashes = fix_slashes(str)
    const sanitized = sanitize(slashes)
    return sanitized.replace(/\s/g, "-")
}
