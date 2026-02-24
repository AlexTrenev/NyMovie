// src/pages/MovieDetails.tsx
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { getMovieDetail, IMG_W1280 } from "../lib/api";
import type { MovieDetail } from "../lib/api";
import Navbar from "../components/navbar";
import FilmCard from "../components/filmcard";

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
            {/* FilmCard fills the fixed container — pass h-full so the inner scroll works */}
            <FilmCard movie={movie} className="h-full" />
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