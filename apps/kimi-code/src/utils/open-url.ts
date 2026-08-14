import { execFile } from 'node:child_process';

export function openUrl(url: string): void {
  const command: [string, string[]] =
    process.platform === 'darwin'
      ? ['open', [url]]
      : process.platform === 'win32'
        ? ['cmd', ['/c', 'start', '', url]]
        : ['xdg-open', [url]];
  // Best-effort: swallow ENOENT so headless environments (no xdg-open) don't
  // emit unhandled errors when opening URLs.
  execFile(command[0], command[1], (err) => {
    if (err && (err as NodeJS.ErrnoException).code !== 'ENOENT') {
      // swallow silently — openUrl is fire-and-forget best-effort
    }
  });
}
