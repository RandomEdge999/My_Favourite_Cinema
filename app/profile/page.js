'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Film, Plus, X } from 'lucide-react';
import { useApp } from '@/components/AppState';
import MoviePoster from '@/components/MoviePoster';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';

export default function ProfilePage() {
  const { user, top10, watched, removeFromList } = useApp();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="pt-28 px-8 pb-32 max-w-7xl mx-auto"
      >
        <div className="flex items-end justify-between mb-16 border-b border-white/5 pb-8">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white font-mono">
                {user?.email?.slice(0,2).toUpperCase() || 'GU'}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Personal Index</h1>
                <p className="text-white/40 font-mono text-sm mt-1">ID: {user?.id || 'GUEST_SESSION'}</p>
                {!user && (
                  <button onClick={() => setShowAuth(true)} className="text-blue-400 text-xs mt-2 hover:underline">
                    Connect Account
                  </button>
                )}
              </div>
           </div>
           <div className="flex gap-8 text-sm font-medium text-white/40">
              <div className="text-center">
                <span className="block text-2xl text-white font-bold">{top10.length}</span>
                <span>FAVORITES</span>
              </div>
              <div className="text-center">
                <span className="block text-2xl text-white font-bold">{watched.length}</span>
                <span>WATCHED</span>
              </div>
           </div>
        </div>

        {/* Lists */}
        <div className="space-y-16">
          <section>
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Star size={20} className="text-yellow-500 fill-current" />
                  Top 10 Selection
               </h2>
               <span className="text-xs font-mono text-white/30">{top10.length} / 10 SLOTS</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {top10.map((movie, index) => (
                  <div key={movie.id} className="group relative aspect-[2/3] bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 ring-1 ring-white/0 hover:ring-white/20 transition-all">
                     <div className="absolute top-0 left-0 bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white rounded-br-xl z-10 font-mono">
                       #{index + 1}
                     </div>
                     <MoviePoster path={movie.poster_path} />
                     <button 
                        onClick={() => removeFromList('top10', movie.id)}
                        className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-xs font-mono text-white/60 hover:text-white border border-white/20 px-3 py-1 rounded-full">REMOVE</span>
                      </button>
                  </div>
               ))}
               {top10.length < 10 && (
                 <Link 
                   href="/search"
                   className="aspect-[2/3] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 hover:text-white/40 hover:bg-white/5 transition-all"
                 >
                   <Plus size={24} />
                   <span className="text-xs font-mono mt-2">ADD SLOT</span>
                 </Link>
               )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <Film size={20} className="text-blue-500" />
               Archive
            </h2>
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {watched.map((movie) => (
                 <div key={movie.id} className="group relative aspect-[2/3] bg-[#1a1a1a] rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-all grayscale hover:grayscale-0">
                    <MoviePoster path={movie.poster_path} />
                    <button 
                      onClick={() => removeFromList('watched', movie.id)}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={20} className="text-white" />
                    </button>
                 </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
