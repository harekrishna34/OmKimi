/**
 * WebSearch result renderer — parses the tool's `Title:` / `Site:` /
 * `Date:` / `URL:` / `Snippet:` block output into a compact, readable
 * preview instead of dumping the raw text. Collapsed shows a short
 * title + host + one-line snippet per result; expanded shows every
 * result with a longer snippet. Unparseable output falls back to the
 * generic truncated renderer so errors and unexpected formats still
 * surface their real message.
 */

import { Text } from '@moonshot-ai/pi-tui';

import { currentTheme } from '#/tui/theme';

import { renderTruncated } from './truncated';
import type { ResultRenderer } from './types';

const COLLAPSED_RESULTS = 3;
const SNIPPET_COLLAPSED = 70;
const SNIPPET_EXPANDED = 140;
const TITLE_MAX = 60;

interface WebSearchResultView {
  readonly title: string;
  readonly url: string;
  readonly site: string | undefined;
  readonly date: string | undefined;
  readonly snippet: string;
}

const BLOCK_SEPARATOR_RE = /^---+$/m;

function hostFromUrl(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function parseBlock(block: string): WebSearchResultView | undefined {
  const fields: Record<string, string> = {};
  for (const line of block.split('\n')) {
    const match = /^(Title|Site|Date|URL|Snippet):\s*(.*)$/.exec(line);
    if (match !== null) {
      const [, key, value] = match;
      if (key !== undefined && value !== undefined) fields[key] = value.trim();
    }
  }
  const title = fields['Title'];
  const url = fields['URL'];
  if (title === undefined || url === undefined) return undefined;
  return {
    title,
    url,
    site: fields['Site'],
    date: fields['Date'],
    snippet: fields['Snippet'] ?? '',
  };
}

export function parseWebSearchOutput(output: string): WebSearchResultView[] {
  const results: WebSearchResultView[] = [];
  for (const block of output.split(BLOCK_SEPARATOR_RE)) {
    const parsed = parseBlock(block);
    if (parsed !== undefined) results.push(parsed);
  }
  return results;
}

export function webSearchResultCount(output: string): number {
  return parseWebSearchOutput(output).length;
}

function collapseWhitespace(text: string): string {
  return text.replaceAll(/\s+/g, ' ').trim();
}

function truncateOneLine(text: string, max: number): string {
  const clean = collapseWhitespace(text);
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(0, max - 1))}…`;
}

export const webSearchSummary: ResultRenderer = (toolCall, result, ctx) => {
  if (result.is_error) return renderTruncated(toolCall, result, ctx);

  const results = parseWebSearchOutput(result.output);
  if (results.length === 0) return renderTruncated(toolCall, result, ctx);

  const shown = ctx.expanded ? results : results.slice(0, COLLAPSED_RESULTS);
  const out: Text[] = [];
  for (const item of shown) {
    const host = hostFromUrl(item.url);
    const title = truncateOneLine(item.title, TITLE_MAX);
    out.push(new Text(`  ● ${currentTheme.fg('text', title)}  ${currentTheme.dim(host)}`, 0, 0));
    out.push(new Text(`    ${currentTheme.dim(item.url)}`, 0, 0));
    if (item.snippet.length > 0) {
      const limit = ctx.expanded ? SNIPPET_EXPANDED : SNIPPET_COLLAPSED;
      out.push(
        new Text(`    ${currentTheme.dimFg('textDim', truncateOneLine(item.snippet, limit))}`, 0, 0),
      );
    }
    out.push(new Text('', 0, 0));
  }
  if (!ctx.expanded && results.length > shown.length) {
    const remaining = results.length - shown.length;
    out.push(
      new Text(
        currentTheme.dim(`  ... (${String(remaining)} more result${remaining === 1 ? '' : 's'}, ctrl+o to expand)`),
        0,
        0,
      ),
    );
  }
  return out;
};
