// src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";

const SF: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};

type NavbarProps = {
  theme?: "light" | "dark";
  background?: string;
};

export default function Navbar({ theme = "light", background }: NavbarProps) {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const textColor  = theme === "dark" ? "#ffffff" : "#171717";
  const mutedColor = theme === "dark" ? "rgba(255,255,255,0.5)" : "#a3a3a3";
  const bg         = background ?? (theme === "dark" ? "transparent" : "#f8f7f4");

  // Span style defeats any global `a { color: ... }` or `-webkit-text-fill-color` rule
  // by applying color to a non-anchor element inside the link.
  const spanStyle = (color: string): React.CSSProperties => ({
    ...SF,
    color,
    display: "block",
    fontWeight: 400,
    textDecoration: "none",
    background: "none",
    WebkitTextFillColor: color,
    WebkitBackgroundClip: "unset",
    backgroundClip: "unset",
  });

  return (
    <nav
      style={{ ...SF, background: bg }}
      className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-8 md:px-14 h-14"
    >
      {/* Wordmark — span inside Link so no global a-tag styles apply to the text */}
      <Link to="/" style={{ textDecoration: "none", lineHeight: 1 }}>
        <span style={{ ...spanStyle(textColor), fontSize: "15px", letterSpacing: "-0.015em" }}>
          Film Index
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-7">
        {([
          { to: "/",         label: "Home"    },
          { to: "/discover", label: "Curator" },
          { to: "/search",   label: "Search"  },
        ] as const).map(({ to, label }) => {
          const color = isActive(to) ? textColor : mutedColor;
          return (
            <Link key={to} to={to} style={{ textDecoration: "none", lineHeight: 1 }}>
              <span style={{ ...spanStyle(color), fontSize: "14px", letterSpacing: "-0.01em", transition: "color 0.2s ease, -webkit-text-fill-color 0.2s ease" }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}