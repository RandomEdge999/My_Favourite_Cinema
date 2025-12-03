'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import MovieGrid from '@/components/MovieGrid';
import SkeletonMovieGrid from '@/components/SkeletonMovieGrid';
import { useApp } from '@/components/AppState';
import { fetchTrendingMovies } from '@/lib/tmdb';

export default function HomeClient() {
  const { setSelectedMovie } = useApp();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        const movies = await fetchTrendingMovies();
        setTrendingMovies(movies);
      } catch (error) {
        console.error('Failed to load movies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32"
    >
      <div className="px-8 mb-12">
        <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-4 opacity-90">
          Library
        </h1>
        <div className="flex items-center gap-3 text-white/30 text-sm font-mono">
          <Terminal size={14} />
          <span>SYSTEM ONLINE</span>
          <span className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
        </div>
      </div>

      {loading ? (
        <SkeletonMovieGrid />
      ) : (
        <MovieGrid
          movies={trendingMovies}
          onItemClick={setSelectedMovie}
          label="Global Trending"
        />
      )}
    </motion.div>
  );
}
