// src/pages/Movies.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { searchMovies, discoverMovies } from "../lib/api";
import type { SearchResult } from "../lib/api";

// ─── FILTER CONFIG ────────────────────────────────────────────────────────────

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
      { label: "Feelgood",   sub: "Light & fun",         value: "feelgood"   },
      { label: "Heartfelt",  sub: "Drama & romance",     value: "heartfelt"  },
      { label: "Tense",      sub: "Thriller & mystery",  value: "suspense"   },
      { label: "Intense",    sub: "Action & war",        value: "intense"    },
      { label: "Thoughtful", sub: "Drama & history",     value: "thoughtful" },
      { label: "Dark",       sub: "Horror & crime",      value: "dark"       },
      { label: "Epic",       sub: "Adventure & fantasy", value: "epic"       },
      { label: "Sci-Fi",     sub: "Future & beyond",     value: "sci-fi"     },
    ],
  },
  {
    key: "duration",
    label: "03 / TIME",
    question: "How long do you have?",
    options: [
      { label: "Quick",    sub: "Under 90 min", value: "short"  },
      { label: "Standard", sub: "90 – 120 min", value: "medium" },
      { label: "Epic",     sub: "Over 120 min", value: "long"   },
    ],
  },
] as const;

type StepKey = "era" | "mood" | "duration";

