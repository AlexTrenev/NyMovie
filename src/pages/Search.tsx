// src/pages/Search.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies } from "../lib/api";
import type { SearchResult } from "../lib/api";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setErr(null);
    const res = await searchMovies(query).catch(() => []);
    setResults(res);
    if (!res.length) setErr(`Nothing found for "${query}"`);
    setLoading(false);
  };

  const handleSelect = (movieId: string) => {
    navigate(`/movie/${movieId}`);
  };

  return (
    <div className="fixed inset-0 bg-[#f8f7f4] flex flex-col items-center justify-center px-8">
      {/* Search Bar */}
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSearch} className="flex flex-col gap-8">
          <div className="relative">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies…"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
              className="w-full bg-transparent border-b-2 border-neutral-300 focus:border-neutral-900 pb-3 text-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="text-sm font-mono tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors self-start"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {err && <p className="mt-8 text-sm text-red-500 italic">{err}</p>}
        
        {loading && (
          <div className="mt-12 space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-neutral-200 rounded animate-pulse" />
            ))}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="mt-12 space-y-3 max-h-96 overflow-y-auto">
            {results.map((movie) => (
              <button
                key={movie.id}
                onClick={() => handleSelect(movie.id)}
                className="w-full text-left p-4 rounded border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 transition-colors"
              >
                <div className="text-base font-semibold text-neutral-900">{movie.title}</div>
                <div className="text-xs text-neutral-500">{movie.year}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-8 text-xs font-mono tracking-[0.2em] uppercase text-neutral-400 hover:text-neutral-900 transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}
