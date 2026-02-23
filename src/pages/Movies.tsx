// src/pages/Movies.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import { motion, AnimatePresence } from "framer-motion";

// --- TYPER & KONFIGURATION ---
type DisplayMovie = {
  id: number | string; 
  title: string;
  poster_path: string;
  release_date: string;
  imdbRating?: string; 
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const OMDb_BASE_URL = "https://www.omdbapi.com/";
const IMG_BASE_URL = "https://image.tmdb.org/t/p/w500"; 

const MotionLink = motion(Link);

// --- ANIMATION-VARIANTER ---
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1, 
      staggerChildren: 0.1 
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const fadeVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

// Alternativ för filter
const eraOptions = [
  { label: "Classic (< 1970)", value: "classic" },
  { label: "70s & 80s (70-89)", value: "70s_80s" },
  { label: "90s & 00s (90-09)", value: "90s_00s" },
  { label: "Modern (2010+)", value: "modern" },
];

const moodOptions = [
  { label: "Feelgood", value: "feelgood" },
  { label: "Heartfelt", value: "heartfelt" },
  { label: "Dark", value: "dark" },
  { label: "Suspense", value: "suspense" },
  { label: "Intense", value: "intense" },
  { label: "Thoughtful", value: "thoughtful" },
  { label: "Epic", value: "epic" },
  { label: "Sci-Fi", value: "sci-fi" },
];

const durationOptions = [
  { label: "Short (< 90min)", value: "kort" },
  { label: "Medium (90-120min)", value: "mellan" },
  { label: "Long (> 120min)", value: "lång" },
];


// --- HELPER: Berikar TMDB-filmer med IMDb-betyg (för discovery) ---
async function enrichMoviesWithImdb(movies: any[]): Promise<DisplayMovie[]> {
  const tmdbKey = import.meta.env.VITE_TMDB_KEY;
  const omdbKey = import.meta.env.VITE_OMDB_KEY;
  
  if (!tmdbKey || !omdbKey) {
      return movies.map(m => ({
          id: m.id, title: m.title, poster_path: m.poster_path, release_date: m.release_date || "N/A"
      }));
  }

  const enriched = await Promise.all(
    movies.map(async (movie) => {
      try {
        const idRes = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/external_ids?api_key=${tmdbKey}`);
        const idData = await idRes.json();
        
        let imdbRating: string | undefined;
        if (idData.imdb_id) {
          const omdbRes = await fetch(`${OMDb_BASE_URL}?apikey=${omdbKey}&i=${idData.imdb_id}`);
          const omdbData = await omdbRes.json();
          imdbRating = omdbData.imdbRating !== "N/A" ? omdbData.imdbRating : undefined;
        }

        return { 
          id: movie.id,
          title: movie.title, 
          poster_path: movie.poster_path, 
          release_date: movie.release_date || "N/A", 
          imdbRating,
        };
      } catch (e) {
        return { 
          id: movie.id,
          title: movie.title, 
          poster_path: movie.poster_path, 
          release_date: movie.release_date || "N/A", 
        };
      }
    })
  );
  return enriched.filter(m => m.poster_path); 
}

// Helper function for TMDB
async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const key = import.meta.env.VITE_TMDB_KEY;
  if (!key) {
    console.error("Missing VITE_TMDB_KEY in .env");
    return { results: [] };
  }
  const query = new URLSearchParams({ api_key: key, ...params }).toString();
  const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${query}`);
  return res.json();
}

// {NY} - Stegvis Väljare-komponent
// ---------------------------------
type ChoiceOption = { label: string; value: string };

const choiceContainerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

const choiceVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  hover: { 
    scale: 1.03, 
    backgroundColor: '#000000', 
    color: '#f5f3f0',
    transition: { type: "spring" as const, stiffness: 400, damping: 15 }
  },
  tap: { scale: 0.98 }
};

function ChoiceSelector({ title, options, onSelect }: {
  title: string;
  options: ChoiceOption[];
  onSelect: (value: string) => void;
}) {
  return (
    <motion.div
      key={title} // Viktig för AnimatePresence
      variants={choiceContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full"
    >
      <h3 className="text-base font-mono uppercase tracking-widest text-neutral-500 mb-6 text-center">
        {title}
      </h3>
      {/* Använder grid för en snygg, responsiv uppradning */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {options.map(opt => (
          <motion.button
            key={opt.value}
            variants={choiceVariants}
            whileHover="hover"
            whileTap="tap"
            onClick={() => onSelect(opt.value)}
            className="bg-transparent border border-neutral-300 rounded-sm py-4 px-4 text-sm font-bold uppercase text-black cursor-pointer shadow-sm text-center"
          >
            {opt.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
// ---------------------------------
// {SLUT PÅ NY KOMPONENT}


export default function Movies() {
  // State
  const [movies, setMovies] = useState<DisplayMovie[]>([]); 
  const [loading, setLoading] = useState(false); 
  const [searchQ, setSearchQ] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  // Filter State
  const [era, setEra] =useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null); 
  
  const moviePlaceholders = [
    "/placeholder1.jpg", "/placeholder2.jpg", "/placeholder3.jpg", "/placeholder4.jpg"
  ];
  
  // Funktioner för länk/poster-URL
  const getLinkID = (movie: DisplayMovie) => movie.id;
  const getPosterUrl = (movie: DisplayMovie) => 
      movie.poster_path?.startsWith('http') ? movie.poster_path : IMG_BASE_URL + movie.poster_path;

  // Alla 3 filter måste vara valda
  const allFiltersSelected = era !== null && mood !== null && duration !== null;
  const hasSearched = searchQ.trim() !== "" || searchError !== null;


  // Återställningsfunktion (rensar state)
  const clearFiltersAndMovies = () => {
    setLoading(false);
    setSearchQ(""); 
    setSearchError(null); 
    setEra(null); setMood(null); setDuration(null);
    setMovies([]); // Rensa filmlistan
  };
  
  // Timer för Hero-bakgrunden
  useEffect(() => {
    const interval = setInterval(() => {
        setCurrentHeroImage(prev => (prev + 1) % moviePlaceholders.length);
    }, 8000); 
    return () => clearInterval(interval);
  }, []);

  // 2. Filter Logic (TMDB + Kombinerad Filtrering)
  useEffect(() => {
    if (allFiltersSelected) {
      
      const runDiscovery = async () => {
        setLoading(true);
        setSearchQ(""); setSearchError(null); // Rensa sökning när man filtrerar

        const params: Record<string, string> = {
          sort_by: "vote_average.desc",
          "vote_count.gte": "1000",
          page: "1",
          language: "en-US",
          include_adult: "false",
        };

        if (era === "classic") { params["primary_release_date.lte"] = "1969-12-31"; }
        else if (era === "70s_80s") { params["primary_release_date.gte"] = "1970-01-01"; params["primary_release_date.lte"] = "1989-12-31"; }
        else if (era === "90s_00s") { params["primary_release_date.gte"] = "1990-01-01"; params["primary_release_date.lte"] = "2009-12-31"; }
        else if (era === "modern") { params["primary_release_date.gte"] = "2010-01-01"; }

        // {ÄNDRAD} - Justerad logik för att tillåta filmer som "Harakiri"
        // Genrer: 35(Com), 10751(Fam), 16(Anim), 18(Dra), 10749(Rom), 27(Hor), 80(Cri), 53(Thr), 9648(Mys), 28(Act), 10752(War), 36(His), 99(Doc), 12(Adv), 14(Fan), 878(Sci)
        const moodRules: Record<string, { include: string, exclude?: string }> = {
          "feelgood":   { include: "35|10751|16", exclude: "27|80|53|10752|9648" }, // Komedi/Fam/Anim, MEN INTE Mörka/Intensiva genrer
          "heartfelt":  { include: "18|10749", exclude: "27|53|10752" }, // Drama/Romantik, MEN INTE Skräck/Thriller/Krig
          "dark":       { include: "27|80" }, // Skräck ELLER Kriminal
          "suspense":   { include: "53|9648" }, // Thriller ELLER Mysterium
          "intense":    { include: "28|10752" }, // Action ELLER Krig
          "thoughtful": { include: "18|36|99", exclude: "10749|53" }, // Drama/Historia/Doku, MEN INTE Romantik/Thriller
          "epic":       { include: "12|14" }, // Äventyr ELLER Fantasy
          "sci-fi":     { include: "878" }, // Endast Sci-Fi
        };
        
        if (mood && moodRules[mood]) {
          params["with_genres"] = moodRules[mood].include;
          if (moodRules[mood].exclude) {
            params["without_genres"] = moodRules[mood].exclude;
          }
        }
        // {SLUT PÅ ÄNDRING}
        
        if (duration === "kort") { params["with_runtime.lte"] = "90"; }
        else if (duration === "mellan") { params["with_runtime.gte"] = "90"; params["with_runtime.lte"] = "120"; }
        else if (duration === "lång") { params["with_runtime.gte"] = "120"; }
        
        try {
          const data = await fetchTMDB("/discover/movie", params);
          if (data.results && data.results.length > 0) {
            const top4 = data.results.slice(0, 4);
            const withImdb = await enrichMoviesWithImdb(top4); 
            setMovies(withImdb);
          } else {
            setMovies([]); // Inga resultat
          }
        } catch (e) { console.error(e); setMovies([]); }
        finally { setLoading(false); }
      };

      const t = setTimeout(runDiscovery, 100);
      return () => clearTimeout(t);

    } else {
      if (!hasSearched) {
        setMovies([]);
        setSearchError(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [era, mood, duration]); 

  // 3. Search Logic (SNABB OMDb-sökning)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    
    setLoading(true);
    setEra(null); setMood(null); setDuration(null); 
    
    const omdbKey = import.meta.env.VITE_OMDB_KEY;

    try {
        const res = await fetch(`${OMDb_BASE_URL}?apikey=${omdbKey}&s=${searchQ}`);
        const data = await res.json();
        
        if (data.Response === "True" && data.Search) {
            const mappedResults: DisplayMovie[] = data.Search.slice(0, 4).map((m: any) => ({
                id: m.imdbID, 
                title: m.Title,
                poster_path: m.Poster === "N/A" ? "" : m.Poster, 
                release_date: m.Year, 
            }));
            setMovies(mappedResults.filter(m => m.poster_path));
            setSearchError(null);
        } else {
            setMovies([]);
            setSearchError(`No results found for "${searchQ}"`);
        }
    } catch (e) { 
        console.error("OMDb Search Error:", e);
        setMovies([]);
        setSearchError("Search failed due to an error.");
    } finally { 
        setLoading(false); 
    }
  };

  // Reset
  const resetAll = () => {
    clearFiltersAndMovies(); 
  };
  
  const currentTitle = allFiltersSelected ? 
                       `Your Curator Match` :
                       searchQ ? `Search Results for "${searchQ}"` : ""; 

  // --- RENDERING ---
  return (
    <div className="min-h-dvh bg-[#f5f3f0] text-black font-sans overflow-x-hidden">
      
      <section className="min-h-dvh relative bg-[#f5f3f0] flex flex-col">
        
        <div 
            className="absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out" 
            style={{ 
                backgroundImage: `url(${moviePlaceholders[currentHeroImage]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'grayscale(80%) blur(2px) brightness(0.95)',
                transform: 'scale(1.02)'
            }}
        />
        
        <div className="relative z-10 w-full flex flex-col">

            {/* Topp-innehåll (Marquee, Subtitle, Filter, Resultat) */}
            <div>
                <div className="w-full overflow-hidden">
                    <div className="flex whitespace-nowrap animate-marquee">
                        <span className="text-8xl md:text-[14rem] font-bold tracking-tighter leading-[0.8] text-black">
                            The Movie Index&nbsp;—&nbsp;
                        </span>
                        <span className="text-8xl md:text-[14rem] font-bold tracking-tighter leading-[0.8] text-black">
                            The Movie Index&nbsp;—&nbsp;
                        </span>
                        <span className="text-8xl md:text-[14rem] font-bold tracking-tighter leading-[0.8] text-black">
                            The Movie Index&nbsp;—&nbsp;
                        </span>
                        <span className="text-8xl md:text-[14rem] font-bold tracking-tighter leading-[0.8] text-black">
                            The Movie Index&nbsp;—&nbsp;
                        </span>
                    </div>
                </div>
                
                <div className="w-full px-6 md:px-12 lg:px-20 mt-4 md:mt-2 pb-20">
                    <p className="text-xl md:text-2xl font-light max-w-2xl text-neutral-600 drop-shadow">
                        The minimalist digital library of cinematic history. Powered with OMDB & TMDB.
                    </p>

                    {/* Filtersektionen */}
                    <section id="filter-section" className="w-full max-w-7xl mt-10 md:mt-16 mx-auto">
                      
                      <h2 className="text-5xl md:text-6xl font-bold leading-[0.9] tracking-tight text-black mb-10">
                        What to watch
                      </h2>

                      {/* Rad 1: Sök & Reset */}
                      <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                          <form onSubmit={handleSearch} className="relative flex-1 w-full">
                              <input 
                                type="text" 
                                placeholder="SEARCH BY TITLE (E.G. 'THE MATRIX')" 
                                value={searchQ}
                                onChange={e => setSearchQ(e.target.value)}
                                className="w-full bg-transparent border-b-2 border-neutral-300 pb-2 text-xl font-medium text-black placeholder-neutral-500/80 focus:outline-none focus:border-black uppercase transition-colors tracking-wider"
                              />
                              <button type="submit" className="absolute right-0 bottom-2 text-neutral-500 hover:text-black font-bold text-2xl">→</button>
                          </form>
                          <button 
                            onClick={resetAll} 
                            className="text-xs font-mono uppercase tracking-widest text-neutral-500 hover:text-black text-left md:text-right flex-shrink-0 flex items-center md:justify-end gap-2 group transition-colors"
                          >
                            <span className={`block w-2 h-2 rounded-full transition-colors ${allFiltersSelected || searchQ ? 'bg-black' : 'bg-neutral-300'}`}></span>
                            Reset / Clear
                          </button>
                      </div>

                      {/* Sektion för att visa valda filter och tillåta "gå tillbaka" */}
                      <div className="flex flex-wrap gap-2 sm:gap-4 mt-10 min-h-[2.5rem]">
                        {era && (
                          <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => { setEra(null); setMood(null); setDuration(null); }} 
                            className="bg-black text-white py-2 px-4 rounded-full text-xs font-mono uppercase tracking-widest hover:bg-neutral-700 transition-colors"
                          >
                            Era: {eraOptions.find(o => o.value === era)?.label} <span className="ml-2 opacity-50">X</span>
                          </motion.button>
                        )}
                        {mood && (
                          <motion.button
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => { setMood(null); setDuration(null); }} 
                            className="bg-black text-white py-2 px-4 rounded-full text-xs font-mono uppercase tracking-widest hover:bg-neutral-700 transition-colors"
                          >
                            Mood: {moodOptions.find(o => o.value === mood)?.label} <span className="ml-2 opacity-50">X</span>
                          </motion.button> 
                        )}
                      </div>

                      {/* Stegvis "Choice"-väljare */}
                      <div className="w-full mt-4 md:mt-8 min-h-[12rem] relative">
                        <AnimatePresence mode="wait">
                          {/* Steg 1: Välj Era */}
                          {!era && (
                            <ChoiceSelector
                              key="era"
                              title="Step 1: Pick an Era"
                              options={eraOptions}
                              onSelect={setEra}
                            />
                          )}

                          {/* Steg 2: Välj Mood */}
                          {era && !mood && (
                            <ChoiceSelector
                              key="mood"
                              title="Step 2: Pick a Mood"
                              options={moodOptions}
                              onSelect={setMood}
                            />
                          )}

                          {/* Steg 3: Välj Duration */}
                          {era && mood && !duration && (
                            <ChoiceSelector
                              key="duration"
                              title="Step 3: Pick a Duration"
                              options={durationOptions}
                              onSelect={setDuration}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                      {searchError && <p className="text-red-500 text-xs mt-4 text-center font-mono">{searchError}</p>}
                    </section>

                    {/* Rubrik visas bara om den har innehåll */}
                    {currentTitle && (
                      <div className="max-w-7xl mx-auto mt-10 md:mt-16">
                          <h3 className="text-4xl md:text-5xl font-bold leading-[0.9] tracking-tight text-black">
                              {currentTitle}
                          </h3>
                      </div>
                    )}
                    
                    <div className="w-full max-w-7xl mx-auto mt-10">
                      
                      <AnimatePresence mode="wait">
                        
                        {/* 1. Loading State */}
                        {loading && (
                          <motion.div 
                            key="loading" 
                            variants={fadeVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                          >
                            {Array.from({length:4}).map((_, i) => (
                              <div key={i} className="bg-neutral-200 animate-pulse aspect-[2/3] border border-neutral-300" />
                            ))}
                          </motion.div>
                        )}

                        {/* 2. Results State */}
                        {!loading && movies.length > 0 && (
                          <motion.div 
                            key="results"
                            variants={gridVariants} 
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="grid grid-cols-2 md:grid-cols-4 gap-4"
                          >
                            {movies.map((movie) => (
                              <MotionLink 
                                variants={cardVariants} 
                                to={`/movie/${getLinkID(movie)}`} 
                                key={getLinkID(movie)} 
                                className="group relative bg-neutral-200 aspect-[2/3] overflow-hidden block border border-neutral-300 transition-colors hover:border-black"
                              >
                                {/* Poster */}
                                {movie.poster_path && movie.poster_path !== "N/A" ? (
                                  <motion.img 
                                    src={getPosterUrl(movie)} 
                                    alt={movie.title} 
                                    className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-neutral-400 font-black text-4xl bg-neutral-200">?</div>
                                )}
                                
                                {/* Info Overlay */}
                                <div className="absolute bottom-0 inset-x-0 p-2 bg-[#f5f3f0]/80 backdrop-blur-[2px] border-t border-neutral-400/50">
                                  <h2 className="text-sm font-medium leading-tight uppercase text-black truncate">
                                    {movie.title}
                                  </h2>
                                  <div className="flex justify-between items-center mt-1">
                                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-600">
                                        {movie.release_date?.split("-")[0]}
                                      </span>
                                      {movie.imdbRating && (
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-white bg-black px-1 font-bold">
                                            {movie.imdbRating}
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </MotionLink>
                            ))}
                          </motion.div>
                        )}

                        {/* 3. Empty State (visas bara om man sökt/filtrerat fullständigt) */}
                        {!loading && movies.length === 0 && (allFiltersSelected || searchError) && (
                          <motion.div
                            key="no-matches"
                            variants={fadeVariant}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="flex items-center justify-center bg-neutral-200/50 text-neutral-500 font-mono uppercase tracking-widest min-h-[50vh] rounded-none border border-neutral-300"
                          >
                            NO MATCHES FOUND
                          </motion.div>
                        )}
                      
                      </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-6 text-sm font-mono tracking-widest text-neutral-500 flex justify-between items-end mt-auto">
                <span>SCROLL DOWN</span>
                <div className="h-10 w-px bg-neutral-400 animate-pulse hidden md:block" />
            </div>
        </div>
      </section>
    </div>
  );
}