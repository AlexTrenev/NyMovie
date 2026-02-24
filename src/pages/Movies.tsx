// src/pages/Movies.tsx
import { useState, useEffect } from "react";

const STILLS = [
  "https://www.scenestill.com/storage/film-stills/webp/In_the_Mood_for_Love_screencap_007_webp.webp",
  "https://www.scenestill.com/storage/film-stills/webp/chungking_express_screencap_04_webp.webp",
  "https://www.scenestill.com/storage/film-stills/webp/chungking_express_screencap_60_webp.webp",
  "https://www.scenestill.com/storage/film-stills/webp/chungking_express_screencap_59_webp.webp", 
  "https://www.scenestill.com/storage/film-stills/webp/chungking_express_screencap_21_webp.webp", 
];

const imgStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center center",
  display: "block",
};

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes filmFadeIn {
    0% { opacity: 0; transform: scale(1.02); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes filmFadeOut {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.98); }
  }
`;
if (typeof document !== "undefined") {
  document.head.appendChild(styleSheet);
}

export default function Movies() {
  const [current, setCurrent] = useState(0);
  const [prev,    setPrev]    = useState<number | null>(null);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setFading(true);
      setCurrent(c => (c + 1) % STILLS.length);
      setTimeout(() => { setPrev(null); setFading(false); }, 1500);
    }, 5000);
    return () => clearInterval(interval);
  }, [current]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", overflow: "hidden" }}>

      {/* Previous still — fades out */}
      {prev !== null && (
        <img
          src={STILLS[prev]}
          alt=""
          style={{ ...imgStyle, animation: "filmFadeOut 3500ms cubic-bezier(0.15, 0.46, 0.45, 0.74) forwards" }}
        />
      )}

      {/* Current still — fades in */}
      <img
        key={current}
        src={STILLS[current]}
        alt=""
        style={{ ...imgStyle, animation: "filmFadeIn 3500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
      />

      {/* Overlays */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 1 }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.5) 100%)", zIndex: 1 }} />

      {/* Dot indicators */}
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 2 }}>
        {STILLS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setPrev(current); setCurrent(i); }}
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              borderRadius: 3,
              border: "none",
              cursor: "pointer",
              padding: 0,
              background: i === current ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
              transition: "all 300ms",
            }}
          />
        ))}
      </div>

    </div>
  );
}