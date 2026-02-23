export type SearchMovie = {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
};

export async function searchMovies(title: string, signal?: AbortSignal): Promise<SearchMovie[]> {
  const key = import.meta.env.VITE_OMDB_KEY;
  if (!key) throw new Error("Saknar VITE_OMDB_KEY i .env");
  const url = `https://www.omdbapi.com/?apikey=${key}&s=${encodeURIComponent(title.trim())}&type=movie`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Kunde inte kontakta OMDb");
  const data = await res.json();
  if (data?.Response === "True" && Array.isArray(data.Search)) return data.Search as SearchMovie[];
  return [];
}

export type MovieFull = {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings?: { Source: string; Value: string }[];
  Metascore?: string;
  imdbRating?: string;
  imdbVotes?: string;
  imdbID: string;
  Type: string;
};

export async function getMovieById(imdbID: string, signal?: AbortSignal): Promise<MovieFull | null> {
  const key = import.meta.env.VITE_OMDB_KEY;
  if (!key) throw new Error("Saknar VITE_OMDB_KEY i .env");
  const url = `https://www.omdbapi.com/?apikey=${key}&i=${encodeURIComponent(imdbID)}&plot=full`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Kunde inte kontakta OMDb");
  const data = await res.json();
  if (data?.Response === "True") return data as MovieFull;
  return null;
}
