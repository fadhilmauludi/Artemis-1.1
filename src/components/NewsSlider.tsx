import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DisasterNewsArticle } from '@/data/newsDataApi';

interface NewsSliderProps {
  articles: DisasterNewsArticle[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"%3E%3Crect width="800" height="450" fill="%23111619"/%3E%3Cpath d="M0 390L170 255 285 330 450 145 800 370V450H0Z" fill="%232d4638"/%3E%3Cpath d="M430 330c-24-58 35-84 37-145 57 60 69 105 30 145-18 19-48 22-67 0Z" fill="%23f07825"/%3E%3Ctext x="32" y="415" fill="white" font-family="sans-serif" font-size="25" opacity=".8"%3EARTEMIS FIRE NEWS%3C/text%3E%3C/svg%3E';

export function NewsSlider({ articles, isLoading, error, onRetry }: NewsSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => setActiveIndex(0), [articles]);

  const activeArticle = articles[activeIndex];
  const move = (direction: -1 | 1) => {
    setActiveIndex((current) => (current + direction + articles.length) % articles.length);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b0f11] shadow-[0_14px_45px_rgba(0,0,0,0.18)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-orange-300/20 bg-orange-400/10">
            <Flame className="h-4 w-4 text-orange-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white/90">Wildfire intelligence</h2>
              <span className="rounded-full border border-orange-300/20 bg-orange-300/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-orange-200">Live news</span>
            </div>
            <p className="mt-1 text-[11px] text-white/40">Local & global coverage · NewsData.io</p>
          </div>
        </div>
        {articles.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-white/35">{String(activeIndex + 1).padStart(2, '0')} / {String(articles.length).padStart(2, '0')}</span>
            <button type="button" onClick={() => move(-1)} aria-label="Previous wildfire article" className="rounded-md border border-white/[0.1] p-1.5 text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" onClick={() => move(1)} aria-label="Next wildfire article" className="rounded-md border border-white/[0.1] p-1.5 text-white/45 transition-colors hover:bg-white/[0.08] hover:text-white"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </header>

      {isLoading && <div className="flex items-center gap-2 px-4 py-10 text-xs text-white/50 sm:px-5"><LoaderCircle className="h-4 w-4 animate-spin text-orange-300" /> Loading wildfire intelligence...</div>}
      {error && !isLoading && (
        <div className="flex items-start gap-3 px-4 py-6 text-xs text-red-200 sm:px-5">
          <div><p>{error}</p><button type="button" onClick={onRetry} className="mt-2 inline-flex items-center gap-1.5 text-white/70 hover:text-white"><RefreshCw className="h-3 w-3" /> Try again</button></div>
        </div>
      )}
      {!isLoading && !error && !activeArticle && <p className="px-4 py-10 text-xs text-white/45 sm:px-5">No wildfire articles matched the current search.</p>}
      {!isLoading && !error && activeArticle && (
        <div className="grid lg:grid-cols-[1.35fr_1fr]">
          <a href={activeArticle.link} target="_blank" rel="noopener noreferrer" className="group relative min-h-[280px] overflow-hidden border-b border-white/[0.08] lg:min-h-[330px] lg:border-b-0 lg:border-r">
            <img src={activeArticle.imageUrl || FALLBACK_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-90" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080b0e] via-[#080b0e]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-orange-200/80"><span className="rounded-full bg-orange-400 px-2 py-1 font-bold text-[#17100a]">Featured</span><span>{activeArticle.language}</span></div>
              <h3 className="max-w-xl text-xl font-semibold leading-7 text-white transition-colors group-hover:text-orange-100 sm:text-2xl">{activeArticle.title}</h3>
              <ArticleMeta article={activeArticle} light />
            </div>
          </a>
          <div className="divide-y divide-white/[0.07]">
            {articles.slice(0, 4).map((article, index) => (
              <button type="button" key={article.id} onClick={() => setActiveIndex(index)} className={`group flex w-full gap-3 p-4 text-left transition-colors hover:bg-white/[0.04] ${index === activeIndex ? 'bg-white/[0.035]' : ''}`}>
                <img src={article.imageUrl || FALLBACK_IMAGE} alt="" className="h-16 w-24 shrink-0 rounded-md border border-white/[0.08] object-cover opacity-80" onError={(event) => { event.currentTarget.src = FALLBACK_IMAGE; }} />
                <span className="min-w-0">
                  <span className={`line-clamp-2 text-xs font-medium leading-5 ${index === activeIndex ? 'text-orange-100' : 'text-white/70 group-hover:text-white/90'}`}>{article.title}</span>
                  <span className="mt-1.5 block font-mono text-[9px] text-white/35">{article.sourceName} · {formatDate(article.publishedAt)}</span>
                </span>
              </button>
            ))}
            <a href={activeArticle.link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 font-mono text-[10px] uppercase tracking-wider text-white/40 transition-colors hover:text-orange-200">Open original article <ArrowUpRight className="h-3.5 w-3.5" /></a>
          </div>
        </div>
      )}
    </section>
  );
}

function ArticleMeta({ article, light = false }: { article: DisasterNewsArticle; light?: boolean }) {
  return (
    <div className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] ${light ? 'text-white/60' : 'text-white/40'}`}>
      <span>{article.sourceName}</span>
      <span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> {formatDate(article.publishedAt)}</span>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}
