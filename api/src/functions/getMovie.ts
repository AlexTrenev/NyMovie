import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function getMovie(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const id = request.query.get("id");      // imdbID för detaljer
  const title = request.query.get("title"); // titel för sök

  try {
    if (id) {
      // 🔹 Detaljer-läge (i=)
      const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_KEY}&plot=short&i=${encodeURIComponent(id)}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.Response === "False") return { status: 404, body: data.Error || "Not found" };

      const rt = data.Ratings?.find((r: any) => r.Source === "Rotten Tomatoes")?.Value;
      return {
        status: 200,
        jsonBody: {
          imdbID: data.imdbID,
          title: data.Title,
          year: Number(data.Year),
          plot: data.Plot,
          imdb: parseFloat(data.imdbRating),
          metascore: parseInt(data.Metascore),
          rt,
          genres: data.Genre?.split(",").map((g: string) => g.trim()) ?? [],
          poster: data.Poster,
        },
      };
    }

    if (!title) return { status: 400, body: "Missing ?title= or ?id=" };

    // 🔹 Sök-läge (s=)
    const url = `https://www.omdbapi.com/?apikey=${process.env.OMDB_KEY}&s=${encodeURIComponent(title)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "False") return { status: 404, body: data.Error || "Not found" };

    // Returnera listan (Title, Year, Poster, imdbID, Type)
    return { status: 200, jsonBody: data.Search };
  } catch (err: any) {
    context.error("Error fetching from OMDb", err);
    return { status: 500, body: "Error fetching from OMDb" };
  }
}

app.http("getMovie", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getMovie,
});
