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

  return (
    <nav
      style={{ ...SF, background: bg }}
      className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-8 md:px-14 h-14"
    >
      {/* Wordmark */}
      <Link to="/" className="navbar-link" style={{ color: textColor }}>
        <span style={{ ...SF, fontSize: "15px", fontWeight: 400, letterSpacing: "-0.015em" }}>
          Film Index
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-7">
        {([
          { to: "/",         label: "Home"    },
          { to: "/discover", label: "Curator" },
          { to: "/search",   label: "Search"  },
          { to: "/about",    label: "About"   },
        ] as const).map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="navbar-link"
            style={{ color: isActive(to) ? textColor : mutedColor }}
          >
            <span style={{ ...SF, fontSize: "14px", fontWeight: 400, letterSpacing: "-0.01em" }}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}