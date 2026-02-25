// src/components/FilmCompact.tsx
//
// A compact film row for the homepage — image fills its column with object-cover
// (no black bars), title + year centered vertically beside it.
// Each row is designed to be flex-1 inside a fixed-height container so 3 rows
// fill the screen without scrolling.

import { motion } from "framer-motion";

const DISPLAY: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
};
const SF: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};

export interface FilmCompactData {
  title:    string;
  year:     string | number;
  imageUrl: string;
}

interface FilmCompactProps {
  film:          FilmCompactData;
  imagePosition?: "left" | "right";
  /** Width of the image column. Default: "35%" */
  imageWidth?:   string;
  animationDelay?: number;
  onClick?:      () => void;
}

export default function FilmCompact({
  film,
  imagePosition  = "left",
  imageWidth     = "35%",
  animationDelay = 0,
  onClick,
}: FilmCompactProps) {

  const imageCol = (
    // position:relative container — img is absolute so it covers 100% with no bars
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{ width: imageWidth }}
    >
      <motion.img
        src={film.imageUrl}
        alt={film.title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: animationDelay }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
      />
    </div>
  );

  const textCol = (
    <div
      className="flex flex-col justify-center px-10 md:px-14"
      style={{ width: `calc(100% - ${imageWidth})` }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: animationDelay + 0.1 }}
        style={{
          ...DISPLAY,
          fontWeight: 600,
          fontSize: "clamp(1rem, 1.8vw, 1.5rem)",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: "#171717",
          margin: 0,
        }}
      >
        {film.title}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: animationDelay + 0.18 }}
        style={{
          ...SF,
          fontSize: "clamp(0.75rem, 1vw, 0.875rem)",
          color: "#a3a3a3",
          marginTop: "0.3rem",
          letterSpacing: "-0.01em",
        }}
      >
        {film.year}
      </motion.p>
    </div>
  );

  return (
    <div
      className={`w-full h-full flex overflow-hidden bg-white ${onClick ? "cursor-pointer" : ""}`}
      style={{ fontFamily: SF.fontFamily }}
      onClick={onClick}
    >
      {imagePosition === "left"  && imageCol}
      {textCol}
      {imagePosition === "right" && imageCol}
    </div>
  );
}