/**
 * HeyCatch Blog API Client & Sanitizer
 * Fetches articles from https://api.heycatch.ai/v1/articles
 * Supports caching for 2-3 minutes, full pagination (offset += 50), and HTML sanitization.
 */

import sanitizeHtml from "sanitize-html";

export interface HeyCatchArticleListItem {
  id: string;
  slug: string;
  title: string;
  meta_description?: string;
  read_time: number; // in minutes
  language?: string;
  published: string; // ISO 8601 date (e.g. 2026-10-14)
  updated: string;
  published_at?: string;
  updated_at?: string;
  hero_image_url?: string;
  featured_image?: string;
}

export interface HeyCatchArticleDetail extends HeyCatchArticleListItem {
  content_html: string;
  jsonLd?: Record<string, any>;
  content_markdown?: string;
}

export interface HeyCatchListResponse {
  articles: HeyCatchArticleListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface TocItem {
  id: string;
  text: string;
}

export const HEYCATCH_API_BASE = "https://api.heycatch.ai/v1";
export const HEYCATCH_API_KEY = 
  (typeof process !== "undefined" && process.env?.HEYCATCH_API_KEY) || 
  "hck_lv_754e205cf75df8999688cd7f";

// Cache in memory for 120 seconds (2 minutes) to prevent 429 and meet guide step 5
let cachedArticleList: { articles: HeyCatchArticleListItem[]; total: number; timestamp: number } | null = null;
const articleCache = new Map<string, { article: HeyCatchArticleDetail; timestamp: number }>();
const CACHE_TTL_MS = 120 * 1000;

/**
 * Fetch ALL published articles from HeyCatch with pagination (offset += 50)
 */
export async function fetchAllHeyCatchArticles(apiKey: string = HEYCATCH_API_KEY): Promise<{ articles: HeyCatchArticleListItem[]; total: number }> {
  const now = Date.now();
  if (cachedArticleList && (now - cachedArticleList.timestamp < CACHE_TTL_MS)) {
    return { articles: cachedArticleList.articles, total: cachedArticleList.total };
  }

  const allArticles: HeyCatchArticleListItem[] = [];
  let offset = 0;
  const limit = 50;
  let total = 0;

  try {
    while (true) {
      const url = `${HEYCATCH_API_BASE}/articles?key=${encodeURIComponent(apiKey)}&limit=${limit}&offset=${offset}`;
      const res = await fetch(url, {
        headers: { "Accept": "application/json" }
      });

      if (!res.ok) {
        if (res.status === 404 || res.status === 403 || res.status === 401) {
          console.warn(`[HeyCatch] List API answered ${res.status}`);
          return cachedArticleList ? { articles: cachedArticleList.articles, total: cachedArticleList.total } : { articles: [], total: 0 };
        }
        break;
      }

      const data: HeyCatchListResponse = await res.json();
      const batch = data.articles || [];
      total = data.total || 0;
      allArticles.push(...batch);

      if (allArticles.length >= total || batch.length === 0) {
        break;
      }
      offset += limit;
    }

    cachedArticleList = {
      articles: allArticles,
      total,
      timestamp: now
    };

    return { articles: allArticles, total };
  } catch (err) {
    console.warn("[HeyCatch] Error fetching articles list:", err);
    return cachedArticleList ? { articles: cachedArticleList.articles, total: cachedArticleList.total } : { articles: [], total: 0 };
  }
}

/**
 * Fetch a single article by slug or id
 */
export async function fetchHeyCatchArticleBySlug(slug: string, apiKey: string = HEYCATCH_API_KEY): Promise<HeyCatchArticleDetail | null> {
  const now = Date.now();
  const cached = articleCache.get(slug);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.article;
  }

  try {
    const url = `${HEYCATCH_API_BASE}/articles/${encodeURIComponent(slug)}?key=${encodeURIComponent(apiKey)}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" }
    });

    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      console.warn(`[HeyCatch] Article ${slug} answered ${res.status}`);
      return cached ? cached.article : null;
    }

    const data = await res.json();
    const article: HeyCatchArticleDetail = data.article;
    if (!article) return null;

    articleCache.set(slug, { article, timestamp: now });
    return article;
  } catch (err) {
    console.warn(`[HeyCatch] Error fetching article ${slug}:`, err);
    return cached ? cached.article : null;
  }
}

/**
 * Sanitizes article HTML content adhering to HeyCatch Guide:
 * - Keeps headings, paragraphs, lists, tables, links, blockquotes, strong, em, code
 * - Keeps the id on h2 (table of contents links to it)
 * - Drops script, style, iframe, on* attributes and javascript: URLs
 */
export function sanitizeArticleHtml(rawHtml: string): string {
  if (!rawHtml) return "";
  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li",
      "b", "i", "strong", "em", "strike", "code", "pre", "hr", "br",
      "div", "table", "thead", "tbody", "tr", "th", "td", "blockquote",
      "span", "img"
    ],
    allowedAttributes: {
      "h2": ["id", "class"],
      "h3": ["id", "class"],
      "h4": ["id", "class"],
      "a": ["href", "name", "target", "rel", "id", "class"],
      "img": ["src", "alt", "title", "width", "height", "loading", "class"],
      "table": ["class"],
      "th": ["scope", "class"],
      "td": ["class"],
      "span": ["class"],
      "div": ["class", "id"],
      "li": ["class"],
      "ul": ["class"],
      "ol": ["class"],
      "blockquote": ["class"]
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard"
  });
}

/**
 * Extracts Table of Contents items from sanitised HTML
 * Rule from Guide:
 * "One link per <h2> in content_html that has an id, except id="faq", in order:
 *  the heading's text, linking to #<id>. The Key takeaways heading has no id, so it is never listed."
 */
export function extractTocFromHtml(sanitizedHtml: string): TocItem[] {
  const toc: TocItem[] = [];
  const h2Regex = /<h2\s+[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h2>/gi;
  let match;
  while ((match = h2Regex.exec(sanitizedHtml)) !== null) {
    const id = match[1];
    if (id === "faq") continue;
    // Strip inner HTML tags from the title text
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (id && text) {
      toc.push({ id, text });
    }
  }
  return toc;
}

/**
 * Splits content_html to place Table of Contents immediately following Key takeaways list
 * Rule from Guide:
 * "Put it under a 'Table of contents' heading, right after the Key takeaways list
 *  (the list that follows <h2>Key takeaways</h2>) and before the rest of content_html;
 *  with no takeaways, above content_html."
 */
export function injectTocIntoArticle(sanitizedHtml: string, toc: TocItem[]): { beforeTocHtml: string; afterTocHtml: string; hasTakeaways: boolean } {
  if (toc.length === 0) {
    return { beforeTocHtml: "", afterTocHtml: sanitizedHtml, hasTakeaways: false };
  }

  // Look for <h2>Key takeaways</h2> followed by its list
  const takeawaysMatch = sanitizedHtml.match(/(<h2>Key takeaways<\/h2>\s*<ul[\s\S]*?<\/ul>)/i);
  if (takeawaysMatch && takeawaysMatch.index !== undefined) {
    const splitIndex = takeawaysMatch.index + takeawaysMatch[0].length;
    const before = sanitizedHtml.substring(0, splitIndex);
    const after = sanitizedHtml.substring(splitIndex);
    return { beforeTocHtml: before, afterTocHtml: after, hasTakeaways: true };
  }

  return { beforeTocHtml: "", afterTocHtml: sanitizedHtml, hasTakeaways: false };
}
