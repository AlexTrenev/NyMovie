// src/pages/Discover.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { discoverMovies } from "../lib/api";
import type { SearchResult } from "../lib/api";

const STEPS = [
  {
    key: "era", label: "Era",
    question: "When was it made?",
    options: [
      { label: "Pre-1970",  sub: "The Classics",   value: "classic"  },
      { label: "1970–1989", sub: "New Hollywood",  value: "70s_80s"  },
      { label: "1990–2009", sub: "The Golden Age", value: "90s_00s"  },
      { label: "2010+",     sub: "Contemporary",   value: "modern"   },
    ],
  },
  {
    key: "mood", label: "Mood",
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
    key: "duration", label: "Time",
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

export default function Discover() {
  const [selections, setSelections] = useState<Partial<Record<StepKey, string>>>({});
  const [movies,     setMovies]     = useState<SearchResult[]>([]);
  const [loading,    setLoading]    = useState(false);

  const currentStep = STEPS.find(s => !selections[s.key as StepKey]);
  const allSelected = STEPS.every(s => selections[s.key as StepKey]);
  const stepIndex   = STEPS.findIndex(s => !selections[s.key as StepKey]);

  useEffect(() => {
    if (!allSelected) return;
    const { era, mood, duration } = selections;
    setLoading(true);

    const params: Record<string, string> = { sort_by: "vote_average.desc", "vote_count.gte": "800", page: "1" };
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

  const select = (key: StepKey, value: string) =>
    setSelections(prev => ({ ...prev, [key]: value }));
  const reset = () => { setSelections({}); setMovies([]); };

  return (
    <div className="min-h-dvh bg-[#f8f7f4]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      <div className="pt-28 px-8 md:px-14 pb-32">

        {/* Header */}
        <div className="mb-16">
          <h1 className="text-neutral-900 font-bold leading-[0.85] tracking-[-0.04em]"
            style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            Film<br /><span className="text-neutral-300">Curator</span>
          </h1>
          <p className="mt-4 text-neutral-400 text-sm italic max-w-sm">
            Three questions. Four films curated for you.
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-14">
          {STEPS.map((s, i) => {
            const done    = !!selections[s.key as StepKey];
            const current = !allSelected && i === stepIndex;
            return (
              <div key={s.key} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${done ? "bg-neutral-900" : current ? "bg-neutral-400 scale-125" : "bg-neutral-200"}`} />
                  <span className={`text-[11px] font-mono tracking-[0.2em] uppercase transition-colors ${done || current ? "text-neutral-600" : "text-neutral-300"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && <span className="text-neutral-200 text-xs">─</span>}
              </div>
            );
          })}
        </div>

        {/* Step wizard */}
        <AnimatePresence mode="wait">
          {!allSelected && currentStep && (
            <motion.div key={currentStep.key}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}>

              {/* Chosen so far */}
              {Object.keys(selections).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                  {STEPS.filter(s => selections[s.key as StepKey]).map(s => {
                    const opt = s.options.find(o => o.value === selections[s.key as StepKey]);
                    return (
                      <span key={s.key}
                        className="text-[11px] font-mono tracking-[0.15em] uppercase text-neutral-500 border border-neutral-200 px-3 py-1">
                        {opt?.label}
                      </span>
                    );
                  })}
                </div>
              )}

              <h2 className="text-2xl md:text-3xl font-medium text-neutral-800 mb-8 italic">
                {currentStep.question}
              </h2>

              <div className="flex flex-wrap gap-3">
                {currentStep.options.map(opt => (
                  <motion.button key={opt.value}
                    whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                    onClick={() => select(currentStep.key as StepKey, opt.value)}
                    className="group flex flex-col items-start px-5 py-4 border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-900 transition-all duration-200 text-left min-w-[130px]"
                  >
                    <span className="text-sm font-medium text-neutral-900 group-hover:text-white transition-colors">{opt.label}</span>
                    <span className="text-[10px] font-mono text-neutral-400 group-hover:text-neutral-400 mt-1">{opt.sub}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[0,1,2,3].map(i => <div key={i} className="aspect-[2/3] bg-neutral-200 animate-pulse" />)}
            </motion.div>
          )}

          {!loading && allSelected && movies.length > 0 && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="mb-8 flex items-center justify-between">
                <p className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400">
                  Curated for you
                </p>
                <button onClick={reset}
                  className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 transition-all pb-0.5">
                  ← Start over
                </button>
              </div>

              {/* Large editorial layout — first film big, rest smaller */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Featured */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <Link to={`/movie/${movies[0].id}`} className="group block">
                    <div className="aspect-[3/4] overflow-hidden bg-neutral-200 shadow-md group-hover:shadow-xl transition-shadow duration-500">
                      <img src={movies[0].poster} alt={movies[0].title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    </div>
                    <div className="mt-3">
                      <span className="text-[10px] font-mono text-neutral-400 tracking-wider uppercase">No. 01</span>
                      <p className="text-lg font-medium text-neutral-900 mt-1 leading-tight">{movies[0].title}</p>
                      <p className="text-[11px] font-mono text-neutral-400 mt-0.5 tracking-wider">{movies[0].year}</p>
                    </div>
                  </Link>
                </motion.div>

                {/* Supporting 3 */}
                <div className="grid grid-cols-1 gap-4">
                  {movies.slice(1).map((m, i) => (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i+1) * 0.08 }}>
                      <Link to={`/movie/${m.id}`} className="group flex gap-4 items-start">
                        <div className="w-20 flex-shrink-0 aspect-[2/3] overflow-hidden bg-neutral-200 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                          <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="pt-1">
                          <span className="text-[10px] font-mono text-neutral-300 tracking-wider uppercase">No. {String(i+2).padStart(2,"0")}</span>
                          <p className="text-sm font-medium text-neutral-900 mt-1 leading-snug group-hover:opacity-60 transition-opacity">{m.title}</p>
                          <p className="text-[11px] font-mono text-neutral-400 mt-1 tracking-wider">{m.year}</p>
                          {m.imdbRating && (
                            <p className="text-[10px] font-mono text-neutral-400 mt-1">★ {m.imdbRating}</p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {!loading && allSelected && movies.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center">
              <p className="text-neutral-400 italic text-sm">No matches for this combination.</p>
              <button onClick={reset} className="mt-4 text-[11px] font-mono uppercase tracking-wider text-neutral-900 border-b border-neutral-900 pb-0.5">
                Try again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}