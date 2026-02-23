import { Routes, Route } from "react-router-dom";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Movies />} />
      <Route path="/movie/:imdbID" element={<MovieDetails />} />
    </Routes>
  );
}