const GENRE_MAP: Record<string, { include: string; exclude?: string }> = {
  feelgood:   { include: "35|10751|16", exclude: "27|80|53|10752" },
  heartfelt:  { include: "18|10749",    exclude: "27|53|10752"    },
  dark:       { include: "27|80"                                  },
  suspense:   { include: "53|9648"                                },
  intense:    { include: "28|10752"                               },
  thoughtful: { include: "18|36|99",    exclude: "10749|53"       },
  epic:       { include: "12|14"                                  },
  "sci-fi":   { include: "878"                                    },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function Movies() {
  const [selections, setSelections] = useState<Partial<Record<StepKey, string>>>({});
  const [movies,     setMovies]     = useState<SearchResult[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [searchQ,    setSearchQ]    = useState("");
  const [searchErr,  setSearchErr]  = useState<string | null>(null);
  const [mode,       setMode]       = useState<"filter" | "search" | "idle">("idle");

  const currentStep = STEPS.find(s => !selections[s.key as StepKey]);
  const allSelected = STEPS.every(s => selections[s.key as StepKey]);

  // Discovery
  useEffect(() => {
    if (!allSelected) return;
    const { era, mood, duration } = selections;
    setMode("filter");
    setLoading(true);

    const params: Record<string, string> = {
      sort_by: "vote_average.desc",
      "vote_count.gte": "800",
      page: "1",
    };
    if (era === "classic")  params["primary_release_date.lte"] = "1969-12-31";
    if (era === "70s_80s")  { params["primary_release_date.gte"] = "1970-01-01"; params["primary_release_date.lte"] = "1989-12-31"; }
    if (era === "90s_00s")  { params["primary_release_date.gte"] = "1990-01-01"; params["primary_release_date.lte"] = "2009-12-31"; }
    if (era === "modern")   params["primary_release_date.gte"] = "2010-01-01";
    if (duration === "short")  params["with_runtime.lte"] = "90";
    if (duration === "medium") { params["with_runtime.gte"] = "90"; params["with_runtime.lte"] = "120"; }
    if (duration === "long")   params["with_runtime.gte"] = "120";
    if (mood && GENRE_MAP[mood]) {
      params["with_genres"] = GENRE_MAP[mood].include;
      if (GENRE_MAP[mood].exclude) params["without_genres"] = GENRE_MAP[mood].exclude!;
    }

    discoverMovies(params)
      .then(r => setMovies(r.filter(m => m.poster)))
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [allSelected, JSON.stringify(selections)]);

  // Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setMode("search"); setSelections({}); setLoading(true); setSearchErr(null);
    const results = await searchMovies(searchQ).catch(() => []);
    setMovies(results);
    if (!results.length) setSearchErr(`No results for "${searchQ}"`);
    setLoading(false);
  };

  const select = (key: StepKey, value: string) =>
    setSelections(prev => ({ ...prev, [key]: value }));

  const reset = () => {
    setSelections({}); setMovies([]); setSearchQ("");
    setSearchErr(null); setMode("idle"); setLoading(false);
  };

  return (
    <div className="min-h-dvh bg-[#0a0a0a] text-white font-sans overflow-x-hidden">

      <header className="border-b border-white/10 px-6 md:px-12 py-5 flex items-center justify-between sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur">
        <span className="text-xs font-mono tracking-[0.25em] text-white/40 uppercase">Film Index</span>
        {mode !== "idle" && (
          <button onClick={reset} className="text-xs font-mono tracking-[0.2em] text-white/40 hover:text-white transition-colors uppercase">
            ← Start over
          </button>
        )}
      </header>

      <section className="px-6 md:px-12 pt-16 pb-10 border-b border-white/10">
        <h1 className="font-black uppercase leading-[0.88] tracking-[-0.03em]" style={{ fontSize: "clamp(3.5rem, 11vw, 9rem)" }}>
          Find Your<br /><span className="text-white/20">Next Film</span>
        </h1>
        <p className="mt-6 text-white/40 text-sm font-mono tracking-wider max-w-md">
          Three filters. Four results. No noise. Powered by OMDB &amp; TMDB.
        </p>
      </section>

      <section className="px-6 md:px-12 py-8 border-b border-white/10">
        <form onSubmit={handleSearch} className="flex items-center gap-4">
          <input
            value={searchQ} onChange={e => setSearchQ(e.target.value)}
            placeholder="Search by title…"
            className="flex-1 bg-transparent text-white text-lg md:text-xl font-light placeholder-white/20 focus:outline-none border-b border-white/20 focus:border-white/60 pb-2 transition-colors"
          />
          <button type="submit" className="text-white/40 hover:text-white transition-colors text-2xl">→</button>
        </form>
        {searchErr && <p className="mt-3 text-red-400 text-xs font-mono">{searchErr}</p>}
      </section>

      {/* Step wizard */}
      <AnimatePresence mode="wait">
        {mode !== "search" && !allSelected && currentStep && (
          <motion.section
            key={currentStep.key}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="px-6 md:px-12 py-12 border-b border-white/10"
          >
            <div className="flex items-center gap-4 mb-10">
              {STEPS.map((s, i) => {
                const done = !!selections[s.key as StepKey];
                const current = s.key === currentStep.key;
                return (
                  <div key={s.key} className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 transition-all ${current ? "opacity-100" : done ? "opacity-60" : "opacity-20"}`}>
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono ${done ? "bg-white border-white text-black" : current ? "border-white/80" : "border-white/20 text-white/20"}`}>
                        {done ? "✓" : i + 1}
                      </span>
                      <span className="text-[10px] font-mono tracking-[0.2em] uppercase hidden sm:block text-white/60">{s.key}</span>
                    </div>
                    {i < STEPS.length - 1 && <span className="text-white/15 text-xs">─</span>}
                  </div>
                );
              })}
            </div>

            <span className="text-[10px] font-mono text-white/30 tracking-[0.25em] uppercase block mb-2">{currentStep.label}</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">{currentStep.question}</h2>

            <div className="flex flex-wrap gap-3">
              {currentStep.options.map(opt => (
                <motion.button
                  key={opt.value} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => select(currentStep.key as StepKey, opt.value)}
                  className="group flex flex-col items-start px-5 py-4 border border-white/15 hover:border-white/70 hover:bg-white hover:text-black transition-all duration-200 rounded-sm text-left min-w-[120px]"
                >
                  <span className="text-sm font-bold uppercase tracking-wide">{opt.label}</span>
                  <span className="text-[10px] font-mono text-white/40 group-hover:text-black/50 mt-1 transition-colors">{opt.sub}</span>
                </motion.button>
              ))}
            </div>

            {Object.keys(selections).length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {STEPS.filter(s => selections[s.key as StepKey]).map(s => {
                  const opt = s.options.find(o => o.value === selections[s.key as StepKey]);
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

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.section key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 md:px-12 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0,1,2,3].map(i => <div key={i} className="aspect-[2/3] bg-white/5 animate-pulse rounded-sm" style={{ animationDelay: `${i*80}ms` }} />)}
            </div>
          </motion.section>
        )}
        {!loading && movies.length > 0 && (
          <motion.section key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 md:px-12 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {movies.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Link to={`/movie/${m.id}`} className="group block relative aspect-[2/3] overflow-hidden rounded-sm bg-white/5">
                    <img src={m.poster} alt={m.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <p className="text-white text-sm font-bold leading-tight line-clamp-2">{m.title}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-white/50 text-[10px] font-mono">{m.year}</span>
                        {m.imdbRating && <span className="text-[10px] font-mono bg-yellow-400 text-black px-1.5 py-0.5 rounded-sm font-bold">★ {m.imdbRating}</span>}
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 text-[9px] font-mono text-white/30 bg-black/40 px-1.5 py-0.5 rounded-sm">{String(i+1).padStart(2,"0")}</div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <p className="mt-8 text-center text-white/20 text-xs font-mono tracking-wider">Click a poster to open the film viewer →</p>
          </motion.section>
        )}
        {!loading && movies.length === 0 && mode !== "idle" && !currentStep && (
          <motion.section key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 md:px-12 py-24 text-center">
            <p className="text-white/20 text-sm font-mono uppercase tracking-widest">No matches found.</p>
            <button onClick={reset} className="mt-6 text-xs font-mono text-white/40 hover:text-white underline underline-offset-4 transition-colors">Try different filters</button>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="border-t border-white/8 px-6 md:px-12 py-6 flex items-center justify-between mt-8">
        <span className="text-[10px] font-mono text-white/20 tracking-wider uppercase">Film Index</span>
        <div className="flex items-center gap-4 text-[10px] font-mono text-white/15">
          <span>TMDB</span><span className="text-white/10">·</span><span>OMDB</span><span className="text-white/10">·</span><span>React + Framer Motion</span>
        </div>
      </footer>
    </div>
  );
}