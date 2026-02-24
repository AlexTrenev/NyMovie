// src/pages/Home.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/navbar";

const SF: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};
const DISPLAY: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
};

const titleStyle: React.CSSProperties = {
  ...DISPLAY,
  fontWeight: 600,
  fontSize: "clamp(1.1rem, 1.8vw, 1.6rem)",
  letterSpacing: "-0.025em",
  lineHeight: 1.05,
  color: "#171717",
  margin: 0,
};

const yearStyle: React.CSSProperties = {
  ...SF,
  fontWeight: 400,
  fontSize: "clamp(0.75rem, 0.9vw, 0.85rem)",
  color: "#a3a3a3",
  marginTop: "0.4rem",
  letterSpacing: "-0.01em",
  lineHeight: 1.4,
};

const FILMS = [
  {
    id: 843,
    title: "In the Mood for Love",
    year: 2000,
    imageUrl: "https://www.scenestill.com/storage/film-stills/webp/In_the_Mood_for_Love_screencap_007_webp.webp",
  },
  {
    id: 11800,
    title: "Chungking Express",
    year: 1994,
    imageUrl: "https://www.scenestill.com/storage/film-stills/webp/chungking_express_screencap_04_webp.webp",
  },
  {
    id: 496243,
    title: "Parasite",
    year: 2019,
    imageUrl: "https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
  },
  {
    id: 129,
    title: "Spirited Away",
    year: 2001,
    imageUrl: "https://image.tmdb.org/t/p/w1280/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
  },
];

const IMG_W = 280;
const IMG_H = 175;

// Cards spread diagonally — no overlap
// 4 cards, spread from ~10% to ~70% of viewport width and ~10% to ~70% of remaining height
const POSITIONS = [
  { x: "8vw",  y: "8vh"  },
  { x: "24vw", y: "22vh" },
  { x: "40vw", y: "36vh" },
  { x: "56vw", y: "50vh" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="h-dvh overflow-hidden bg-white flex flex-col">
      <Navbar background="#ffffff" />

      <main className="flex-1 relative overflow-hidden">
        {FILMS.map((film, i) => (
          <motion.div
            key={film.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            onClick={() => navigate(`/movie/${film.id}`)}
            style={{
              position: "absolute",
              left: POSITIONS[i].x,
              top: POSITIONS[i].y,
              zIndex: i + 1,
              cursor: "pointer",
              display: "flex",
              alignItems: "flex-start",
              gap: 18,
            }}
          >
            {/* Image — no overlap, clean crop */}
            <div style={{ width: IMG_W, height: IMG_H, flexShrink: 0, overflow: "hidden" }}>
              <img
                src={film.imageUrl}
                alt={film.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            </div>

            {/* Text top-aligned to image */}
            <div style={{ paddingTop: 2 }}>
              <p style={titleStyle}>{film.title}</p>
              <p style={yearStyle}>{film.year}</p>
            </div>
          </motion.div>
        ))}
      </main>
    </div>
  );
}