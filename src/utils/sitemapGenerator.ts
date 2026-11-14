/**
 * XML Sitemap Generator for GigLizard.
 * Generates standards-compliant XML (sitemaps.org schema 0.9)
 * containing ONLY our 23 canonical high-value core pages and tour playbooks:
 * - /
 * - /venues, /bands, /tour
 * - /tools/stage-plot, /tools/poster-designer
 * - /touring-guide
 * - /articles + 10 /articles/:slug playbooks
 * - /about, /pricing, /compare, /privacy, /contact
 */

import { TOUR_ARTICLES } from "../data/tourArticles";

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: string;
}

// In-memory cache for dynamic sitemap with 30-minute TTL
let cachedSitemapXml: string | null = null;
let lastSitemapGeneratedAt = 0;
const SITEMAP_CACHE_TTL_MS = 30 * 60 * 1000;

export function getCoreSitemapEntries(): SitemapEntry[] {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const entries: SitemapEntry[] = [];

  // 1. Root & Directory Core Hubs
  entries.push({
    url: "https://www.giglizard.us/",
    lastmod: today,
    changefreq: "daily",
    priority: "1.0"
  });

  entries.push({
    url: "https://www.giglizard.us/venues",
    lastmod: today,
    changefreq: "daily",
    priority: "0.95"
  });

  entries.push({
    url: "https://www.giglizard.us/bands",
    lastmod: today,
    changefreq: "daily",
    priority: "0.95"
  });

  // 2. Production & Touring Tools (Canonical Tool URLs Only)
  entries.push({
    url: "https://www.giglizard.us/tour",
    lastmod: today,
    changefreq: "weekly",
    priority: "0.90"
  });

  entries.push({
    url: "https://www.giglizard.us/tools/stage-plot",
    lastmod: today,
    changefreq: "weekly",
    priority: "0.90"
  });

  entries.push({
    url: "https://www.giglizard.us/tools/poster-designer",
    lastmod: today,
    changefreq: "weekly",
    priority: "0.90"
  });

  // 3. Touring Guide & Editorial Playbooks
  entries.push({
    url: "https://www.giglizard.us/touring-guide",
    lastmod: today,
    changefreq: "weekly",
    priority: "0.85"
  });

  entries.push({
    url: "https://www.giglizard.us/articles",
    lastmod: today,
    changefreq: "weekly",
    priority: "0.90"
  });

  TOUR_ARTICLES.slice(0, 10).forEach(article => {
    entries.push({
      url: `https://www.giglizard.us/articles/${article.slug}`,
      lastmod: article.updatedDate || today,
      changefreq: "monthly",
      priority: "0.85"
    });
  });

  // 4. Core Information, Pricing & Legal Pages
  entries.push({
    url: "https://www.giglizard.us/about",
    lastmod: today,
    changefreq: "monthly",
    priority: "0.80"
  });

  entries.push({
    url: "https://www.giglizard.us/pricing",
    lastmod: today,
    changefreq: "weekly",
    priority: "0.90"
  });

  entries.push({
    url: "https://www.giglizard.us/compare",
    lastmod: today,
    changefreq: "weekly",
    priority: "0.85"
  });

  entries.push({
    url: "https://www.giglizard.us/privacy",
    lastmod: today,
    changefreq: "monthly",
    priority: "0.70"
  });

  entries.push({
    url: "https://www.giglizard.us/contact",
    lastmod: today,
    changefreq: "monthly",
    priority: "0.75"
  });

  return entries;
}

export function getSitemapEntries(): SitemapEntry[] {
  return getCoreSitemapEntries();
}

/**
 * Normalizes a URL for canonical and sitemap standards:
 * - Upgrades any apex (giglizard.us), http, or relative path to strictly https://www.giglizard.us
 * - Removes non-root trailing slash to prevent unnecessary 301 redirects
 */
export function normalizeSitemapUrl(url: string): string {
  if (!url) return "https://www.giglizard.us/";
  let normalized = url.trim();

  // Replace relative paths or any domain with https://www.giglizard.us
  if (normalized.startsWith("/")) {
    normalized = `https://www.giglizard.us${normalized}`;
  } else {
    normalized = normalized.replace(/^https?:\/\/(www\.)?giglizard\.us/i, "https://www.giglizard.us");
    if (!normalized.startsWith("https://www.giglizard.us")) {
      normalized = normalized.replace(/^https?:\/\/[^/]+/i, "https://www.giglizard.us");
    }
  }

  // Remove trailing slash unless it's just the root domain https://www.giglizard.us/
  if (normalized.length > "https://www.giglizard.us/".length && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Builds standard XML sitemap from entries array
 */
export function buildSitemapXmlFromEntries(entries: SitemapEntry[]): string {
  // Deduplicate and normalize entries by URL
  const seenUrls = new Set<string>();
  const uniqueEntries: SitemapEntry[] = [];

  for (const entry of entries) {
    const cleanUrl = normalizeSitemapUrl(entry.url);
    if (!seenUrls.has(cleanUrl)) {
      seenUrls.add(cleanUrl);
      uniqueEntries.push({
        ...entry,
        url: cleanUrl
      });
    }
  }

  const xmlNodes = uniqueEntries
    .map(
      (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlNodes}
</urlset>`;
}

export function generateSitemapXml(): string {
  return buildSitemapXmlFromEntries(getCoreSitemapEntries());
}

/**
 * Consolidated XML Sitemap Generator serving ONLY our 23 high-value canonical URLs.
 * Keeps parameter signature compatible with server.ts while excluding thin programmatic permutations.
 */
export async function generateDynamicSupabaseSitemap(_supabaseClient?: any): Promise<string> {
  const now = Date.now();
  if (cachedSitemapXml && now - lastSitemapGeneratedAt < SITEMAP_CACHE_TTL_MS) {
    return cachedSitemapXml;
  }

  const generatedXml = buildSitemapXmlFromEntries(getCoreSitemapEntries());
  cachedSitemapXml = generatedXml;
  lastSitemapGeneratedAt = now;

  return generatedXml;
}
