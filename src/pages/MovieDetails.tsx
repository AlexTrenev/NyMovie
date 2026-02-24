// src/pages/MovieDetails.tsx
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { getMovieDetail, IMG_W1280 } from "../lib/api";
import type { MovieDetail } from "../lib/api";

export default function MovieDetails() {
  const { imdbID = "" } = useParams();
  const [movie,   setMovie]   = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [panel,   setPanel]   = useState<"strip" | "info">("strip");

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  useEffect(() => {
    setLoading(true);
    getMovieDetail(imdbID)
      .then(data => setMovie(data))
      .finally(() => setLoading(false));
  }, [imdbID]);

  if (loading) return (
    <div className="fixed inset-0 bg-[#080808] flex items-center justify-center">
      <div className="text-white/20 text-xs font-mono tracking-[0.3em] uppercase animate-pulse">Loading</div>
    </div>
  );

  if (!movie) return (
    <div className="fixed inset-0 bg-[#080808] flex items-center justify-center">
      <div className="text-white/20 text-xs font-mono">Film not found.</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#080808] text-white overflow-hidden">

      {/* Nav */}
      <nav className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 pt-6">
        <Link to="/" className="text-[10px] font-mono tracking-[0.25em] uppercase text-white/30 hover:text-white/80 transition-colors">
          ← Index
        </Link>
        <div className="flex items-center gap-1 border border-white/15 rounded-full p-1">
          {(["strip", "info"] as const).map(v => (
            <button
              key={v} onClick={() => setPanel(v)}
              className={`px-3 py-1 rounded-full text-[9px] font-mono tracking-[0.2em] uppercase transition-all duration-200 ${panel === v ? "bg-white text-black" : "text-white/30 hover:text-white/60"}`}
            >
              {v === "strip" ? "Gallery" : "Info"}
            </button>
          ))}
        </div>
      </nav>

      {/* Views */}
      <AnimatePresence mode="wait">
        {panel === "strip" ? (
          <motion.div key="strip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="w-full h-full">
            <StripView movie={movie} />
          </motion.div>
        ) : (
          <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="w-full h-full">
            <InfoView movie={movie} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── STRIP VIEW ────────────────────────────────────────────────────────────────
function StripView({ movie }: { movie: MovieDetail }) {
  const x = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 180, damping: 38, mass: 0.6 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const minX = useRef(0);

  const [loadedCount, setLoadedCount] = useState(0);
  const allLoaded = movie.scenes.length > 0 && loadedCount >= movie.scenes.length;

  useLayoutEffect(() => {
    if (!allLoaded || !contentRef.current) return;
    minX.current = -(contentRef.current.scrollWidth - window.innerWidth + 80);
  }, [allLoaded]);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
    x.set(Math.max(minX.current, Math.min(0, x.get() - delta * 1.4)));
  };

  return (
    <div className="h-full w-full flex flex-col" onWheel={handleWheel}>
      {/* Title */}
      <div className="flex-shrink-0 pt-24 pb-6 px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="font-black uppercase leading-[0.88] tracking-[-0.03em]"
          style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)" }}
        >
          {movie.title}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="mt-3 flex items-center justify-center gap-4 text-white/30 text-xs font-mono tracking-widest"
        >
          <span>{movie.year}</span>
          {movie.runtime > 0 && <><span>·</span><span>{movie.runtime} MIN</span></>}
          {movie.genres[0] && <><span>·</span><span className="uppercase">{movie.genres[0].name}</span></>}
        </motion.div>
        {movie.scenes.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.8 }}
            className="mt-5 text-[9px] font-mono text-white uppercase tracking-[0.35em]">
            ← scroll / drag →
          </motion.p>
        )}
      </div>

      {/* Horizontal strip */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden flex items-center">
        {movie.scenes.length > 0 ? (
          <motion.div
            ref={contentRef} style={{ x: smoothX }}
            drag="x" dragConstraints={containerRef} dragElastic={0.05}
            className="flex gap-3 md:gap-5 pl-[8vw] pr-[8vw] items-center h-full pb-16 cursor-grab active:cursor-grabbing select-none"
          >
            {movie.scenes.map((sc, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 + 0.2 }}
                className="relative flex-shrink-0 group">
                <img
                  src={`${IMG_W1280}${sc.file_path}`} alt={`Scene ${i + 1}`}
                  onLoad={() => setLoadedCount(c => c + 1)} draggable={false}
                  className="h-[38vh] md:h-[50vh] w-auto object-cover rounded-sm shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-700 ease-out"
                />
                <span className="absolute bottom-2 right-3 text-[9px] font-mono text-white/0 group-hover:text-white/50 transition-colors tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="w-full flex items-center justify-center text-white/15 text-xs font-mono tracking-widest">NO IMAGES AVAILABLE</div>
        )}
      </div>
    </div>
  );
}

// ─── INFO VIEW ─────────────────────────────────────────────────────────────────
function InfoView({ movie }: { movie: MovieDetail }) {
  const heroImg = movie.scenes[0]?.file_path
    ? `${IMG_W1280}${movie.scenes[0].file_path}`
    : movie.backdrop_path
    ? `${IMG_W1280}${movie.backdrop_path}`
    : null;

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
      {/* Left: text */}
      <div className="w-full md:w-[55%] h-full overflow-y-auto px-8 md:px-14 lg:px-20 pt-24 pb-12 flex flex-col justify-center no-scrollbar">
        <div className="max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="font-black uppercase leading-[0.88] tracking-[-0.03em]"
            style={{ fontSize: "clamp(2.8rem, 6vw, 5.5rem)" }}
          >
            {movie.title}
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="mt-3 flex flex-wrap items-center gap-3 text-white/35 text-xs font-mono tracking-wider">
            <span>{movie.year}</span>
            {movie.runtime > 0 && <><span className="text-white/15">·</span><span>{movie.runtime} min</span></>}
          </motion.div>

          {movie.tagline && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
              className="mt-6 text-white/50 italic text-lg leading-snug border-l border-white/20 pl-4">
              {movie.tagline}
            </motion.p>
          )}

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-6 text-white/45 text-sm leading-relaxed">
            {movie.overview}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 gap-x-10 gap-y-7">
            <Field label="Director" value={movie.director} />
            <Field label="Runtime"  value={movie.runtime > 0 ? `${movie.runtime} min` : "—"} />
            <div>
              <Label>Cast</Label>
              <div className="flex flex-col gap-1">
                {movie.cast.length > 0
                  ? movie.cast.map(n => <span key={n} className="text-sm text-white/60">{n}</span>)
                  : <span className="text-sm text-white/30">—</span>}
              </div>
            </div>
            <div>
              <Label>Genres</Label>
              <div className="flex flex-wrap gap-1.5">
                {movie.genres.map(g => (
                  <span key={g.id} className="text-[10px] font-mono border border-white/20 text-white/50 px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right: image */}
      <div className="hidden md:block md:w-[45%] h-full relative overflow-hidden bg-black">
        {heroImg ? (
          <motion.img src={heroImg} alt="" initial={{ scale: 1.08, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }} className="w-full h-full object-cover opacity-70" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/10 text-xs font-mono">NO IMAGE</div>
        )}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#080808] to-transparent" />
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[9px] font-mono text-white/25 tracking-[0.25em] uppercase block mb-2">{children}</span>;
}
function Field({ label, value }: { label: string; value: string }) {
  return <div><Label>{label}</Label><span className="text-sm text-white/60">{value}</span></div>;
}