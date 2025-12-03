'use client';

import React from 'react';
import { motion } from 'framer-motion';
import MoviePoster from './MoviePoster';
import RatingRing from './RatingRing';

const MovieGrid = ({ movies, onItemClick, label }) => (
  <div className="w-full">
    {label && <h2 className="px-8 mb-6 text-sm font-medium text-white/40 uppercase tracking-widest">{label}</h2>}
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10 px-8 pb-32">
      {movies.map((movie) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onItemClick(movie)}
          className="group cursor-pointer"
        >
          <motion.div 
            layoutId={`poster-${movie.id}`}
            className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-[#1a1a1a] ring-1 ring-white/10 transition-shadow duration-300 group-hover:shadow-blue-900/20 group-hover:ring-white/20"
          >
            <MoviePoster path={movie.poster_path} alt={movie.title} />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <RatingRing rating={movie.vote_average} />
            </div>
          </motion.div>
          <div className="mt-4 px-1">
            <h3 className="text-white font-medium text-sm leading-snug line-clamp-1">{movie.title}</h3>
            <p className="text-white/30 text-xs mt-1 font-mono">{movie.release_date?.split('-')[0] || 'TBA'}</p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default MovieGrid;
