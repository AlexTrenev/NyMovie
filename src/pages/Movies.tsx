// src/pages/Movies.tsx
import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { searchMovies } from "../lib/api";
import type { SearchResult } from "../lib/api";

// Deterministic scatter from index
function seed(i: number, o = 0) { return ((i * 2654435761 + o) >>> 0) / 4294967296; }
function rot(i: number) { return (seed(i, 1) - 0.5) * 12; }
function tx(i: number)  { return (seed(i, 2) - 0.5) * 20; }
function ty(i: number)  { return (seed(i, 3) - 0.5) * 16; }

const EDITORIAL: SearchResult[] = [
  { id: "tt0050083", title: "12 Angry Men",      year: "1957", poster: "https://m.media-amazon.com/images/M/MV5BMTYwOTEwNjAzMl5BMl5BanBnXkFtZTcwMjc3NjA0OA@@._V1_SX300.jpg" },
  { id: "tt0108052", title: "Schindler's List",  year: "1993", poster: "https://m.media-amazon.com/images/M/MV5BNDE4OTU5OTU5M15BMl5BanBnXkFtZTgwNjU3NDg4MTE@._V1_SX300.jpg" },
  { id: "tt0137523", title: "Fight Club",         year: "1999", poster: "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt0110912", title: "Pulp Fiction",       year: "1994", poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt0816692", title: "Interstellar",       year: "2014", poster: "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFiZWFiMjkyZjEzXkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt1375666", title: "Inception",          year: "2010", poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg" },
  { id: "tt0120737", title: "The Lord of the Rings", year: "2001", poster: "https://m.media-amazon.com/images/M/MV5BNzIxMDQ2YTctNDY4MC00NTM4LTswMDMtZTdmZDdiMDExZjE4XkEyXkFqcGc@._V1_SX300.jpg" },
  { id: "tt0068646", title: "The Godfather",      year: "1972", poster: "https://m.media-amazon.com/images/M/MV5BYTdiOTIyZTQtNmQ1OS00NjZlLWIyMTgtYzk5Y2M3ZDVmMDk1XkEyXkFqcGc@._V1_SX300.jpg" },
];

export default function Movies() {
  const [searchParams] = useSearchParams();
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<SearchResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [err,      setErr]      = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get("search") === "1") inputRef.current?.focus();
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setErr(null); setSearched(true);
    const res = await searchMovies(query).catch(() => []);
    setResults(res);
    if (!res.length) setErr(`Nothing found for "${query}"`);
    setLoading(false);
  };

  const clear = () => { setQuery(""); setResults([]); setSearched(false); setErr(null); };
  const display = searched ? results : EDITORIAL;

  return (
    <div className="min-h-dvh bg-[#f8f7f4]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Header */}
      <div className="pt-28 pb-8 px-8 md:px-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <h1 className="text-neutral-900 font-bold leading-[0.85] tracking-[-0.04em]"
            style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)" }}>
            Film<br /><span className="text-neutral-300">Archive</span>
          </h1>

          <form onSubmit={handleSearch} className="flex items-end gap-3 pb-1">
            <div className="relative">
              <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search title…" style={{ fontFamily: "inherit" }}
                className="w-64 md:w-80 bg-transparent border-b border-neutral-300 focus:border-neutral-900 pb-1.5 text-neutral-900 text-base placeholder-neutral-400 focus:outline-none transition-colors" />
              {searched && (
                <button type="button" onClick={clear}
                  className="absolute right-0 bottom-2 text-neutral-400 hover:text-neutral-900 text-sm transition-colors">✕</button>
              )}
            </div>
            <button type="submit"
              className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors pb-1.5">
              Go
            </button>
          </form>
        </div>

        <p className="mt-3 text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400">
          {searched ? `${results.length} results for "${query}"` : "Editorial picks"}
        </p>
        {err && <p className="mt-2 text-sm text-red-400 italic">{err}</p>}
      </div>

      {/* Grid */}
      <div className="px-8 md:px-14 pb-32">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[0,1,2,3].map(i => (
                <div key={i} className="aspect-[2/3] bg-neutral-200 animate-pulse" style={{ animationDelay: `${i*80}ms` }} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-12">
              {display.map((m, i) => <PosterCard key={m.id} movie={m} index={i} />)}
            </motion.div>
          )}
        </AnimatePresence>

        {!searched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-24 flex items-center gap-6 border-t border-neutral-200 pt-8">
            <span className="text-neutral-400 text-sm italic">Not sure what to watch?</span>
            <Link to="/discover"
              className="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-900 border-b border-neutral-900 pb-0.5 hover:opacity-40 transition-opacity">
              Try the Curator →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function PosterCard({ movie, index }: { movie: SearchResult; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotate: rot(index) }}
      animate={{ opacity: 1, y: 0,  rotate: rot(index) }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ rotate: 0, scale: 1.05, zIndex: 20, transition: { duration: 0.22 } }}
      style={{ x: tx(index), y: ty(index), transformOrigin: "center bottom", position: "relative", zIndex: 1 }}
    >
      <Link to={`/movie/${movie.id}`} className="block group">
        <div className="aspect-[2/3] overflow-hidden bg-neutral-200 shadow-[0_4px_24px_rgba(0,0,0,0.10)] group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-shadow duration-300">
          <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
        </div>
        <div className="mt-2.5 px-0.5">
          <p className="text-[13px] text-neutral-800 leading-snug line-clamp-1 font-medium">{movie.title}</p>
          <p className="text-[11px] font-mono text-neutral-400 mt-0.5 tracking-wider">{movie.year}</p>
        </div>
      </Link>
    </motion.div>
  );
}