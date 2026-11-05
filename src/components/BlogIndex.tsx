import React, { useState, useEffect } from "react";
import { 
  HeyCatchArticleListItem, 
  fetchAllHeyCatchArticles, 
  HEYCATCH_API_KEY 
} from "../utils/heycatchBlog";
import { Clock, Calendar, ArrowRight, BookOpen, RefreshCw, Sparkles, ChevronRight } from "lucide-react";

interface BlogIndexProps {
  onSelectArticle: (slug: string) => void;
  onNavigateHome: () => void;
}

export default function BlogIndex({ onSelectArticle, onNavigateHome }: BlogIndexProps) {
  const [articles, setArticles] = useState<HeyCatchArticleListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state via query param ?page=X (Guide requirement: "If you split the index into pages, do it with a query parameter on /blog (?page=2), never a new path.")
  const [page, setPage] = useState<number>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const p = parseInt(urlParams.get("page") || "1", 10);
      return isNaN(p) || p < 1 ? 1 : p;
    } catch {
      return 1;
    }
  });

  const pageSize = 12;

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchAllHeyCatchArticles(HEYCATCH_API_KEY)
      .then(res => {
        if (!isMounted) return;
        setArticles(res.articles || []);
        setTotal(res.total || 0);
        setIsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn("[Blog] Fetch error:", err);
        setError("Could not load articles at this time.");
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalPages = Math.ceil(articles.length / pageSize) || 1;
  const currentArticles = articles.slice((page - 1) * pageSize, page * pageSize);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    try {
      const url = newPage > 1 ? `/blog?page=${newPage}` : "/blog";
      window.history.pushState({ page: newPage }, "", url);
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-4" id="blog-index-page">
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
        <span className="text-slate-900 font-bold">Blog</span>
      </nav>

      {/* Header Block */}
      <div className="space-y-3 border-b border-slate-200/80 pb-6 text-left">
        <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Touring &amp; Live Music Playbooks</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight [text-wrap:balance]">
          GigLizard Touring &amp; Production Blog
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-normal leading-relaxed">
          In-depth guides on routing DIY tours, cold-emailing club bookers, optimizing soundboard riders, and filling live music rooms across the Lower 48.
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading articles...</p>
        </div>
      )}

      {/* Empty State (Guide requirement: "No articles yet? Still answer 200 with a short line, such as 'No articles yet'.") */}
      {!isLoading && articles.length === 0 && (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No articles yet</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Our touring guides and venue dispatches will be published here soon. Check back shortly!
          </p>
        </div>
      )}

      {/* Articles List (Guide Rule: One entry per article: title (linking to /blog/{slug}), published date and read time. Nothing else - no meta_description excerpt or summary.) */}
      {!isLoading && articles.length > 0 && (
        <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden" id="blog-article-list">
          {currentArticles.map((article) => {
            const dateStr = article.published || (article.published_at ? article.published_at.split("T")[0] : "");
            return (
              <article 
                key={article.id || article.slug}
                className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <a
                    href={`/blog/${article.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectArticle(article.slug);
                      try {
                        window.history.pushState({ slug: article.slug }, "", `/blog/${article.slug}`);
                      } catch (_) {}
                    }}
                    className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer block leading-snug"
                  >
                    {article.title}
                  </a>

                  {/* Clean unboxed metadata: published date & read time */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
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
                </div>

                <a
                  href={`/blog/${article.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectArticle(article.slug);
                    try {
                      window.history.pushState({ slug: article.slug }, "", `/blog/${article.slug}`);
                    } catch (_) {}
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 shrink-0 self-start sm:self-center"
                >
                  <span>Read article</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </article>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-slate-600 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
