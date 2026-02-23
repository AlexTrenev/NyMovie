// components/MoodSheet.tsx
import { useState } from "react";

type Props = {
  onResults: (items: any[]) => void;
};

export default function MoodSheet({ onResults }: Props) {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState("cozy");
  const [pace, setPace] = useState<string | undefined>();
  const [era, setEra] = useState<string | undefined>();
  const [lang, setLang] = useState<string | undefined>();
  const [length, setLength] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  async function discover() {
    setLoading(true);
    const qs = new URLSearchParams(
      Object.entries({ mood, pace: pace||"", era: era||"", lang: lang||"", length: length||"" })
        .filter(([,v]) => v)
        .map(([k,v]) => [k, String(v)])
    );
    const res = await fetch(`/api/discover?${qs.toString()}`);
    const data = await res.json();
    setLoading(false);
    setOpen(false);
    onResults(Array.isArray(data) ? data : []);
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 md:px-8 mt-16">
        <div className="bg-neutral-950 text-white rounded-2xl p-10 md:p-14 flex flex-col items-center text-center">
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tight">Don’t know what to watch?</h3>
          <p className="mt-3 text-neutral-300">Pick a mood and let Cinematique suggest something.</p>
          <button
            onClick={() => setOpen(true)}
            className="mt-6 px-6 py-3 rounded-full bg-white text-neutral-900 font-semibold hover:opacity-90"
          >
            What’s your mood?
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute left-1/2 -translate-x-1/2 top-20 w-[90vw] max-w-3xl bg-neutral-950 text-white rounded-2xl p-8 md:p-10">
            <h4 className="text-3xl md:text-4xl font-extrabold tracking-tight">Choose your vibe</h4>

            {/* Controls */}
            <div className="mt-6 grid gap-6">
              <div>
                <label className="text-sm uppercase tracking-[0.18em] text-neutral-400">Mood</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["cozy","feelgood","dark","adrenaline","artsy","nostalgic","kawaii"].map(m => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={`px-3 py-1.5 rounded-full text-sm ${mood===m ? "bg-white text-neutral-900" : "bg-neutral-800 text-white hover:bg-neutral-700"}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm uppercase tracking-[0.18em] text-neutral-400">Pace</label>
                  <div className="mt-2 flex gap-2">
                    {["slow","snappy"].map(p => (
                      <button key={p} onClick={() => setPace(p)}
                        className={`px-3 py-1.5 rounded-full text-sm ${pace===p ? "bg-white text-neutral-900" : "bg-neutral-800 hover:bg-neutral-700"}`}>
                        {p}
                      </button>
                    ))}
                    {pace && <button onClick={()=>setPace(undefined)} className="text-neutral-400 text-sm underline">clear</button>}
                  </div>
                </div>

                <div>
                  <label className="text-sm uppercase tracking-[0.18em] text-neutral-400">Era</label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {["70s","90s","00s","new"].map(e => (
                      <button key={e} onClick={() => setEra(e)}
                        className={`px-3 py-1.5 rounded-full text-sm ${era===e ? "bg-white text-neutral-900" : "bg-neutral-800 hover:bg-neutral-700"}`}>
                        {e}
                      </button>
                    ))}
                    {era && <button onClick={()=>setEra(undefined)} className="text-neutral-400 text-sm underline">clear</button>}
                  </div>
                </div>

                <div>
                  <label className="text-sm uppercase tracking-[0.18em] text-neutral-400">Length</label>
                  <div className="mt-2 flex gap-2">
                    {["short"].map(l => (
                      <button key={l} onClick={() => setLength(l)}
                        className={`px-3 py-1.5 rounded-full text-sm ${length===l ? "bg-white text-neutral-900" : "bg-neutral-800 hover:bg-neutral-700"}`}>
                        Under 100 min
                      </button>
                    ))}
                    {length && <button onClick={()=>setLength(undefined)} className="text-neutral-400 text-sm underline">clear</button>}
                  </div>
                </div>

                <div>
                  <label className="text-sm uppercase tracking-[0.18em] text-neutral-400">Language</label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {["Japanese","Korean","English","French","Swedish"].map(l => (
                      <button key={l} onClick={() => setLang(l)}
                        className={`px-3 py-1.5 rounded-full text-sm ${lang===l ? "bg-white text-neutral-900" : "bg-neutral-800 hover:bg-neutral-700"}`}>
                        {l}
                      </button>
                    ))}
                    {lang && <button onClick={()=>setLang(undefined)} className="text-neutral-400 text-sm underline">clear</button>}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={discover}
                disabled={loading}
                className="px-5 py-2.5 rounded-full bg-white text-neutral-900 font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Finding…" : "Show suggestions"}
              </button>
              <button
                onClick={()=>{
                  const moods = ["cozy","feelgood","dark","adrenaline","artsy","nostalgic","kawaii"];
                  setMood(moods[Math.floor(Math.random()*moods.length)]);
                }}
                className="px-5 py-2.5 rounded-full border border-neutral-700 hover:bg-neutral-800"
              >
                Surprise me
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
