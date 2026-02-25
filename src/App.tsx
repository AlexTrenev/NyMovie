// src/App.tsx
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import Movies from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import Discover from "./pages/Discover";
import Search from "./pages/Search";
import About from "./pages/About";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/"              element={<Movies />} />
        <Route path="/discover"      element={<Discover />} />
        <Route path="/search"        element={<Search />} />
        <Route path="/about"         element={<About />} />
        <Route path="/movie/:imdbID" element={<MovieDetails />} />
      </Routes>
      <NavbarPortal />
    </>
  );
}

function NavbarPortal() {
  return createPortal(<Navbar />, document.body);
}

function Navbar() {
  const location = useLocation();

  const links = [
    { to: "/",         label: "Home"    },
    { to: "/discover", label: "Curator" },
    { to: "/search",   label: "Search"  },
    { to: "/about",    label: "About"   },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "3.5rem",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        background: "transparent",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
      }}
      className="md:px-14"
    >
      <Link
        to="/"
        style={{
          fontSize: "18px",
          fontWeight: 400,
          letterSpacing: "-0.015em",
          color: "#171717",
        }}
      >
        Film Index
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
        {links.map(({ to, label }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              style={{
                fontSize: "14px",
                fontWeight: 400,
                letterSpacing: "-0.01em",
                color: active ? "#171717" : "#a3a3a3",
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