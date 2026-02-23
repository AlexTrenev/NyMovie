import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export type MovieCardProps = {
  imdbID: string;
  title: string;
  poster?: string;
  year?: string;
};

function getInitials(str: string) {
  const words = (str || "").split(/\s+/).filter(Boolean);
  const first = words[0]?.[0] ?? "?";
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function MovieCard({ imdbID, title, poster, year }: MovieCardProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const initials = useMemo(() => getInitials(title), [title]);
  const showPoster = !!poster && !error;

  const CardInner = (
    <article
      className="group rounded-xl overflow-hidden border border-neutral-200 bg-white hover:shadow-md transition-shadow"
      aria-label={title}
      data-id={imdbID}
    >
      <div className="relative aspect-[2/3] bg-neutral-100">
        {showPoster && (
          <img
            src={poster}
            alt={title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={[
              "absolute inset-0 h-full w-full object-cover",
              loaded ? "opacity-100" : "opacity-0",
              "transition-opacity duration-300",
            ].join(" ")}
          />
        )}
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-10 w-10 rounded-lg bg-neutral-200 animate-pulse" />
          </div>
        )}
        {(!showPoster || error) && (
          <div className="absolute inset-0 grid place-items-center bg-neutral-100">
            <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-neutral-200">
              <span className="text-2xl font-black tracking-tight text-neutral-500 select-none">
                {initials}
              </span>
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/10 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-3 md:p-4">
        <h3 className="text-[15px] md:text-[17px] font-semibold tracking-tight leading-snug line-clamp-2">
          {title}
        </h3>
        <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-neutral-500">
          {year || "—"}
        </div>
      </div>
    </article>
  );

  return (
    <Link to={`/movie/${imdbID}`} className="block focus:outline-none focus:ring-2 focus:ring-neutral-900 rounded-xl">
      {CardInner}
    </Link>
  );
}
