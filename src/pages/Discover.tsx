import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { discoverMovies } from "../lib/api";
import type { SearchResult } from "../lib/api";
const STEPS = [
  {
    key: "era", label: "Era",
    question: "The Era",
    options: [
      { label: "Pre-1970",  value: "classic"  },
      { label: "1970–1989", value: "70s_80s"  },
      { label: "1990–2009", value: "90s_00s"  },
      { label: "2010+",     value: "modern"   },
    ],
  },
  {
    key: "mood", label: "Mood",
    question: "Atmosphere",
    options: [
      { label: "Feelgood",   value: "feelgood"   },
      { label: "Heartfelt",  value: "heartfelt"  },
      { label: "Tense",      value: "suspense"   },
      { label: "Intense",    value: "intense"    },
      { label: "Thoughtful", value: "thoughtful" },
      { label: "Dark",       value: "dark"       },
      { label: "Epic",       value: "epic"       },
      { label: "Sci-Fi",     value: "sci-fi"     },
    ],
  },
  {
    key: "duration", label: "Time",
    question: "Running Time",
    options: [
      { label: "Short (< 90 min)", value: "short"  },
      { label: "Standard",         value: "medium" },
      { label: "Long (> 120 min)",  value: "long"   },
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
    <div className="min-h-dvh bg-white flex flex-col px-8 md:px-14">
      {/* Vi använder en fast pt-32 (padding top) för att låsa headerns position */}
      <div className="max-w-4xl w-full mx-auto pt-32 md:pt-48 pb-24">
        
        {/* Header - Nu låst i toppen av containern */}
        <div className="mb-16 flex items-end justify-between min-h-[64px]">
          <motion.h1
            key={allSelected ? "results" : "discover"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-5xl text-neutral-900 italic tracking-tight"
          >
            {allSelected ? "Our Picks" : "Find a film for tonight"}
          </motion.h1>

          {allSelected && !loading && (
            <button 
              onClick={reset}
              className="text-[14px] text-neutral-400 hover:text-neutral-900 border-b border-transparent hover:border-neutral-900 transition-all pb-0.5 mb-2"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif" }}
            >
            Start over?
            </button>
          )}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {!allSelected ? (
              <motion.div 
                key="questions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-wrap md:flex-nowrap gap-x-20 gap-y-12"
              >
                {STEPS.map((step, index) => {
                  const isActive = index === stepIndex;
                  const isPast = index < stepIndex;

                  return (
                    <motion.div
                      key={step.key}
                      animate={{ opacity: isPast ? 0.15 : isActive ? 1 : 0.25 }}
                      transition={{ duration: 0.3 }}
                      className="min-w-[140px]"
                    >
                      <h2 className="text-lg md:text-xl text-neutral-800 mb-6 tracking-wide">
                        {step.question}
                      </h2>

                      {isActive && (
                        <div className="flex flex-col gap-3">
                          {step.options.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => select(step.key as StepKey, opt.value)}
                              className="text-left text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : loading ? (
              <motion.div 
                key="loading" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-10"
              >
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex flex-col">
                    {/* Skeleton poster */}
                    <div className="aspect-[2/3] bg-neutral-100 animate-pulse" />
                    {/* Skeleton text */}
                    <div className="mt-4 h-3 w-2/3 bg-neutral-100 animate-pulse rounded" />
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="results" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-10"
              >

            {movies.slice(0, 3).map((m, i) => (
            <motion.div 
                key={m.id} 
                // Tagit bort y: 10 för att slippa slide-in effekten
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ 
                duration: 0.4, 
                delay: i * 0.05 // Snabbare sekventiell toning
                }}
            >
                <Link to={`/movie/${m.id}`} className="group block">
                <div className="aspect-[2/3] overflow-hidden transition-all duration-500 bg-neutral-50">
                    <img 
                    src={m.poster} 
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-700" 
                    />
                </div>
                <div className="mt-4">
                    <p className="font-medium text-neutral-900 leading-tight text-[13px]">{m.title} ({m.year})</p>
                </div>
                </Link>
            </motion.div>
            ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}