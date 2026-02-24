// src/App.tsx
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Movies from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Discover from "./pages/Discover";
import Search from "./pages/Search";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"              element={<Movies />} />
        <Route path="/discover"      element={<Discover />} />
        <Route path="/search"        element={<Search />} />
        <Route path="/movie/:imdbID" element={<MovieDetails />} />
      </Routes>
    </>
  );
}

function Navbar() {
  const location = useLocation();
  const isHome   = location.pathname === "/";
  const isDetail = location.pathname.startsWith("/movie/");

  // Home + detail = dark bg, white text. Other pages = light bg, dark text
  const isDark = isHome || isDetail;

  const links = [
    { to: "/",         label: "Home"    },
    { to: "/discover", label: "Curator" },
    { to: "/search",   label: "Search"  },
  ];

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 md:px-14 h-14"
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
        background: isDark ? "transparent" : "#f8f7f4",
      }}
    >
      <Link
        to="/"
        className="text-[15px] transition-colors"
        style={{
          fontWeight: 400,
          letterSpacing: "-0.015em",
          color: isDark ? "rgba(255,255,255,0.9)" : "#171717",
        }}
      >
        Film Index
      </Link>

      <div className="flex items-center gap-7">
        {links.map(({ to, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className="text-[14px] transition-colors"
              style={{
                fontWeight: 400,
                letterSpacing: "-0.01em",
                color: isDark
                  ? active ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.45)"
                  : active ? "#171717" : "#a3a3a3",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}