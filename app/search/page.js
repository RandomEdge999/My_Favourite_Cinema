'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Cpu } from 'lucide-react';
import { searchMovies } from '@/lib/tmdb';
import { useApp } from '@/components/AppState';
import GlassCard from '@/components/GlassCard';
import MoviePoster from '@/components/MoviePoster';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { setSelectedMovie } = useApp();

  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    const results = await searchMovies(query);
    setSearchResults(results);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      className="pt-8 px-4 md:px-12 h-full flex flex-col"
    >
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Command Bar */}
        <div className="relative z-30 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <GlassCard className="flex items-center px-6 py-5 rounded-2xl border-white/10 group-focus-within:border-white/20 transition-colors">
              <Search className="text-white/40 mr-4" size={20} />
              <input 
                type="text" 
                autoFocus
                placeholder="Search database..." 
                className="bg-transparent border-none outline-none text-2xl text-white placeholder-white/20 w-full h-full font-light tracking-tight"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <div className="hidden md:flex items-center gap-2">
                <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/40 font-mono">ESC</kbd>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((movie) => (
                <div 
                  key={movie.id}
                  onClick={() => setSelectedMovie(movie)}
                  className="flex gap-4 p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group border border-transparent hover:border-white/5"
                >
                  <div className="w-16 h-24 bg-[#1a1a1a] rounded-lg overflow-hidden shrink-0">
                    <MoviePoster path={movie.poster_path} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">{movie.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-white/40 font-mono">
                      <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Star size={10} />
                        <span>{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center pt-20 text-white/20 font-mono">
              NO ENTRIES FOUND IN DATABASE
            </div>
          ) : (
            <div className="text-center pt-20">
               <Cpu size={48} className="mx-auto text-white/10 mb-4" />
               <p className="text-white/20 font-mono text-sm">AWAITING INPUT...</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
