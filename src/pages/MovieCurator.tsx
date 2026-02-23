import { useState } from "react";
import { Link } from "react-router-dom";

// En enkel typ för våra kurerade filmer
type CuratedMovie = {
  imdbID: string;
  Title: string;
  Poster: string;
  Year: string;
  Tags: string[]; // T.ex. "Classic", "Sad", "Short"
};

// HÄR kan du fylla på med dina editorial val. 
// Detta ger en mycket bättre "Archive/Magazine"-känsla än slumpmässiga API-svar.
const CURATED_DB: CuratedMovie[] = [
  { imdbID: "tt0119177", Title: "Gattaca", Year: "1997", Poster: "https://m.media-amazon.com/images/M/MV5BNDQxOTc0MzMtZmRlOS00OWQwLTk2ZDctNDBjYzA4N2JmN2FhXkEyXkFqcGc@._V1_SX300.jpg", Tags: ["Classic", "Standard", "Thoughtful"] },
  { imdbID: "tt0050083", Title: "12 Angry Men", Year: "1957", Poster: "https://m.media-amazon.com/images/M/MV5BTWTYzYjRjZTQtMWVjZi00ZDg2LWE2YWUtNDc2MmM2YmZkNzRkXkEyXkFqcGc@._V1_SX300.jpg", Tags: ["Classic", "Short", "Intense"] },
  { imdbID: "tt1631867", Title: "Edge of Tomorrow", Year: "2014", Poster: "https://m.media-amazon.com/images/M/MV5BMTc5OTk4MTM3M15BMl5BanBnXkFtZTgwODcxNjg3MDE@._V1_SX300.jpg", Tags: ["Contemporary", "Standard", "Action"] },
  { imdbID: "tt0088763", Title: "Back to the Future", Year: "1985", Poster: "https://m.media-amazon.com/images/M/MV5BZEc5NzJlMjQtNTMzYS00MWIyLWI2NTEtNzRjNDc2MGI2MTliXkEyXkFqcGc@._V1_SX300.jpg", Tags: ["Golden Era", "Standard", "Feelgood"] },
  { imdbID: "tt0110357", Title: "The Lion King", Year: "1994", Poster: "https://m.media-amazon.com/images/M/MV5BYTYxNGMyZTYtMjE3MS00MzNjLWFjNmYtMDk3N2FmM2JiM2M1XkEyXkFqcGc@._V1_SX300.jpg", Tags: ["Golden Era", "Short", "Feelgood"] },
  { imdbID: "tt1798709", Title: "Her", Year: "2013", Poster: "https://m.media-amazon.com/images/M/MV5BMjA1Nzk0OTM2OF5BMl5BanBnXkFtZTgwNjU2NjA5OTE@._V1_SX300.jpg", Tags: ["Contemporary", "Standard", "Sad"] },
  // ... Lägg till fler här för att täcka alla kombinationer
];

const STEPS = [
  {
    id: "era",
    question: "First, pick an era.",
    options: [
      { label: "The Classics", value: "Classic", desc: "Pre-1980s cinema" },
      { label: "Golden Era", value: "Golden Era", desc: "1980 – 2010" },
      { label: "Contemporary", value: "Contemporary", desc: "2010 – Today" },
    ],
  },
  {
    id: "length",
    question: "How much time do you have?",
    options: [
      { label: "Quick Watch", value: "Short", desc: "< 90 mins" },
      { label: "Standard", value: "Standard", desc: "90 - 120 mins" },
      { label: "Epic", value: "Epic", desc: "2+ hours" },
    ],
  },
  {
    id: "vibe",
    question: "What's the vibe?",
    options: [
      { label: "Feelgood", value: "Feelgood", desc: "Light & fun" },
      { label: "Thoughtful", value: "Thoughtful", desc: "Deep & complex" },
      { label: "Intense", value: "Intense", desc: "Action or Thriller" },
      { label: "Melancholy", value: "Sad", desc: "Prepare tissues" },
    ],
  },
];

export default function MovieCurator() {
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [matches, setMatches] = useState<CuratedMovie[]>([]);

  const currentStep = STEPS[stepIndex];

  const handleSelect = (value: string) => {
    const newSelections = { ...selections, [currentStep.id]: value };
    setSelections(newSelections);

    if (stepIndex < STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
    } else {
      // Sista steget klart -> Hitta filmer
      findMatches(newSelections);
      setStepIndex((prev) => prev + 1);
    }
  };

  const findMatches = (finalSelections: Record<string, string>) => {
    // Enkel logik: Poängsystem eller exakt matchning
    // Här kör vi "soft matching" - ju fler taggar som stämmer, desto högre upp
    const scored = CURATED_DB.map((movie) => {
      let score = 0;
      if (movie.Tags.includes(finalSelections.era)) score += 3;
      if (movie.Tags.includes(finalSelections.length)) score += 2;
      if (movie.Tags.includes(finalSelections.vibe)) score += 4; // Vibe väger tungt
      return { movie, score };
    })
    .filter((x) => x.score > 0) // Måste matcha något
    .sort((a, b) => b.score - a.score)
    .slice(0, 3) // Ta topp 3
    .map((x) => x.movie);

    setMatches(scored);
  };

  const reset = () => {
    setStepIndex(0);
    setSelections({});
    setMatches([]);
  };

  // RESULT VIEW
  if (stepIndex >= STEPS.length) {
    return (
      <div className="py-20 border-y border-neutral-900 bg-neutral-100">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <h3 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 uppercase">
            We curated this for you
          </h3>
          
          {matches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {matches.map((m, i) => (
                <Link key={m.imdbID} to={`/movie/${m.imdbID}`} className="group block">
                   <div className="relative aspect-[2/3] overflow-hidden border border-neutral-900 bg-neutral-200 mb-4 transition-transform duration-500 ease-out group-hover:-translate-y-2">
                     <img src={m.Poster} alt={m.Title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                     <div className="absolute top-4 left-4 bg-white border border-neutral-900 px-3 py-1 text-xs font-bold uppercase tracking-widest">
                       No. 0{i + 1}
                     </div>
                   </div>
                   <h4 className="text-2xl font-bold leading-none group-hover:underline decoration-2 underline-offset-4">{m.Title}</h4>
                   <p className="text-sm font-mono mt-1 text-neutral-600">{m.Year}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-neutral-600">No perfect match in our archive for this combination.</p>
            </div>
          )}
          
          <button onClick={reset} className="mt-12 text-sm font-bold uppercase tracking-widest border-b border-neutral-900 pb-1 hover:text-neutral-600">
            Start Over ↺
          </button>
        </div>
      </div>
    );
  }

  // WIZARD VIEW
  return (
    <div className="py-24 border-y border-neutral-900 bg-lime-300 text-neutral-900">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-6">
          Archive Curator • Step {stepIndex + 1} of 3
        </p>
        
        <h3 className="text-5xl md:text-7xl font-black tracking-tighter mb-12 leading-[0.9]">
          {currentStep.question}
        </h3>

        <div className="flex flex-wrap justify-center gap-4">
          {currentStep.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="group relative px-8 py-4 bg-neutral-900 text-lime-300 border-2 border-transparent hover:bg-transparent hover:border-neutral-900 hover:text-neutral-900 transition-all duration-300"
            >
              <span className="text-xl font-bold uppercase tracking-tight">{opt.label}</span>
              <span className="block text-[10px] uppercase tracking-widest opacity-60 mt-1 group-hover:opacity-100">
                {opt.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}