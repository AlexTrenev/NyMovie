// src/components/FilmCard.tsx
import { motion } from "framer-motion";
import { IMG_W1280 } from "../lib/api";
import type { MovieDetail } from "../lib/api";

// ─── Prop types ──────────────────────────────────────────────────────────────

export interface FilmCardData {
  title:          string;
  year:           string | number;
  overview?:      string;
  tagline?:       string;
  director?:      string;
  runtime?:       number;
  imdbRating?:    string;
  genres?:        { name: string }[];
  cast?:          string[];
  scenes?:        { file_path: string }[];
  backdrop_path?: string | null;
  imageUrl?:      string;
}

interface FilmCardProps {
  movie: FilmCardData | MovieDetail;
  imagePosition?:  "left" | "right";
  imageMaxHeight?: string;
  imageWidth?:     string;
  showOverview?:   boolean;
  showRuntime?:    boolean;
  showDirector?:   boolean;
  showRating?:     boolean;
  showGenres?:     boolean;
  showCast?:       boolean;
  showTagline?:    boolean;
  centerText?:     boolean;
  className?:      string;
  onClick?:        () => void;
}

// ─── Shared styles ───────────────────────────────────────────────────────────

const DISPLAY: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
};
const SF: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function FilmCard({
  movie,
  imagePosition  = "left",
  imageMaxHeight = "55vh",
  imageWidth     = "45%",
  showOverview   = true,
  showRuntime    = true,
  showDirector   = true,
  showRating     = true,
  showGenres     = true,
  showCast       = true,
  showTagline    = true,
  className      = "",
  onClick,
}: FilmCardProps) {

  const imageUrl = (movie as FilmCardData).imageUrl;
  const heroImg: string | null =
    imageUrl ??
    (movie.scenes?.[0]?.file_path
      ? `${IMG_W1280}${movie.scenes[0].file_path}`
      : movie.backdrop_path
        ? `${IMG_W1280}${movie.backdrop_path}`
        : null);

  // Matches the original InfoView left column exactly
  const imageCol = (
    <div className="hidden md:flex md:w-[45%] h-full flex-shrink-0 flex-col pt-20 px-14 pb-24"
      style={{ width: imageWidth }}>
      {heroImg && (
        <motion.img
          src={heroImg}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full object-cover"
          style={{ maxHeight: imageMaxHeight }}
        />
      )}
    </div>
  );

  // body matches original InfoView body style exactly
  const body: React.CSSProperties = { fontSize: 17, color: "#171717", lineHeight: 1.6 };

  // Matches the original InfoView right column exactly
  const textCol = (
    <div className="w-full md:w-[55%] h-full overflow-y-auto px-10 md:px-14 pt-20 pb-24 no-scrollbar"
      style={{ width: `calc(100% - ${imageWidth})` }}>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-neutral-900 leading-[1.05] tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 600,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif" }}>
          {movie.title} ({movie.year})
        </h1>
      </motion.div>

      {showOverview && movie.overview && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="mt-5" style={{ ...body, textAlign: "justify" }}>
          {movie.overview}
        </motion.p>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
        className="mt-6">
        <div className="flex gap-16 flex-wrap">
          <div>{showRuntime  && movie.runtime  && movie.runtime > 0  && <p style={body}>{movie.runtime} min</p>}</div>
          <div>{showDirector && movie.director                        && <p style={body}>{movie.director}</p>}</div>
          <div>{showRating   && movie.imdbRating                     && <p style={body}>★ {movie.imdbRating}</p>}</div>
        </div>
        {showGenres && movie.genres && movie.genres.length > 0 && (
          <p style={{ ...body, marginTop: "0.75rem" }}>
            {movie.genres.map(g => g.name).join("; ")}
          </p>
        )}
      </motion.div>

      {showCast && movie.cast && movie.cast.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="mt-6" style={{ columns: 2, columnGap: "2.5rem" }}>
          {movie.cast.map(name => (
            <p key={name} style={body} className="break-inside-avoid">{name}</p>
          ))}
        </motion.div>
      )}

      {showTagline && movie.tagline && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mt-6 italic" style={{ ...body, color: "#343434" }}>
          "{movie.tagline}"
        </motion.p>
      )}
    </div>
  );

  return (
    <div
      className={`w-full h-full flex overflow-hidden bg-white ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ fontFamily: SF.fontFamily }}
      onClick={onClick}
    >
      {imagePosition === "left"  && imageCol}
      {textCol}
      {imagePosition === "right" && imageCol}
    </div>
  );
}