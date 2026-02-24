// src/pages/Search.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { searchMovies } from "../lib/api";
import type { SearchResult } from "../lib/api";
import Navbar from "../components/navbar";

const DISPLAY: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
};
const SF: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};

// Matches headingStyle from Discover exactly
const headingStyle: React.CSSProperties = {
  ...DISPLAY,
  fontWeight: 600,
  fontSize: "clamp(2rem, 3.5vw, 3rem)",
  letterSpacing: "-0.025em",
  lineHeight: 1.05,
  color: "#171717",
  margin: 0,
};

const subtitleStyle: React.CSSProperties = {
  ...SF,
  fontWeight: 400,
  fontSize: "clamp(0.85rem, 1.1vw, 0.95rem)",
  color: "#a3a3a3",
  marginTop: "0.45rem",
  letterSpacing: "-0.01em",
  lineHeight: 1.4,
};

export default function Search() {
  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setErr(null);
    setResults([]);
    const res = await searchMovies(query).catch(() => []);
    setResults(res);
    if (!res.length) setErr(`Nothing found for "${query}"`);
    setLoading(false);
  };

  const hasResults = !loading && results.length > 0;

  return (
    <div className="min-h-dvh bg-white flex flex-col px-8 md:px-14">
      <Navbar background="#ffffff" />

      <div className="max-w-4xl w-full mx-auto pt-32 md:pt-48 pb-24">

        {/* ── HEADER — matches Curator exactly ── */}
        <div className="mb-16 flex items-end justify-between">
          <div>
            {/* Title doubles as the search input — invisible border until focus/has-value */}
            <form onSubmit={handleSearch} style={{ margin: 0 }}>
              <input
                ref={inputRef}
                value={query}
                onChange={e => { setQuery(e.target.value); if (err) setErr(null); }}
                placeholder="Search"
                autoComplete="off"
                style={{
                  ...headingStyle,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  padding: 0,
                  width: "100%",
                  caretColor: "#171717",
                  // Placeholder colour matches subtitle grey
                  color: query ? "#171717" : "#d4d4d4",
                }}
              />
              <button type="submit" style={{ display: "none" }} />
            </form>
            {/* Subtitle — hides once results arrive to keep it clean */}
            <AnimatePresence>
              {!hasResults && (
                <motion.p
                  key="sub"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={subtitleStyle}
                >
                  {err ? err : "Type a movie title and press Enter."}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Clear — appears once results are showing */}
          {hasResults && (
            <button
              onClick={() => { setQuery(""); setResults([]); setErr(null); inputRef.current?.focus(); }}
              className="text-[13px] text-neutral-400 hover:text-neutral-900 transition-colors"
              style={{ ...SF, background: "none", border: "none", cursor: "pointer" }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── RESULTS ── */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex items-baseline justify-between py-5 border-b border-neutral-100">
                  <div className="h-3.5 bg-neutral-100 animate-pulse rounded-sm" style={{ width: `${45 + i * 12}%` }} />
                  <div className="h-3 w-8 bg-neutral-100 animate-pulse rounded-sm" />
                </div>
              ))}
            </motion.div>
          )}

          {hasResults && (
            <motion.div key="results"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              {results.map((movie, i) => (
                <motion.button
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    background: "none",
                    border: "none",
                    borderBottom: "1px solid #f0f0f0",
                    padding: "1.1rem 0",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    gap: "1rem",
                    width: "100%",
                    textAlign: "left",
                  }}
                >
                  <span style={{
                    ...DISPLAY,
                    fontWeight: 500,
                    fontSize: "clamp(0.95rem, 1.4vw, 1.05rem)",
                    letterSpacing: "-0.015em",
                    color: "#171717",
                  }}>
                    {movie.title}
                  </span>
                  <span style={{ ...SF, fontSize: "12px", color: "#a3a3a3", flexShrink: 0 }}>
                    {movie.year}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}