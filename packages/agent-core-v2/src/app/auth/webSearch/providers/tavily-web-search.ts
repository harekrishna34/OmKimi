/**
 * `auth` domain — `TavilyWebSearchProvider`, a `WebSearchProvider` backed by
 * the Tavily Search API (`https://api.tavily.com/search`).
 *
 * Sends `{ query, ...options }` with `Authorization: Bearer <apiKey>`, and
 * projects Tavily's `results[].{ title, url, content, published_date, site_name }`
 * onto the shared `WebSearchResult` shape (`content` → `snippet`, `published_date`
 * → `date`). Non-200 responses (401, rate-limit, upstream errors) surface as
 * coded `Error2` failures like the Moonshot provider.
 */

import type { WebSearchProvider, WebSearchResult } from '#/agent/tools/web-search/web-search';
import { Error2, ErrorCodes } from '#/errors';

export interface TavilySearchOptions {
  maxResults?: number;
  searchDepth?: 'basic' | 'advanced' | 'fast' | 'ultra-fast';
  topic?: 'general' | 'news' | 'finance';
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'd' | 'w' | 'm' | 'y';
  startDate?: string;
  endDate?: string;
  includeAnswer?: boolean | 'basic' | 'advanced';
  includeRawContent?: boolean | 'markdown' | 'text';
  includeImages?: boolean;
  includeImageDescriptions?: boolean;
  includeFavicon?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
  country?: string;
  autoParameters?: boolean;
  includeUsage?: boolean;
}

export interface TavilyWebSearchProviderOptions {
  apiKey?: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  customHeaders?: Record<string, string>;
  options?: TavilySearchOptions;
  fetchImpl?: typeof fetch;
}

interface TavilySearchResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
  published_date?: string;
  site_name?: string;
}

interface TavilySearchResponse {
  results?: TavilySearchResult[];
}

export class TavilyWebSearchProvider implements WebSearchProvider {
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly customHeaders: Record<string, string>;
  private readonly options: TavilySearchOptions;
  private readonly fetchImpl: typeof fetch;

  constructor(options: TavilyWebSearchProviderOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    this.defaultHeaders = options.defaultHeaders ?? {};
    this.customHeaders = options.customHeaders ?? {};
    this.options = options.options ?? {};
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async search(
    query: string,
    options?: {
      toolCallId?: string;
      signal?: AbortSignal;
    },
  ): Promise<WebSearchResult[]> {
    const body = this.buildBody(query);
    const bodyJson = JSON.stringify(body);

    const response = await this.fetchImpl(this.baseUrl, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        Authorization: `Bearer ${this.resolveApiKey()}`,
        'Content-Type': 'application/json',
        ...this.customHeaders,
      },
      body: bodyJson,
      signal: options?.signal,
    });

    if (response.status === 401) {
      const detail = await safeReadText(response);
      throw new Error2(
        ErrorCodes.WEB_FETCH_FAILED,
        `Tavily search request failed: HTTP 401 (auth/unauthorized). ${detail}`.trim(),
        { details: { status: response.status } },
      );
    }

    if (response.status !== 200) {
      const detail = await safeReadText(response);
      throw new Error2(
        ErrorCodes.WEB_FETCH_FAILED,
        `Tavily search request failed: HTTP ${String(response.status)}. ${detail}`.trim(),
        { details: { status: response.status } },
      );
    }

    const json = (await response.json()) as TavilySearchResponse;
    const raw = Array.isArray(json.results) ? json.results : [];

    return raw.map((r): WebSearchResult => {
      const out: WebSearchResult = {
        title: r.title ?? '',
        url: r.url ?? '',
        snippet: r.content ?? '',
      };
      if (typeof r.published_date === 'string' && r.published_date.length > 0) {
        out.date = r.published_date;
      }
      if (typeof r.site_name === 'string' && r.site_name.length > 0) {
        out.siteName = r.site_name;
      }
      return out;
    });
  }

  private buildBody(query: string): Record<string, unknown> {
    const body: Record<string, unknown> = { query };
    const o = this.options;
    if (o.maxResults !== undefined) body['max_results'] = o.maxResults;
    if (o.searchDepth !== undefined) body['search_depth'] = o.searchDepth;
    if (o.topic !== undefined) body['topic'] = o.topic;
    if (o.timeRange !== undefined) body['time_range'] = o.timeRange;
    if (o.startDate !== undefined) body['start_date'] = o.startDate;
    if (o.endDate !== undefined) body['end_date'] = o.endDate;
    if (o.includeAnswer !== undefined) body['include_answer'] = o.includeAnswer;
    if (o.includeRawContent !== undefined) body['include_raw_content'] = o.includeRawContent;
    if (o.includeImages !== undefined) body['include_images'] = o.includeImages;
    if (o.includeImageDescriptions !== undefined) {
      body['include_image_descriptions'] = o.includeImageDescriptions;
    }
    if (o.includeFavicon !== undefined) body['include_favicon'] = o.includeFavicon;
    if (o.includeDomains !== undefined) body['include_domains'] = o.includeDomains;
    if (o.excludeDomains !== undefined) body['exclude_domains'] = o.excludeDomains;
    if (o.country !== undefined) body['country'] = o.country;
    if (o.autoParameters !== undefined) body['auto_parameters'] = o.autoParameters;
    if (o.includeUsage !== undefined) body['include_usage'] = o.includeUsage;
    return body;
  }

  private resolveApiKey(): string {
    if (this.apiKey !== undefined && this.apiKey.length > 0) return this.apiKey;
    throw new Error2(
      ErrorCodes.AUTH_TOKEN_MISSING,
      'Tavily search service is not configured: missing API key.',
    );
  }
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
