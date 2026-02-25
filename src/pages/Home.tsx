import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { getMovieDetail, IMG_W1280 } from "../lib/api";
import type { MovieDetail } from "../lib/api";

const PICKS = [
  { id: "11220"  }, // Fallen Angels
  { id: "11423"  }, // Memories of Murder
  { id: "1018"    }, // Mullholland Drive
  { id: "39056"    }, // Ritual
  { id: "9428"     }, // Royal Tenenbaums
  { id: "4935" }, // Howl's Moving Castle
  { id: "120467"   }, // Grand Budapest Hotel
];

type Pick = { id: string; movie: MovieDetail | null };

const SF: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};
const DISPLAY: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
};

export default function Movies() {
  const [picks, setPicks] = useState<Pick[]>(PICKS.map(p => ({ id: p.id, movie: null })));
  const navigate = useNavigate();

  useEffect(() => {
    PICKS.forEach(({ id }) => {
      getMovieDetail(id).then(movie => {
        setPicks(prev => prev.map(p => p.id === id ? { ...p, movie } : p));
      });
    });
  }, []);

  const x = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 180, damping: 38, mass: 0.6 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const minX = useRef(0);
  const [loadedCount, setLoadedCount] = useState(0);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    minX.current = -(contentRef.current.scrollWidth - window.innerWidth + 80);
  }, [loadedCount]);

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
    x.set(Math.max(minX.current, Math.min(0, x.get() - delta * 1.4)));
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">

      {/* "Featured" + scroll hint — just above images */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{
          position: "absolute", left: "10vw", right: "10vw",
          bottom: "calc(55vh + 6rem)", zIndex: 10,
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
        }}
      >
        <span style={{ ...SF, fontSize: 17, color: "#000000", letterSpacing: "-0.01em" }}>Featured</span>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          style={{ fontFamily: "monospace", fontSize: "9px", letterSpacing: "0.28em", textTransform: "uppercase", color: "#d4d4d4" }}>
          ← scroll →
        </motion.span>
      </motion.div>

      {/* Strip — pinned to bottom */}
      <div ref={containerRef}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "calc(55vh + 5.5rem)", overflow: "hidden", zIndex: 5 }}
        onWheel={handleWheel}
      >
        <motion.div ref={contentRef}
          style={{ x: smoothX, display: "flex", alignItems: "flex-start", gap: "2rem", paddingLeft: "10vw", paddingRight: "10vw", height: "100%" }}
          drag="x" dragConstraints={containerRef} dragElastic={0.05}
          className="cursor-grab active:cursor-grabbing select-none"
        >
          {picks.map((pick, i) => {
            const m = pick.movie;
            const imgPath = m?.scenes[0]?.file_path ?? m?.backdrop_path ?? null;
            const src = imgPath ? `${IMG_W1280}${imgPath}` : null;
            return (
              <motion.div key={pick.id}
                initial={{ opacity: 0 }} animate={{ opacity: src ? 1 : 0 }} transition={{ delay: i * 0.08 + 0.2, duration: 0.5 }}
                onClick={() => m && navigate(`/movie/${pick.id}`)}
                style={{ flexShrink: 0, width: "45vw", cursor: "pointer" }}
              >
                {src ? (
                  <img src={src} alt={m?.title ?? ""} draggable={false}
                    onLoad={() => setLoadedCount(c => c + 1)}
                    style={{ width: "100%", maxHeight: "55vh", objectFit: "cover", display: "block", transition: "opacity 0.3s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  />
                ) : (
                  <div className="animate-pulse" style={{ width: "100%", height: "55vh", background: "#f5f5f5" }} />
                )}
                {m && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 + 0.35 }}
                    style={{ marginTop: "1rem", textAlign: "center" }}>
                    <p style={{ ...DISPLAY, fontWeight: 600, fontSize: "clamp(1.6rem, 3vw, 2.4rem)", letterSpacing: "-0.02em", lineHeight: 1.05, color: "#171717", margin: 0 }}>
                      {m.title} ({m.year})
                    </p>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}