// src/pages/Discover.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { discoverMovies } from "../lib/api";
import type { SearchResult } from "../lib/api";
import Navbar from "../components/navbar";

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
    question: "Runtime",
    options: [
      { label: "Short (< 90 min)", value: "short"  },
      { label: "Standard",         value: "medium" },
      { label: "Long (> 120 min)", value: "long"   },
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

// Shared heading style — used here and matched exactly in Search
export const headingStyle: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  fontWeight: 600,
  fontSize: "clamp(2rem, 3.5vw, 3rem)",
  letterSpacing: "-0.025em",
  lineHeight: 1.05,
  color: "#171717",
  margin: 0,
};

export const subtitleStyle: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
  fontWeight: 400,
  fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)",
  color: "#a3a3a3",
  marginTop: "0.45rem",
  letterSpacing: "-0.01em",
  lineHeight: 1.4,
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
      <Navbar background="#ffffff" />

      <div className="max-w-4xl w-full mx-auto pt-32 md:pt-48 pb-24">

        {/* ── HEADER ── */}
        <div className="mb-16 flex items-end justify-between">
          <AnimatePresence mode="wait">
            {!allSelected ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h1 style={headingStyle}>Curator</h1>
                <p style={subtitleStyle}>Not sure what to watch? Let's help you find a film.</p>
              </motion.div>
            ) : (
              <motion.div
                key="results-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <h1 style={headingStyle}>Our Picks</h1>
              </motion.div>
            )}
          </AnimatePresence>

          {allSelected && !loading && (
            <button
              onClick={reset}
              className="text-[13px] text-neutral-400 hover:text-neutral-900 transition-colors"
              style={{
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Start over?
            </button>
          )}
        </div>

        {/* ── CONTENT ── */}
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
                  const isPast   = index < stepIndex;
                  return (
                    <motion.div
                      key={step.key}
                      animate={{ opacity: isPast ? 0.15 : isActive ? 1 : 0.25 }}
                      transition={{ duration: 0.3 }}
                      className="min-w-[140px]"
                    >
                      <h2 style={{
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                        fontWeight: 400,
                        fontSize: "20px",
                        color: "#000000",
                        marginBottom: "1.5rem",
                      }}>
                        {step.question}
                      </h2>

                      {isActive && (
                        <div className="flex flex-col gap-3">
                          {step.options.map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => select(step.key as StepKey, opt.value)}
                              style={{
                                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                                fontWeight: 500,
                                fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
                                letterSpacing: "-0.015em",
                                color: "#b0b0b0",
                                background: "none",
                                border: "none",
                                padding: 0,
                                textAlign: "left",
                                cursor: "pointer",
                                transition: "color 0.15s ease",
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = "#171717")}
                              onMouseLeave={e => (e.currentTarget.style.color = "#b0b0b0")}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {isPast && (
                        <p style={{
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                          fontWeight: 500,
                          fontSize: "clamp(1rem, 1.6vw, 1.15rem)",
                          letterSpacing: "-0.015em",
                          color: "#171717",
                        }}>
                          {step.options.find(o => o.value === selections[step.key as StepKey])?.label}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-10"
              >
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex flex-col">
                    <div className="aspect-[2/3] bg-neutral-100 animate-pulse" />
                    <div className="mt-4 h-3 w-2/3 bg-neutral-100 animate-pulse rounded" />
                  </div>
                ))}
              </motion.div>

            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-10"
              >
                {movies.slice(0, 3).map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                  >
                    <Link to={`/movie/${m.id}`} className="group block">
                      <div className="aspect-[2/3] overflow-hidden bg-neutral-50">
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-full h-full object-cover transition-transform duration-700"
                        />
                      </div>
                      <div className="mt-4">
                        <p style={{
                          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
                          fontWeight: 400,
                          fontSize: "13px",
                          color: "#171717",
                          lineHeight: 1.4,
                        }}>
                          {m.title} ({m.year})
                        </p>
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