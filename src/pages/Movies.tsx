// src/pages/Movies.tsx
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── TYPES ────────────────────────────────────────────────────────────────────
type DisplayMovie = {
  id: number | string;
  title: string;
  poster_path: string;
  release_date: string;
  imdbRating?: string;
};

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const TMDB = "https://api.themoviedb.org/3";
const OMDB = "https://www.omdbapi.com/";
const IMG  = "https://image.tmdb.org/t/p/w500";

// ─── STEP DATA ────────────────────────────────────────────────────────────────
const STEPS = [
  {
    key: "era",
    label: "01 / ERA",
    question: "When was it made?",
    options: [
      { label: "Pre-1970",  sub: "The Classics",   value: "classic"  },
      { label: "1970–1989", sub: "New Hollywood",  value: "70s_80s"  },
      { label: "1990–2009", sub: "The Golden Age", value: "90s_00s"  },
      { label: "2010+",     sub: "Contemporary",   value: "modern"   },
    ],
  },
  {
    key: "mood",
    label: "02 / MOOD",
    question: "How do you want to feel?",
    options: [
      { label: "Feelgood",    sub: "Light & fun",         value: "feelgood"   },
      { label: "Heartfelt",   sub: "Drama & romance",     value: "heartfelt"  },
      { label: "Tense",       sub: "Thriller & mystery",  value: "suspense"   },
      { label: "Intense",     sub: "Action & war",        value: "intense"    },
      { label: "Thoughtful",  sub: "Drama & history",     value: "thoughtful" },
      { label: "Dark",        sub: "Horror & crime",      value: "dark"       },
      { label: "Epic",        sub: "Adventure & fantasy", value: "epic"       },
      { label: "Sci-Fi",      sub: "Future & beyond",     value: "sci-fi"     },
    ],
  },
  {
    key: "duration",
    label: "03 / TIME",
    question: "How long do you have?",
    options: [
      { label: "Quick",    sub: "Under 90 min",  value: "short"  },
      { label: "Standard", sub: "90 – 120 min",  value: "medium" },
      { label: "Epic",     sub: "Over 120 min",  value: "long"   },
    ],
  },
] as const;

type StepKey = "era" | "mood" | "duration";

// ─── GENRE MAP ────────────────────────────────────────────────────────────────
const GENRE_MAP: Record<string, { include: string; exclude?: string }> = {
  feelgood:   { include: "35|10751|16",  exclude: "27|80|53|10752" },
  heartfelt:  { include: "18|10749",     exclude: "27|53|10752"    },
  dark:       { include: "27|80"                                   },
  suspense:   { include: "53|9648"                                 },
  intense:    { include: "28|10752"                                },
  thoughtful: { include: "18|36|99",     exclude: "10749|53"       },
  epic:       { include: "12|14"                                   },
  "sci-fi":   { include: "878"                                     },
};

// ─── API HELPERS ──────────────────────────────────────────────────────────────
async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const key = (import.meta as any).env.VITE_TMDB_KEY;
  if (!key) return { results: [] };
  const q = new URLSearchParams({ api_key: key, ...params }).toString();
  const res = await fetch(`${TMDB}${endpoint}?${q}`);
  return res.json();
}

