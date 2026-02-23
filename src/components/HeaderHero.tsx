// src/components/HeaderHero.tsx
import React, { Dispatch, SetStateAction, RefObject } from 'react';

// Uppdaterad Props definition
interface Props {
  q: string;
  setQ: Dispatch<SetStateAction<string>>;
  runSearch: (query: string) => Promise<void>;
  inputRef: RefObject<HTMLInputElement | null>;
}

export default function HeaderHero({ q, setQ, runSearch, inputRef }: Props) {
  // Se till att din komponent använder dessa props:
  return (
    <header className="bg-black text-white p-12">
      <form onSubmit={(e) => { e.preventDefault(); runSearch(q); }} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="SEARCH OMDb..."
          className="w-full bg-transparent border-b border-neutral-700 pb-2 text-3xl font-bold uppercase placeholder-neutral-700 focus:outline-none focus:border-lime-500"
        />
        <button type="submit" className="absolute right-0 bottom-2 text-neutral-500 hover:text-white">→</button>
      </form>
    </header>
  );
}