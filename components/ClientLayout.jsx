'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './AppState';
import LiquidBackground from './LiquidBackground';
import NavBar from './NavBar';
import MovieDetailModal from './MovieDetailModal';
import SettingsModal from './SettingsModal';
import AuthModal from './AuthModal';

const InnerLayout = ({ children }) => {
  const { selectedMovie, setSelectedMovie, addToTop10, addToWatched, user } = useApp();
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && pathname !== '/search') {
        e.preventDefault();
        router.push('/search');
      }
      if (e.key === 'Escape') {
        if (selectedMovie) setSelectedMovie(null);
        else if (showSettings) setShowSettings(false);
        else if (showAuth) setShowAuth(false);
        else if (pathname === '/search') router.push('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pathname, selectedMovie, showSettings, showAuth, router, setSelectedMovie]);

  const handleAuthRequest = () => {
    if (!user) {
      setShowAuth(true);
    }
  };

  return (
    <>
      <LiquidBackground />
      <main className="relative z-10 min-h-screen flex flex-col pb-24">
        <AnimatePresence mode="wait">
          <div key={pathname}>
            {children}
          </div>
        </AnimatePresence>
      </main>
      <NavBar onSettingsClick={() => setShowSettings(true)} />
      <MovieDetailModal 
        selectedMovie={selectedMovie} 
        onClose={() => setSelectedMovie(null)}
        onAddToTop10={() => user ? addToTop10(selectedMovie) : setShowAuth(true)}
        onAddToWatched={() => user ? addToWatched(selectedMovie) : setShowAuth(true)}
      />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default function ClientLayout({ children }) {
  return (
    <AppProvider>
      <InnerLayout>{children}</InnerLayout>
    </AppProvider>
  );
}
