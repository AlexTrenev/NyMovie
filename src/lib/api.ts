// src/lib/api.ts
// Central API layer — OMDB + TMDB

const TMDB = "https://api.themoviedb.org/3";
const OMDB = "https://www.omdbapi.com/";

export const IMG_W500  = "https://image.tmdb.org/t/p/w500";
export const IMG_W1280 = "https://image.tmdb.org/t/p/w1280";

function tmdbKey() { return (import.meta as any).env.VITE_TMDB_KEY as string; }
function omdbKey() { return (import.meta as any).env.VITE_OMDB_KEY as string; }

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type SearchResult = {
  id: string;          // imdbID (from OMDB) or TMDB numeric id as string
  title: string;
  year: string;
  poster: string;
  imdbRating?: string;
};

export type MovieDetail = {
  title: string;
  year: string;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  overview: string;
  backdrop_path: string | null;
  poster_path: string | null;
  director: string;
  cast: string[];
  scenes: { file_path: string }[];
};

// ─── OMDB ─────────────────────────────────────────────────────────────────────

/** Search movies by title (OMDB). Returns up to 4 results with posters. */
export async function searchMovies(query: string): Promise<SearchResult[]> {
  const res  = await fetch(`${OMDB}?apikey=${omdbKey()}&s=${encodeURIComponent(query)}&type=movie`);
  const data = await res.json();
  if (data.Response !== "True") return [];
  return (data.Search as any[]).slice(0, 4)
    .filter((m: any) => m.Poster && m.Poster !== "N/A")
    .map((m: any) => ({
      id: m.imdbID, title: m.Title, year: m.Year, poster: m.Poster,
    }));
}

// ─── TMDB ─────────────────────────────────────────────────────────────────────

/** Discover movies via TMDB filters. Returns up to 4 results enriched with OMDB ratings. */
export async function discoverMovies(params: Record<string, string>): Promise<SearchResult[]> {
  const key = tmdbKey();
  const q   = new URLSearchParams({ api_key: key, language: "en-US", include_adult: "false", ...params }).toString();
  const res  = await fetch(`${TMDB}/discover/movie?${q}`);
  const data = await res.json();
  const top4 = (data.results || []).slice(0, 4);

  return Promise.all(
    top4.map(async (m: any): Promise<SearchResult> => {
      const base: SearchResult = {
        id: String(m.id), title: m.title,
        year: m.release_date?.split("-")[0] || "—",
        poster: m.poster_path ? `${IMG_W500}${m.poster_path}` : "",
      };
      if (!m.poster_path) return base;
      try {
        const idRes  = await fetch(`${TMDB}/movie/${m.id}/external_ids?api_key=${key}`);
        const idData = await idRes.json();
        if (idData.imdb_id) {
          const omRes  = await fetch(`${OMDB}?apikey=${omdbKey()}&i=${idData.imdb_id}`);
          const omData = await omRes.json();
          if (omData.imdbRating && omData.imdbRating !== "N/A") {
            base.imdbRating = omData.imdbRating;
          }
        }
      } catch {}
      return base;
    })
  );
}

/** Full movie detail from TMDB (details + images + credits). */
export async function getMovieDetail(tmdbOrImdbId: string): Promise<MovieDetail | null> {
  const key = tmdbKey();
  const sig = new AbortController().signal;
  try {
    const [detailRes, imagesRes, creditsRes] = await Promise.all([
      fetch(`${TMDB}/movie/${tmdbOrImdbId}?api_key=${key}`, { signal: sig }),
      fetch(`${TMDB}/movie/${tmdbOrImdbId}/images?api_key=${key}`, { signal: sig }),
      fetch(`${TMDB}/movie/${tmdbOrImdbId}/credits?api_key=${key}`, { signal: sig }),
    ]);

    if (!detailRes.ok) return null;

    const [d, img, cr] = await Promise.all([
      detailRes.json(), imagesRes.json(), creditsRes.json(),
    ]);

    const director = (cr.crew || []).find((p: any) => p.job === "Director")?.name || "—";
    const cast     = (cr.cast || []).slice(0, 4).map((p: any) => p.name as string);
    const scenes   = (img.backdrops || []).slice(0, 6);

    return {
      title:        d.title || "—",
      year:         d.release_date?.split("-")[0] || "—",
      runtime:      d.runtime || 0,
      genres:       d.genres || [],
      tagline:      d.tagline || "",
      overview:     d.overview || "",
      backdrop_path: d.backdrop_path,
      poster_path:  d.poster_path,
      director,
      cast,
      scenes,
    };
  } catch {
    return null;
  }
}