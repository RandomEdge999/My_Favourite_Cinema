import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence, LayoutGroup, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Search, Plus, Star, X, ChevronRight, Play, 
  Settings, LayoutGrid, List, Heart, Film, 
  MoreHorizontal, User as UserIcon, LogOut,
  Command, Terminal, Cpu
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, 
  signInWithCustomToken, signOut 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, 
  onSnapshot, deleteDoc, query, orderBy 
} from 'firebase/firestore';

// --- CONFIGURATION & UTILS ---

const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// API CONFIGURATION
const DEFAULT_API_KEY = "751caedbe7c70fbd9329753595a41eed"; // User Provided Key
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// --- COMPONENTS ---

// 1. The "Liquid" Background - Refined for OLED Blacks
const LiquidBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
    <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen animate-blob" />
    <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-900/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
    <div className="absolute bottom-[-20%] left-[20%] w-[55vw] h-[55vw] bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-4000" />
    {/* Noise Texture for that "Film Grain" feel */}
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
  </div>
);

// 2. Glass Card - More "Crystal" than "Plastic"
const GlassCard = ({ children, className = "", onClick, ...props }) => (
  <motion.div
    onClick={onClick}
    className={`
      relative overflow-hidden
      bg-[#111111]/60 backdrop-blur-2xl
      border border-white/5
      shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
      rounded-[24px]
      ${className}
    `}
    {...props}
  >
    {children}
  </motion.div>
);

