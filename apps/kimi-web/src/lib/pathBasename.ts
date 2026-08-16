// apps/kimi-web/src/lib/pathBasename.ts

/** basename of an absolute path (last non-empty segment), defaulting to the path. */
export function basename(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1]! : path;
}

/** dirname of a path (everything before the last segment), '' when there is none. */
export function dirname(path: string): string {
  return /^(.*)[\\/][^\\/]+[\\/]?$/.exec(path)?.[1] ?? '';
}
