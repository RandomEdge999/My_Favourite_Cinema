const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "751caedbe7c70fbd9329753595a41eed";

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

export const fetchTrendingMovies = async () => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch trending movies:", error);
    return [];
  }
};

export const searchMovies = async (query) => {
  if (!query) return [];
  try {
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Failed to search movies:", error);
    return [];
  }
};
