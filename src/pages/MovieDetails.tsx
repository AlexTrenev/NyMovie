// src/pages/MovieDetails.tsx
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { getMovieDetail, IMG_W1280 } from "../lib/api";
import type { MovieDetail } from "../lib/api";
import Navbar from "../components/navbar";

const SF: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};

export default function MovieDetails() {
  const { imdbID = "" } = useParams();
  const [movie,   setMovie]   = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [panel,   setPanel]   = useState<"info" | "strip">("info");

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  useEffect(() => {
    setLoading(true);
    getMovieDetail(imdbID).then(setMovie).finally(() => setLoading(false));
  }, [imdbID]);

  if (loading) return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <span className="text-neutral-300 text-xs tracking-[0.3em] uppercase animate-pulse" style={SF}>Loading</span>
    </div>
  );

  if (!movie) return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <span className="text-neutral-300 text-xs" style={SF}>Film not found.</span>
    </div>
  );

  return (
    <div className="fixed inset-0 overflow-hidden bg-white">

      <Navbar background="#ffffff" />

      {/* ── TOGGLE — Info first, then Gallery ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center rounded-lg overflow-hidden border border-neutral-200 bg-white">
        {(["info", "strip"] as const).map(v => (
          <button key={v} onClick={() => setPanel(v)}
            className="px-5 py-2 text-[12px] transition-all duration-200"
            style={{
              ...SF, fontWeight: 400, letterSpacing: "-0.01em",
              background: panel === v ? "#171717" : "transparent",
              color:      panel === v ? "#fff"    : "#a3a3a3",
            }}>
            {v === "info" ? "Info" : "Gallery"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {panel === "info" ? (
          <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full h-full">
            <InfoView movie={movie} />
          </motion.div>
        ) : (
          <motion.div key="strip" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full h-full">
            <StripView movie={movie} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── STRIP VIEW ───────────────────────────────────────────────────────────────
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
    <div className="h-full w-full flex flex-col bg-white" onWheel={handleWheel}>
      <div className="flex-shrink-0 pt-24 pb-6 px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-neutral-900 font-semibold leading-[0.9] tracking-[-0.03em]"
          style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}
        >
          {movie.title}
        </motion.h1>
        {movie.scenes.length > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.3 }}
            className="mt-5 text-[12px] text-neutral-800 uppercase tracking-[0.10em]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif" }}>
            Scroll
          </motion.p>
        )}
      </div>
      <div ref={containerRef} className="flex-1 relative overflow-hidden flex items-center">
        {movie.scenes.length > 0 ? (
          <motion.div
            ref={contentRef} style={{ x: smoothX }}
            drag="x" dragConstraints={containerRef} dragElastic={0.05}
            className="flex gap-3 md:gap-5 pl-[8vw] pr-[8vw] items-center h-full pb-20 cursor-grab active:cursor-grabbing select-none"
          >
            {movie.scenes.map((sc, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 + 0.2 }}
                className="relative flex-shrink-0 group">
                <img
                  src={`${IMG_W1280}${sc.file_path}`} alt=""
                  onLoad={() => setLoadedCount(c => c + 1)} draggable={false}
                  className="h-[38vh] md:h-[50vh] w-auto object-cover shadow-sm group-hover:shadow-md transition-shadow duration-500"
                />
                <span className="absolute bottom-2 right-3 text-[9px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="w-full flex items-center justify-center text-neutral-300 text-xs font-mono tracking-widest">NO IMAGES AVAILABLE</div>
        )}
      </div>
    </div>
  );
}

// ─── INFO VIEW ────────────────────────────────────────────────────────────────
function InfoView({ movie }: { movie: MovieDetail }) {
  const heroImg = movie.scenes[0]?.file_path
    ? `${IMG_W1280}${movie.scenes[0].file_path}`
    : movie.backdrop_path ? `${IMG_W1280}${movie.backdrop_path}` : null;

  const body: React.CSSProperties = { fontSize: 17, color: "#171717", lineHeight: 1.6 };

  return (
    <div className="w-full h-full flex overflow-hidden bg-white"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif" }}>

      {/* LEFT — image */}
      <div className="hidden md:flex md:w-[45%] h-full flex-shrink-0 flex-col pt-20 px-14 pb-24">
        {heroImg && (
          <motion.img src={heroImg} alt=""
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
            className="w-full object-cover"
            style={{ maxHeight: "55vh" }}
          />
        )}
      </div>

      {/* RIGHT — text */}
      <div className="w-full md:w-[55%] h-full overflow-y-auto px-10 md:px-14 pt-20 pb-24 no-scrollbar">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-neutral-900 leading-[1.05] tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 600,
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}>
            {movie.title} ({movie.year})
          </h1>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mt-5" style={{ ...body, textAlign: "justify" }}>
          {movie.overview}
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          className="mt-6">
          <div className="flex gap-16 flex-wrap">
            <div>{movie.runtime > 0 && <p style={body}>{movie.runtime} min</p>}</div>
            <div>{movie.director && <p style={body}>{movie.director}</p>}</div>
            <div>{movie.imdbRating && <p style={body}>★ {movie.imdbRating}</p>}</div>
          </div>
          {movie.genres.length > 0 && (
            <p style={{ ...body, marginTop: "0.75rem" }}>
              {movie.genres.map(g => g.name).join("; ")}
            </p>
          )}
        </motion.div>

        {movie.cast.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            className="mt-6" style={{ columns: 2, columnGap: "2.5rem" }}>
            {movie.cast.map(name => (
              <p key={name} style={body} className="break-inside-avoid">{name}</p>
            ))}
          </motion.div>
        )}

        {movie.tagline && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="mt-6 italic" style={{ ...body, color: "#343434" }}>
            "{movie.tagline}"
          </motion.p>
        )}
      </div>
    </div>
  );
}