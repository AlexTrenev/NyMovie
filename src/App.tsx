// src/App.tsx
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Movies from "./pages/Movies";
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
  const links = [
    { to: "/",        label: "Archive" },
    { to: "/discover", label: "Curator" },
    { to: "/search",   label: "Search"  },
  ];

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 md:px-14 h-14 bg-[#f8f7f4]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif" }}
    >
      <Link
        to="/"
        className="text-[15px] text-neutral-900 hover:text-neutral-400 transition-colors"
        style={{ fontWeight: 400, letterSpacing: "-0.015em" }}
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
              className={`text-[14px] transition-colors ${active ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-900"}`}
              style={{ fontWeight: 400, letterSpacing: "-0.01em" }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}