// 3. Movie Poster - With "Load" state
const MoviePoster = ({ path, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const src = path ? `${IMAGE_BASE_URL}${path}` : null;

  return (
    <div className={`relative overflow-hidden bg-[#1a1a1a] ${className}`}>
      {src ? (
        <motion.img
          src={src}
          alt={alt}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          onLoad={() => setLoaded(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/10">
          <Film size={24} />
        </div>
      )}
    </div>
  );
};

// 4. Rating Ring - Minimalist
const RatingRing = ({ rating }) => {
  const percentage = Math.round(rating * 10);
  // Monochrome/minimalist color scheme option available, but sticking to subtle color for utility
  const color = percentage >= 70 ? 'text-emerald-400' : percentage >= 50 ? 'text-yellow-400' : 'text-rose-400';
  
  return (
    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5">
      <span className={`text-[10px] font-bold ${color}`}>{rating.toFixed(1)}</span>
      <Star size={8} className="text-white/20" fill="currentColor" />
    </div>
  );
};

// --- MAIN APPLICATION ---

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [tmdbKey, setTmdbKey] = useState(DEFAULT_API_KEY);
  const [showSettings, setShowSettings] = useState(false);
  
  // Data State
  const [top10, setTop10] = useState([]);
  const [watched, setWatched] = useState([]);

  // Keyboard Shortcuts (Linux Power User feel)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && view !== 'search') {
        e.preventDefault();
        setView('search');
      }
      if (e.key === 'Escape') {
        if (selectedMovie) setSelectedMovie(null);
        else if (showSettings) setShowSettings(false);
        else if (view === 'search') setView('home');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, selectedMovie, showSettings]);

  // Auth & Init
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Trending on Mount
  useEffect(() => {
    const fetchTrending = async () => {
      if (!tmdbKey) return;
      try {
        const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${tmdbKey}`);
        const data = await res.json();
        setTrendingMovies(data.results || []);
      } catch (e) {
        console.error("Failed to fetch trending", e);
      }
    };
    fetchTrending();
  }, [tmdbKey]);

  // Firestore Sync
  useEffect(() => {
    if (!user) return;
    
    const top10Ref = collection(db, 'artifacts', appId, 'users', user.uid, 'top10');
    const unsubTop10 = onSnapshot(query(top10Ref, orderBy('createdAt', 'desc')), (snapshot) => {
      setTop10(snapshot.docs.map(d => ({ docId: d.id, ...d.data() })));
    }, (err) => console.error(err));

    const watchedRef = collection(db, 'artifacts', appId, 'users', user.uid, 'watched');
    const unsubWatched = onSnapshot(query(watchedRef, orderBy('createdAt', 'desc')), (snapshot) => {
      setWatched(snapshot.docs.map(d => ({ docId: d.id, ...d.data() })));
    }, (err) => console.error(err));

    return () => {
      unsubTop10();
      unsubWatched();
    };
  }, [user]);

  // Search Logic
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`${TMDB_BASE_URL}/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error("Search failed", e);
    }
  }, [tmdbKey]);

  // Actions
  const addToTop10 = async (movie) => {
    if (!user) return;
    if (top10.length >= 10) {
      // In a real app, toast notification here
      return;
    }
    const ref = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'top10'));
    await setDoc(ref, { ...movie, createdAt: Date.now() });
    setSelectedMovie(null);
  };

  const addToWatched = async (movie) => {
    if (!user) return;
    const ref = doc(collection(db, 'artifacts', appId, 'users', user.uid, 'watched'));
    await setDoc(ref, { ...movie, createdAt: Date.now() });
    setSelectedMovie(null);
  };

  const removeFromList = async (collectionName, docId) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, collectionName, docId));
  };

  // --- SUB-COMPONENTS ---

  const MovieGrid = ({ movies, onItemClick, label }) => (
    <div className="w-full">
      {label && <h2 className="px-8 mb-6 text-sm font-medium text-white/40 uppercase tracking-widest">{label}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10 px-8 pb-32">
        {movies.map((movie) => (
          <motion.div
            key={movie.id}
            layoutId={`movie-${movie.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onItemClick(movie)}
            className="group cursor-pointer"
          >
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-[#1a1a1a] ring-1 ring-white/10 transition-shadow duration-300 group-hover:shadow-blue-900/20 group-hover:ring-white/20">
              <MoviePoster path={movie.poster_path} alt={movie.title} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <RatingRing rating={movie.vote_average} />
              </div>
            </div>
            <div className="mt-4 px-1">
              <h3 className="text-white font-medium text-sm leading-snug line-clamp-1">{movie.title}</h3>
              <p className="text-white/30 text-xs mt-1 font-mono">{movie.release_date?.split('-')[0] || 'TBA'}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  const MovieDetailModal = () => (
    <AnimatePresence>
      {selectedMovie && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMovie(null)}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            layoutId={`movie-${selectedMovie.id}`}
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col h-[92vh] md:h-auto md:max-h-[85vh] md:inset-x-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:rounded-3xl bg-[#0a0a0a] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5"
          >
             {/* Hero Header */}
             <div className="relative h-72 md:h-96 w-full shrink-0">
               <div className="absolute inset-0">
                 {selectedMovie.backdrop_path ? (
                    <img 
                      src={`${BACKDROP_BASE_URL}${selectedMovie.backdrop_path}`} 
                      className="w-full h-full object-cover opacity-50 mask-image-gradient" 
                      alt="Backdrop"
                    />
                 ) : (
                   <div className="w-full h-full bg-[#111]" />
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
               </div>
               
               <button 
                onClick={() => setSelectedMovie(null)}
                className="absolute top-6 right-6 p-2 bg-black/20 backdrop-blur-xl rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/5"
               >
                 <X size={20} />
               </button>

               <div className="absolute bottom-0 left-0 right-0 p-8 flex items-end gap-8">
                  <div className="w-32 md:w-40 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10 hidden md:block bg-[#1a1a1a]">
                     <MoviePoster path={selectedMovie.poster_path} />
                  </div>
                  <div className="flex-1 pb-2">
                    <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tighter leading-none mb-3">
                      {selectedMovie.title}
                    </h2>
                    <div className="flex items-center gap-6 text-sm font-medium text-white/50">
                      <span className="font-mono text-white/70">{selectedMovie.release_date?.split('-')[0]}</span>
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                        <span className="text-white/90">{selectedMovie.vote_average.toFixed(1)}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded border border-white/10 text-[10px] uppercase tracking-wider">Movie</span>
                    </div>
                  </div>
               </div>
             </div>

             {/* Content Body */}
             <div className="flex-1 overflow-y-auto p-8 pt-0 bg-[#0a0a0a]">
                <div className="grid md:grid-cols-[1fr_300px] gap-12">
                   <div className="space-y-6">
                      <p className="text-lg leading-relaxed text-white/80 font-light">
                        {selectedMovie.overview}
                      </p>
                      
                      {/* Action Chips */}
                      <div className="flex flex-wrap gap-3 pt-4">
                        <button 
                          onClick={() => addToTop10(selectedMovie)}
                          className="flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
                        >
                          <Star size={18} className="fill-current" />
                          <span>Add to Top 10</span>
                        </button>
                        <button 
                          onClick={() => addToWatched(selectedMovie)}
                          className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                        >
                          <Film size={18} />
                          <span>Mark Watched</span>
                        </button>
                      </div>
                   </div>

                   {/* Metadata Column (Linux feel) */}
                   <div className="space-y-6 pt-2">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 font-mono text-xs text-white/60 space-y-3">
                         <div className="flex justify-between border-b border-white/5 pb-2">
                           <span>ID</span>
                           <span className="text-white">{selectedMovie.id}</span>
                         </div>
                         <div className="flex justify-between border-b border-white/5 pb-2">
                           <span>Language</span>
                           <span className="text-white uppercase">{selectedMovie.original_language}</span>
                         </div>
                         <div className="flex justify-between">
                           <span>Popularity</span>
                           <span className="text-white">{Math.round(selectedMovie.popularity)}</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // --- VIEWS ---

  const HomeView = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32"
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

      <MovieGrid 
        movies={trendingMovies.length > 0 ? trendingMovies : []} 
        onItemClick={setSelectedMovie} 
        label="Global Trending"
      />
    </motion.div>
  );

  const SearchView = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      className="pt-8 px-4 md:px-12 h-screen flex flex-col"
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

  const ProfileView = () => (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="pt-28 px-8 pb-32 max-w-7xl mx-auto"
    >
      <div className="flex items-end justify-between mb-16 border-b border-white/5 pb-8">
         <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white font-mono">
              {user?.uid?.slice(0,2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Personal Index</h1>
              <p className="text-white/40 font-mono text-sm mt-1">ID: {user?.uid}</p>
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
                <div key={movie.docId} className="group relative aspect-[2/3] bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/5 ring-1 ring-white/0 hover:ring-white/20 transition-all">
                   <div className="absolute top-0 left-0 bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-white rounded-br-xl z-10 font-mono">
                     #{index + 1}
                   </div>
                   <MoviePoster path={movie.poster_path} />
                   <button 
                      onClick={() => removeFromList('top10', movie.docId)}
                      className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="text-xs font-mono text-white/60 hover:text-white border border-white/20 px-3 py-1 rounded-full">REMOVE</span>
                    </button>
                </div>
             ))}
             {top10.length < 10 && (
               <button 
                 onClick={() => setView('search')}
                 className="aspect-[2/3] rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-white/20 hover:text-white/40 hover:bg-white/5 transition-all"
               >
                 <Plus size={24} />
                 <span className="text-xs font-mono mt-2">ADD SLOT</span>
               </button>
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
               <div key={movie.docId} className="group relative aspect-[2/3] bg-[#1a1a1a] rounded-lg overflow-hidden opacity-60 hover:opacity-100 transition-all grayscale hover:grayscale-0">
                  <MoviePoster path={movie.poster_path} />
                  <button 
                    onClick={() => removeFromList('watched', movie.docId)}
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
  );

  // --- DOCK ---
  
  const NavBar = () => (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
       <GlassCard className="flex items-center gap-1 p-1.5 rounded-full px-2">
          <NavButton icon={LayoutGrid} active={view === 'home'} onClick={() => setView('home')} />
          <NavButton icon={Search} active={view === 'search'} onClick={() => setView('search')} />
          <NavButton icon={UserIcon} active={view === 'profile'} onClick={() => setView('profile')} />
          <div className="w-[1px] h-4 bg-white/10 mx-2" />
          <NavButton icon={Settings} active={showSettings} onClick={() => setShowSettings(true)} />
       </GlassCard>
    </div>
  );

  const NavButton = ({ icon: Icon, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`relative p-3 rounded-full transition-all duration-300 ${active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
    >
      <Icon size={18} strokeWidth={2} />
      {active && (
        <motion.div 
          layoutId="activeDock"
          className="absolute inset-0 border border-white/20 rounded-full"
        />
      )}
    </button>
  );

  const SettingsModal = () => (
    <AnimatePresence>
      {showSettings && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowSettings(false)}
        >
          <GlassCard 
            className="w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings size={18} />
                System Config
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono font-medium text-white/40 uppercase tracking-widest mb-2 block">API Gateway</label>
                <input 
                  type="text" 
                  value={tmdbKey}
                  onChange={(e) => setTmdbKey(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white/80 font-mono text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>
              
              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={() => signOut(auth)} 
                  className="w-full py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Disconnect Session
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (loading) return null;

  return (
    <div className="relative min-h-screen w-full bg-black text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
       <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .mask-image-gradient { mask-image: linear-gradient(to bottom, black 50%, transparent 100%); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

       <LiquidBackground />
       
       <div className="relative z-10 min-h-screen flex flex-col">
          <main className="flex-1">
             <AnimatePresence mode="wait">
               {view === 'home' && <HomeView key="home" />}
               {view === 'search' && <SearchView key="search" />}
               {view === 'profile' && <ProfileView key="profile" />}
             </AnimatePresence>
          </main>
          
          <NavBar />
          <MovieDetailModal />
          <SettingsModal />
       </div>
    </div>
  );
}