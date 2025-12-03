'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Star, Film } from 'lucide-react';
import { BACKDROP_BASE_URL } from '@/lib/tmdb';
import MoviePoster from './MoviePoster';

const MovieDetailModal = ({ selectedMovie, onClose, onAddToTop10, onAddToWatched }) => (
  <AnimatePresence>
    {selectedMovie && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xl"
        />
        
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-8 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="pointer-events-auto w-full max-w-5xl max-h-[90vh] bg-[#09090b]/80 backdrop-blur-3xl rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col relative"
          >
             {/* Hero Header */}
             <div className="relative h-64 md:h-80 w-full shrink-0">
               <div className="absolute inset-0">
                 {selectedMovie.backdrop_path ? (
                    <Image
                      src={`${BACKDROP_BASE_URL}${selectedMovie.backdrop_path}`}
                      alt={selectedMovie.title}
                      fill
                      className="object-cover opacity-60"
                      unoptimized
                    />
                 ) : (
                   <div className="w-full h-full bg-[#111]" />
                 )}
                 <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#09090b]/40 to-[#09090b]" />
               </div>
               
               <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2.5 bg-black/20 backdrop-blur-xl rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/10 z-20 group"
               >
                 <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
               </button>
             </div>

             {/* Content Body */}
             <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10 -mt-32 relative z-10 custom-scrollbar">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                   {/* Floating Poster */}
                   <motion.div 
                     layoutId={`poster-${selectedMovie.id}`}
                     className="w-48 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 shrink-0 mx-auto md:mx-0 bg-[#1a1a1a]"
                   >
                      <MoviePoster path={selectedMovie.poster_path} alt={selectedMovie.title} />
                   </motion.div>

                   {/* Details */}
                   <div className="flex-1 pt-4 md:pt-32 text-center md:text-left">
                      <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter leading-none mb-4 drop-shadow-lg">
                        {selectedMovie.title}
                      </h2>
                      
                      {/* Metadata Bar (Linux/Terminal Style) */}
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                        <div className="px-3 py-1 rounded-md bg-white/5 border border-white/10 backdrop-blur-md text-xs font-mono text-white/70 flex items-center gap-2">
                           <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                           {selectedMovie.release_date?.split('-')[0] || 'N/A'}
                        </div>
                        <div className="px-3 py-1 rounded-md bg-white/5 border border-white/10 backdrop-blur-md text-xs font-mono text-white/70 flex items-center gap-2">
                           <Star size={12} className="text-yellow-500 fill-current" />
                           TMDB: {selectedMovie.vote_average?.toFixed(1)}
                        </div>
                        <div className="px-3 py-1 rounded-md bg-white/5 border border-white/10 backdrop-blur-md text-xs font-mono text-white/70 uppercase">
                           {selectedMovie.original_language}
                        </div>
                      </div>

                      <p className="text-lg md:text-xl leading-relaxed text-white/80 font-light mb-8 max-w-2xl mx-auto md:mx-0">
                        {selectedMovie.overview}
                      </p>
                      
                      {/* Action Buttons (Apple Style) */}
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <button 
                          onClick={() => onAddToTop10(selectedMovie)}
                          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                          <Star size={20} className="fill-current" />
                          <span>Add to Top 10</span>
                        </button>
                        <button 
                          onClick={() => onAddToWatched(selectedMovie)}
                          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
                        >
                          <Film size={20} />
                          <span>Mark Watched</span>
                        </button>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

export default MovieDetailModal;
