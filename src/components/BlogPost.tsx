import React, { useState, useEffect } from "react";
import { 
  HeyCatchArticleDetail, 
  fetchHeyCatchArticleBySlug, 
  sanitizeArticleHtml, 
  extractTocFromHtml, 
  injectTocIntoArticle,
  HEYCATCH_API_KEY 
} from "../utils/heycatchBlog";
import { Calendar, Clock, ArrowLeft, RefreshCw, List, ChevronRight } from "lucide-react";

interface BlogPostProps {
  slug: string;
  onNavigateBlogIndex: () => void;
  onNavigateHome: () => void;
}

export default function BlogPost({ slug, onNavigateBlogIndex, onNavigateHome }: BlogPostProps) {
  const [article, setArticle] = useState<HeyCatchArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsNotFound(false);

    fetchHeyCatchArticleBySlug(slug, HEYCATCH_API_KEY)
      .then((art) => {
        if (!isMounted) return;
        if (!art) {
          setIsNotFound(true);
        } else {
          setArticle(art);

          // Dynamically update document title and meta description
          if (art.title) {
            document.title = `${art.title} | GigLizard`;
          }
          if (art.meta_description) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute("content", art.meta_description);
            }
          }
          // Set canonical
          let canonical = document.querySelector('link[rel="canonical"]');
          if (!canonical) {
            canonical = document.createElement("link");
            canonical.setAttribute("rel", "canonical");
            document.head.appendChild(canonical);
          }
          canonical.setAttribute("href", `https://www.giglizard.us/blog/${art.slug}`);

          // Set JSON-LD if provided
          if (art.jsonLd && Object.keys(art.jsonLd).length > 0) {
            const scriptId = "heycatch-article-jsonld";
            let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
            if (!scriptTag) {
              scriptTag = document.createElement("script");
              scriptTag.id = scriptId;
              scriptTag.type = "application/ld+json";
              document.head.appendChild(scriptTag);
            }
            const structuredData = { ...art.jsonLd };
            if (!structuredData.url) {
              structuredData.url = `https://www.giglizard.us/blog/${art.slug}`;
              structuredData.mainEntityOfPage = `https://www.giglizard.us/blog/${art.slug}`;
            }
            scriptTag.textContent = JSON.stringify(structuredData).replace(/</g, "\\u003c");
          }
        }
        setIsLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("[BlogPost] Fetch error:", err);
        setIsNotFound(true);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      const scriptTag = document.getElementById("heycatch-article-jsonld");
      if (scriptTag) scriptTag.remove();
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center space-y-3 animate-fade-in">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Loading article...</p>
      </div>
    );
  }

  if (isNotFound || !article) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <span className="text-2xl font-black">404</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Article Not Found</h1>
        <p className="text-sm text-slate-600">
          The touring guide or dispatch you're looking for doesn't exist or may have been updated.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onNavigateBlogIndex}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Blog</span>
          </button>
        </div>
      </div>
    );
  }

  const sanitizedHtml = sanitizeArticleHtml(article.content_html || "");
  const toc = extractTocFromHtml(sanitizedHtml);
  const { beforeTocHtml, afterTocHtml } = injectTocIntoArticle(sanitizedHtml, toc);

  const dateStr = article.published || (article.published_at ? article.published_at.split("T")[0] : "");
  const isRtl = ["ar", "he", "fa", "ur"].includes(article.language || "");

  return (
    <article 
      className="max-w-3xl mx-auto py-6 space-y-8 animate-fade-in text-left" 
      id="blog-post-view"
      lang={article.language || "en"}
      dir={isRtl ? "rtl" : undefined}
    >
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); onNavigateHome(); }}
          className="hover:text-slate-900 transition-colors"
        >
          Home
        </a>
        <span aria-hidden="true">/</span>
        <a 
          href="/blog" 
          onClick={(e) => { e.preventDefault(); onNavigateBlogIndex(); }}
          className="hover:text-slate-900 transition-colors"
        >
          Blog
        </a>
        <span aria-hidden="true">/</span>
        <span className="text-slate-900 font-bold truncate max-w-xs">{article.title}</span>
      </nav>

      {/* Article Title & Metadata (Guide Rule: The title as the page's only <h1>, with the published date and read time near it. Nothing else under the title - no subtitle.) */}
      <header className="space-y-3 border-b border-slate-200/80 pb-6">
        <h1 className="text-3xl sm:text-4xl lg:text-4xl font-black text-slate-900 tracking-tight leading-[1.2] [text-wrap:balance]">
          {article.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
          {dateStr && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <time dateTime={dateStr}>{dateStr}</time>
            </span>
          )}
          {dateStr && article.read_time > 0 && <span aria-hidden="true">·</span>}
          {article.read_time > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.read_time} min read</span>
            </span>
          )}
        </div>
      </header>

      {/* Render optional hero image if non-empty URL provided (Guide: "If either is ever a non-empty URL, you may show it.") */}
      {(article.hero_image_url || article.featured_image) && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-[400px]">
          <img 
            src={article.hero_image_url || article.featured_image} 
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {/* Article Content Container */}
      <div className="blog-prose space-y-6 text-slate-800 leading-relaxed font-normal text-base">
        {/* Render content preceding Table of Contents (e.g. Key Takeaways) */}
        {beforeTocHtml && (
          <div 
            className="prose-takeaways"
            dangerouslySetInnerHTML={{ __html: beforeTocHtml }} 
          />
        )}

        {/* Table of Contents (Guide Rule: Put it under a "Table of contents" heading, right after the Key takeaways list and before the rest of content_html; with no takeaways, above content_html. One link per <h2> that has an id, except id="faq", in order.) */}
        {toc.length > 0 && (
          <nav 
            aria-label="Table of contents" 
            className="my-6 p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3"
            id="table-of-contents"
          >
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2 m-0 border-none p-0">
              <List className="w-4 h-4 text-indigo-600" />
              <span>Table of contents</span>
            </h2>
            <ol className="space-y-1.5 list-decimal list-inside text-sm text-slate-700 m-0 p-0">
              {toc.map(item => (
                <li key={item.id} className="leading-snug">
                  <a 
                    href={`#${item.id}`} 
                    className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium transition-colors"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Render rest of sanitized article content (Headings, Body paragraphs, Lists, Tables, Blockquotes, FAQ) */}
        <div 
          className="prose-body space-y-6"
          dangerouslySetInnerHTML={{ __html: afterTocHtml }} 
        />
      </div>

      {/* Back to Blog Action */}
      <footer className="pt-8 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateBlogIndex}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to all articles</span>
        </button>

        <a 
          href="/venues" 
          onClick={(e) => { e.preventDefault(); onNavigateHome(); }}
          className="text-xs text-slate-500 hover:text-slate-800"
        >
          GigLizard Home
        </a>
      </footer>
    </article>
  );
}
