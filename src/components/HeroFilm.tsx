export default function HeroFilm() {
  return (
    <section className="relative mx-[calc(50%-50vw)] w-screen overflow-hidden">
      {/* Bilden under */}
      <img
        src="/persona.jpeg" // ← ledande slash
        alt=""
        className="block w-full h-[80vh] object-cover"
        style={{ objectPosition: "center 30%" }}
      />

      {/* Overlay (under texten) */}
      <div className="absolute inset-0 z-0 bg-black/35 pointer-events-none" />
      <div className="absolute inset-0 z-0 pointer-events-none [background:radial-gradient(ellipse_at_center,transparent_0%,transparent_55%,rgba(0,0,0,0.6)_100%)]" />

      {/* Text (ovanpå) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center text-center px-6">
        <div>
          <h1
            className="font-black text-white tracking-tight"
            style={{ fontSize: "clamp(40px, 8vw, 84px)", lineHeight: 0.95 }}
          >
            A Collection of Movies
          </h1>
          <p
            className="mt-4 text-neutral-200"
            style={{ fontSize: "clamp(14px, 2vw, 18px)" }}
          >
            Explore classics & discover your next watch.
          </p>
        </div>
      </div>
    </section>
  );
}
