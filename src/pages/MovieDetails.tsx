// src/pages/MovieDetails.tsx (STRIP MODE SOM DEFAULT)
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMG_FULL_URL = "https://image.tmdb.org/t/p/w1280"; 

const CONTAINER_WIDTH_VW = 55;
const MAX_IMAGES = 5; 

// --- TYPEDEFINITIONER ---
type TmdbData = {
  backdrop_path: string | null;
  title: string;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  tagline: string;
  overview: string;
};

type TmdbImages = {
  backdrops: { file_path: string }[];
  posters: { file_path: string }[];
  stills: { file_path: string }[];
};

const DUMMY_MOVIE: TmdbData = {
  title: "HARAKIRI", 
  release_date: "1962-09-16",
  runtime: 135,
  genres: [
    { id: 1, name: "ACTION" },
    { id: 2, name: "DRAMA" },
    { id: 3, name: "HISTORY" },
  ],
  tagline: "The story of an honorable man's final act.",
  overview:
    "A ronin arrives at a feudal lord's home, requesting an honorable place to commit seppuku (ritual suicide). The lord, skeptical of the sincerity of these pleas, attempts to persuade the ronin to leave. The two men then engage in a powerful clash of ideologies and honor.",
  backdrop_path: null,
};


// --- HUVUDKOMPONENT ---
export default function MovieDetails() {
  const { imdbID = "" } = useParams();

  const [movie, setMovie] = useState<TmdbData | null>(DUMMY_MOVIE);
  const [stills, setStills] = useState<TmdbImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // FIX: Sätt 'strip' som default view
  const [viewMode, setViewMode] = useState<'info' | 'strip'>('strip');

  const [imdbRating] = useState("8.7 / 10"); 
  const [director] = useState("Masaki Kobayashi"); 
  const [castList] = useState<string[]>(["Tatsuya Nakadai", "Akira Ishihama", "Shima Iwashita"]); 
  
  useEffect(() => {
    // Lås body scroll för app-känsla
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    const tmdbKey = import.meta.env.VITE_TMDB_KEY;

    (async () => {
      setLoading(true);
      if (!tmdbKey) setError("TMDB API-nyckel saknas.");
      else setError(null);

      try {
        const tmdbRes = await fetch(
          `${TMDB_BASE_URL}/movie/${imdbID}?api_key=${tmdbKey}`,
          { signal: ac.signal }
        );

        if (tmdbRes.ok) {
          const data = await tmdbRes.json();
          setMovie((prev) => ({
            ...prev!,
            title: data.title || DUMMY_MOVIE.title,
            release_date: data.release_date || DUMMY_MOVIE.release_date,
            runtime: data.runtime || DUMMY_MOVIE.runtime,
            genres: data.genres || DUMMY_MOVIE.genres,
            tagline: data.tagline || DUMMY_MOVIE.tagline,
            overview: data.overview || DUMMY_MOVIE.overview,
            backdrop_path: data.backdrop_path,
          }));
        }

        const imagesRes = await fetch(
          `${TMDB_BASE_URL}/movie/${imdbID}/images?api_key=${tmdbKey}`,
          { signal: ac.signal }
        );

        if (imagesRes.ok) {
          const imgData = await imagesRes.json();
          setStills({
            backdrops: imgData.backdrops.slice(0, 20),
            posters: imgData.posters.slice(0, 20),
            stills: imgData.stills || [],
          });
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError("Nätverksfel.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [imdbID]);

  const allImages = (stills?.backdrops || []).slice(0, MAX_IMAGES);
  const year = movie?.release_date?.split("-")[0] || "N/A";
  
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'info' ? 'strip' : 'info');
  };

  if (loading) return <div className="fixed inset-0 bg-[#f5f3f0]" />;
  if (!movie) return <div className="fixed inset-0 bg-[#f5f3f0]" />;

  return (
    <div className="fixed inset-0 bg-[#f5f3f0] font-sans text-black overflow-hidden overscroll-none">
      
        {error && (
            <div className="fixed top-0 left-0 right-0 z-50 bg-red-900/90 text-amber-50 p-2 text-center text-xs font-mono uppercase tracking-wider backdrop-blur-sm">
                {error}
            </div>
        )}

        <Link
            to="/"
            className="fixed top-8 left-8 z-50 text-neutral-700 hover:text-neutral-900 transition-colors text-sm"
        >
            Back
        </Link>

        <button 
            onClick={toggleViewMode}
            className="fixed top-8 right-8 z-50 text-neutral-500 hover:text-black transition-colors text-xs font-mono uppercase tracking-widest z-[60] cursor-pointer"
        >
            {/* FIX: Uppdaterad logik för knapptext */}
            {viewMode === 'strip' ? 'View Info' : 'Back to Gallery'}
        </button>

        <AnimatePresence mode="wait">
            {viewMode === 'info' ? (
                // INFO VIEW
                <motion.div 
                    key="info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                >
                    <InfoView 
                        movie={movie}
                        year={year}
                        imdbRating={imdbRating}
                        director={director}
                        castList={castList}
                        heroImage={allImages.length > 0 ? allImages[0].file_path : null}
                    />
                </motion.div>
            ) : (
                // STRIP VIEW (Nu Default)
                <motion.div 
                    key="strip"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full h-full"
                >
                    <HorizontalScrollStrip 
                        images={allImages} 
                        movie={movie} 
                        year={year} 
                    />
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}

// --- KOMPONENT: InfoView ---
function InfoView({ 
    movie, 
    year, 
    imdbRating, 
    director, 
    castList, 
    heroImage 
}: { 
    movie: TmdbData, 
    year: string, 
    imdbRating: string, 
    director: string, 
    castList: string[], 
    heroImage: string | null 
}) {
    return (
        <div className="w-full h-full flex flex-col md:flex-row">
            {/* VÄNSTER: Informativ Text */}
            <div className="w-full md:w-[60%] h-full p-12 lg:pl-20 lg:pr-16 flex flex-col justify-center overflow-y-auto no-scrollbar">
                <div className="max-w-2xl">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="px-2 py-1 bg-neutral-200 text-[10px] font-bold tracking-widest rounded-sm text-neutral-600">
                                MOVIE
                            </span>
                            <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.15em]">
                                IMDB: <span className="text-neutral-900 font-semibold">{imdbRating}</span>
                            </span>
                        </div>
                        
                        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.9] mb-2 text-neutral-900 tracking-tight">
                            {movie.title}
                        </h1>
                        <div className="text-3xl md:text-4xl text-neutral-400 font-light">
                            ({year})
                        </div>
                    </div>

                    {/* Synopsis */}
                    <div className="mb-10">
                        {movie.tagline && (
                            <p className="text-lg font-medium text-neutral-800 italic mb-4 border-l-2 border-neutral-300 pl-4">
                                "{movie.tagline}"
                            </p>
                        )}
                        <p className="text-base text-neutral-600 leading-relaxed">
                            {movie.overview}
                        </p>
                    </div>

                    {/* Detaljerat Rutnät */}
                    <div className="grid grid-cols-2 gap-y-8 gap-x-12 border-t border-neutral-200 pt-8">
                        <div>
                            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Director</h3>
                            <p className="text-sm font-medium text-neutral-800">{director}</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Runtime</h3>
                            <p className="text-sm font-medium text-neutral-800">{movie.runtime} MIN</p>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Cast</h3>
                            <ul className="text-sm font-medium text-neutral-800 space-y-1">
                                {castList.map(c => <li key={c}>{c}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                                {movie.genres.map(g => (
                                    <span key={g.id} className="text-xs border border-neutral-300 px-2 py-1 rounded-full text-neutral-600">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* HÖGER: Hero Bild */}
            <div className="hidden md:block w-[40%] h-full relative bg-black overflow-hidden">
                {heroImage ? (
                    <motion.div 
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="w-full h-full"
                    >
                        <img 
                            src={`${IMG_FULL_URL}${heroImage}`} 
                            alt="Movie Cover" 
                            className="w-full h-full object-cover opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-black/20 to-transparent mix-blend-multiply" />
                    </motion.div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-500">
                        No Image
                    </div>
                )}
            </div>
        </div>
    );
}
function HorizontalScrollStrip({ images, movie, year }: { images: { file_path: string }[], movie: TmdbData | null, year: string }) {
    const x = useMotionValue(0);
    const smoothX = useSpring(x, { stiffness: 200, damping: 40, mass: 0.5 });
    const contentRef = useRef<HTMLDivElement>(null);

    const [constraints, setConstraints] = useState({ min: 0, max: 0 });

    // --- FIX: Track image loading ---
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const totalImages = images.length;
    const loadedRef = useRef(0);

    const handleImageLoad = () => {
        loadedRef.current += 1;
        if (loadedRef.current === totalImages) {
            setImagesLoaded(true);
        }
    };

    // --- FIX: Recalculate once images are fully loaded ---
    useLayoutEffect(() => {
        if (!imagesLoaded || !contentRef.current) return;

        const contentWidth = contentRef.current.scrollWidth;
        const viewportWidth = window.innerWidth;

        const maxScroll = -(contentWidth - viewportWidth + 100);

        setConstraints({ min: maxScroll, max: 0 });

        // Reset position if outside new boundaries
        const pos = x.get();
        if (pos < maxScroll) x.set(maxScroll);
        if (pos > 0) x.set(0);

    }, [imagesLoaded, images]);

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
        let newX = x.get() - delta * 1.5;

        if (newX > constraints.max) newX = constraints.max;
        if (newX < constraints.min) newX = constraints.min;

        x.set(newX);
    };

    return (
        <div 
            className="h-full w-full flex flex-col" 
            onWheel={handleWheel}
        >
            <div className="flex-shrink-0 w-full p-8 pt-12 text-center z-10 bg-[#f5f3f0]">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] text-black break-words">
                        {movie?.title} 
                    </h1>
                    <div className="text-xl md:text-3xl text-neutral-400 mt-3 font-light">
                        ({year})
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-6 font-mono uppercase tracking-widest animate-pulse">
                        Scroll / Drag
                    </p>
                </div>
            </div>

            <div className="flex-1 relative w-full overflow-hidden flex items-center">
                <motion.div 
                    ref={contentRef}
                    style={{ x: smoothX }} 
                    className="flex gap-4 md:gap-8 pl-[10vw] pr-[10vw] items-center h-full pb-24"
                >
                    {images.map((img, idx) => (
                        <div key={idx} className="relative flex-shrink-0 group">
                            <img 
                                src={`${IMG_FULL_URL}${img.file_path}`} 
                                alt={`Scene ${idx+1}`}
                                onLoad={handleImageLoad}  // <-- IMPORTANT FIX
                                className="h-[35vh] md:h-[45vh] w-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out shadow-xl rounded-sm"
                                draggable={false}
                            />
                            <div className="absolute -bottom-8 left-0 text-[10px] text-neutral-500 font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                Scene 0{idx + 1}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