async function enrichWithIMDB(movies: any[]): Promise<DisplayMovie[]> {
  const tmdbKey = (import.meta as any).env.VITE_TMDB_KEY;
  const omdbKey = (import.meta as any).env.VITE_OMDB_KEY;
  return Promise.all(
    movies.map(async (m) => {
      try {
        if (tmdbKey && omdbKey) {
          const idRes = await fetch(`${TMDB}/movie/${m.id}/external_ids?api_key=${tmdbKey}`);
          const idData = await idRes.json();
          if (idData.imdb_id) {
            const omRes = await fetch(`${OMDB}?apikey=${omdbKey}&i=${idData.imdb_id}`);
            const omData = await omRes.json();
            if (omData.imdbRating && omData.imdbRating !== "N/A") {
              return { id: m.id, title: m.title, poster_path: m.poster_path, release_date: m.release_date, imdbRating: omData.imdbRating };
            }
          }
        }
      } catch {}
      return { id: m.id, title: m.title, poster_path: m.poster_path, release_date: m.release_date };
    })
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Movies() {
  const [selections, setSelections] = useState<Partial<Record<StepKey, string>>>({});
  const [movies,     setMovies]     = useState<DisplayMovie[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [searchQ,    setSearchQ]    = useState("");
  const [searchErr,  setSearchErr]  = useState<string | null>(null);
  const [mode,       setMode]       = useState<"filter" | "search" | "idle">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const currentStep = STEPS.find(s => !selections[s.key as StepKey]);
  const allSelected = STEPS.every(s => selections[s.key as StepKey]);

  // ── Discovery ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!allSelected) return;
    const { era, mood, duration } = selections;
    setMode("filter");
    setLoading(true);
    setSearchErr(null);

    const run = async () => {
      const params: Record<string, string> = {
        sort_by: "vote_average.desc",
        "vote_count.gte": "800",
        page: "1",
        language: "en-US",
        include_adult: "false",
      };
      if (era === "classic")  { params["primary_release_date.lte"] = "1969-12-31"; }
      if (era === "70s_80s")  { params["primary_release_date.gte"] = "1970-01-01"; params["primary_release_date.lte"] = "1989-12-31"; }
      if (era === "90s_00s")  { params["primary_release_date.gte"] = "1990-01-01"; params["primary_release_date.lte"] = "2009-12-31"; }
      if (era === "modern")   { params["primary_release_date.gte"] = "2010-01-01"; }
      if (duration === "short")  { params["with_runtime.lte"] = "90"; }
      if (duration === "medium") { params["with_runtime.gte"] = "90"; params["with_runtime.lte"] = "120"; }
      if (duration === "long")   { params["with_runtime.gte"] = "120"; }
      if (mood && GENRE_MAP[mood]) {
        params["with_genres"]    = GENRE_MAP[mood].include;
        if (GENRE_MAP[mood].exclude) params["without_genres"] = GENRE_MAP[mood].exclude!;
      }
      try {
        const data = await fetchTMDB("/discover/movie", params);
        const top4 = (data.results || []).slice(0, 4);
        const enriched = await enrichWithIMDB(top4);
        setMovies(enriched.filter(m => m.poster_path));
      } catch { setMovies([]); }
      setLoading(false);
    };
    run();
  }, [allSelected, JSON.stringify(selections)]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setMode("search");
    setSelections({});
    setLoading(true);
    setSearchErr(null);
    const key = (import.meta as any).env.VITE_OMDB_KEY;
    try {
      const res = await fetch(`${OMDB}?apikey=${key}&s=${encodeURIComponent(searchQ)}`);
      const data = await res.json();
      if (data.Response === "True") {
        const mapped: DisplayMovie[] = data.Search.slice(0, 4).map((m: any) => ({
          id: m.imdbID, title: m.Title,
          poster_path: m.Poster === "N/A" ? "" : m.Poster,
          release_date: m.Year,
        }));
        setMovies(mapped.filter(m => m.poster_path));
      } else {
        setMovies([]); setSearchErr(`No results for "${searchQ}"`);
      }
    } catch { setMovies([]); setSearchErr("Search failed."); }
    setLoading(false);
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setSelections({}); setMovies([]); setSearchQ("");
    setSearchErr(null); setMode("idle"); setLoading(false);
  };

  const select = (key: StepKey, value: string) => {
    setSelections(prev => ({ ...prev, [key]: value }));
  };

  const getPosterUrl = (m: DisplayMovie) =>
    m.poster_path?.startsWith("http") ? m.poster_path : IMG + m.poster_path;

  const getLinkID = (m: DisplayMovie) => m.id;

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white font-sans overflow-x-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="border-b border-white/10 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono tracking-[0.25em] text-white/40 uppercase">Film Index</span>
          <span className="text-white/20">·</span>
          <span className="text-xs font-mono text-white/25 tracking-wider">OMDB + TMDB</span>
        </div>
        {(mode !== "idle") && (
          <button onClick={reset} className="text-xs font-mono tracking-[0.2em] text-white/40 hover:text-white transition-colors uppercase">
            ← Start over
          </button>
        )}
      </header>

      {/* ── HERO TITLE ─────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 pt-16 pb-10 border-b border-white/10">
        <h1
          className="font-black uppercase leading-[0.88] tracking-[-0.03em] text-white"
          style={{ fontSize: "clamp(3.5rem, 11vw, 9rem)" }}
        >
          Find Your<br />
          <span className="text-white/20">Next Film</span>
        </h1>
        <p className="mt-6 text-white/40 text-sm font-mono tracking-wider max-w-md">
          Three filters. Four results. No noise. Powered by OMDB &amp; TMDB APIs.
        </p>
      </section>

      {/* ── SEARCH BAR ─────────────────────────────────────────────── */}
      <section className="px-6 md:px-12 py-8 border-b border-white/10">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <input
            ref={inputRef}
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            placeholder="Search by title…"
            className="flex-1 bg-transparent text-white text-lg md:text-xl font-light placeholder-white/20 focus:outline-none border-b border-white/20 focus:border-white/60 pb-2 transition-colors"
          />
          <button
            type="submit"
            className="text-white/40 hover:text-white transition-colors text-2xl font-light"
          >
            →
          </button>
        </form>
        {searchErr && <p className="mt-3 text-red-400 text-xs font-mono">{searchErr}</p>}
      </section>

      {/* ── STEP FILTER ────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {mode !== "search" && !allSelected && currentStep && (
          <motion.section
            key={currentStep.key}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="px-6 md:px-12 py-12 border-b border-white/10"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-4 mb-10">
              {STEPS.map((s, i) => {
                const done = !!selections[s.key as StepKey];
                const current = s.key === currentStep.key;
                return (
                  <div key={s.key} className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 transition-all ${current ? "opacity-100" : done ? "opacity-60" : "opacity-20"}`}>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono transition-all ${done ? "bg-white border-white text-black" : current ? "border-white/80 text-white" : "border-white/20 text-white/20"}`}>
                        {done ? "✓" : i + 1}
                      </span>
                      <span className="text-[10px] font-mono tracking-[0.2em] uppercase hidden sm:block text-white/60">
                        {s.key}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && <span className="text-white/15 text-xs">─</span>}
                  </div>
                );
              })}
            </div>

            {/* Question */}
            <div className="mb-8">
              <span className="text-[10px] font-mono text-white/30 tracking-[0.25em] uppercase block mb-2">
                {currentStep.label}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {currentStep.question}
              </h2>
            </div>

            {/* Options */}
            <div className="flex flex-wrap gap-3">
              {currentStep.options.map((opt) => (
                <motion.button
                  key={opt.value}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => select(currentStep.key as StepKey, opt.value)}
                  className="group flex flex-col items-start px-5 py-4 border border-white/15 hover:border-white/70 hover:bg-white hover:text-black transition-all duration-200 rounded-sm text-left min-w-[120px]"
                >
                  <span className="text-sm font-bold uppercase tracking-wide leading-tight">
                    {opt.label}
                  </span>
                  <span className="text-[10px] font-mono text-white/40 group-hover:text-black/50 mt-1 transition-colors">
                    {opt.sub}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Show chosen filters so far */}
            {Object.keys(selections).length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {STEPS.filter(s => selections[s.key as StepKey]).map(s => {
                  const val = selections[s.key as StepKey];
                  const opt = s.options.find(o => o.value === val);
                  return (
                    <span key={s.key} className="text-[10px] font-mono uppercase tracking-wider bg-white/10 text-white/60 px-3 py-1.5 rounded-full">
                      {s.key}: {opt?.label}
                    </span>
                  );
                })}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── RESULTS ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* Loading skeletons */}
        {loading && (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 md:px-12 py-12"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0,1,2,3].map(i => (
                <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-sm" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Movies grid */}
        {!loading && movies.length > 0 && (
          <motion.section
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 md:px-12 py-12"
          >
            {/* Result header */}
            <div className="mb-6 flex items-baseline justify-between">
              <div>
                {allSelected && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {STEPS.map(s => {
                      const val = selections[s.key as StepKey];
                      const opt = s.options.find(o => o.value === val);
                      return val ? (
                        <span key={s.key} className="text-[10px] font-mono uppercase tracking-wider border border-white/20 text-white/50 px-2 py-1 rounded-sm">
                          {opt?.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                {mode === "search" && (
                  <p className="text-white/40 text-xs font-mono mb-3 tracking-wider uppercase">
                    Search: "{searchQ}"
                  </p>
                )}
                <span className="text-xs font-mono text-white/25 tracking-[0.2em] uppercase">
                  {movies.length} result{movies.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {movies.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  <Link
                    to={`/movie/${getLinkID(m)}`}
                    className="group block relative aspect-[2/3] overflow-hidden rounded-sm bg-white/5"
                  >
                    {/* Poster */}
                    <img
                      src={getPosterUrl(m)}
                      alt={m.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Info */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-bold leading-tight line-clamp-2">{m.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-white/50 text-[10px] font-mono">{m.release_date?.split("-")[0]}</span>
                        {m.imdbRating && (
                          <span className="text-[10px] font-mono bg-yellow-400 text-black px-1.5 py-0.5 rounded-sm font-bold">
                            ★ {m.imdbRating}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Index number */}
                    <div className="absolute top-3 left-3 text-[9px] font-mono text-white/30 bg-black/40 px-1.5 py-0.5 rounded-sm">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Call to action */}
            <p className="mt-8 text-center text-white/20 text-xs font-mono tracking-wider">
              Click a poster to open the film viewer →
            </p>
          </motion.section>
        )}

        {/* Empty state */}
        {!loading && movies.length === 0 && mode !== "idle" && !currentStep && (
          <motion.section
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 md:px-12 py-24 text-center"
          >
            <p className="text-white/20 text-sm font-mono uppercase tracking-widest">
              No matches found for this combination.
            </p>
            <button onClick={reset} className="mt-6 text-xs font-mono text-white/40 hover:text-white underline underline-offset-4 transition-colors">
              Try different filters
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── HOW IT WORKS (idle state, educational) ─────────────────── */}
      <AnimatePresence>
        {mode === "idle" && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 md:px-12 py-16 mt-4 border-t border-white/10"
          >
            <h3 className="text-[10px] font-mono text-white/25 tracking-[0.3em] uppercase mb-10">
              How it works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "You filter",
                  desc: "Choose an era, a mood, and how long you have. Three questions, zero noise.",
                  api: null,
                },
                {
                  step: "02",
                  title: "TMDB discovers",
                  desc: "The Movie Database API finds films matching your criteria using genre IDs, runtime filters, and release dates.",
                  api: "TMDB /discover/movie",
                },
                {
                  step: "03",
                  title: "OMDB enriches",
                  desc: "Each result gets IMDb ratings fetched from OMDB, adding a trusted quality signal alongside the TMDB data.",
                  api: "OMDB /?i={imdb_id}",
                },
              ].map(card => (
                <div key={card.step} className="border border-white/8 rounded-sm p-6">
                  <span className="text-[10px] font-mono text-white/20 tracking-[0.3em]">{card.step}</span>
                  <h4 className="mt-3 text-lg font-bold text-white/70">{card.title}</h4>
                  <p className="mt-2 text-white/35 text-sm leading-relaxed">{card.desc}</p>
                  {card.api && (
                    <code className="mt-4 block text-[10px] font-mono text-emerald-400/60 bg-emerald-950/30 px-3 py-2 rounded-sm">
                      {card.api}
                    </code>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-16 border-t border-white/8 pt-10">
              <h3 className="text-[10px] font-mono text-white/25 tracking-[0.3em] uppercase mb-8">
                Film detail view
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Horizontal strip",
                    desc: "The film detail page shows TMDB backdrop images in a horizontal scroll strip. Scroll or drag to explore scenes. Images lazy-load with grayscale → colour hover transitions.",
                  },
                  {
                    title: "Info panel",
                    desc: "Toggle between the cinematic strip and an info panel that shows the tagline, synopsis, director, cast, runtime, and genres — all fetched live from TMDB.",
                  },
                ].map(f => (
                  <div key={f.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-px bg-white/15 self-stretch" />
                    <div>
                      <h4 className="text-sm font-bold text-white/60">{f.title}</h4>
                      <p className="mt-2 text-white/30 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 px-6 md:px-12 py-6 flex items-center justify-between">
        <span className="text-[10px] font-mono text-white/20 tracking-wider uppercase">Film Index</span>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-mono text-white/15">TMDB</span>
          <span className="text-white/10">·</span>
          <span className="text-[10px] font-mono text-white/15">OMDB</span>
          <span className="text-white/10">·</span>
          <span className="text-[10px] font-mono text-white/15">React + Framer Motion</span>
        </div>
      </footer>

    </div>
  );
}