import sanitize_filename from 'sanitize-filename'
import path from 'path'
export const FILESYSTEM_PREFIX = "public/fs"
export const WEB_FILESYSTEM_PREFIX = "fs"
export const ARTICLE_PREFIX = "novicka"

// remove leading slash and replace backslashes with forward slashes
export const sanitize_slashes = (str: string) => path.normalize(str).replace(/^\/|^\\/, '').replace(/\\/g, '/')

export function sanitize_for_fs(text: string) {
    const slashes = sanitize_slashes(text)
    const sanitized = sanitize_filename(slashes)

    return sanitized
}

export function remove_article_name(pathname: string) {
    const split = pathname.split('/')
    if (split.length > 1) {
        return split.slice(2).join('/')
    } else {
        return pathname
    }
}