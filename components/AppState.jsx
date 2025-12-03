'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [top10, setTop10] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch lists when user changes
  useEffect(() => {
    if (!user) {
      setTop10([]);
      setWatched([]);
      return;
    }

    const fetchLists = async () => {
      const { data: top10Data } = await supabase
        .from('top10')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (top10Data) setTop10(top10Data);

      const { data: watchedData } = await supabase
        .from('watched')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (watchedData) setWatched(watchedData);
    };

    fetchLists();
    
    // Realtime subscription could go here
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          // Simple re-fetch for now or handle payload
          fetchLists();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [user]);

  const addToTop10 = async (movie) => {
    if (!user) return alert("Please login first");
    if (top10.length >= 10) return alert("Top 10 is full!");

    const { error } = await supabase.from('top10').insert({
      user_id: user.id,
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      overview: movie.overview
    });

    if (error) console.error(error);
    setSelectedMovie(null);
  };

  const addToWatched = async (movie) => {
    if (!user) return alert("Please login first");

    const { error } = await supabase.from('watched').insert({
      user_id: user.id,
      movie_id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      backdrop_path: movie.backdrop_path,
      vote_average: movie.vote_average,
      release_date: movie.release_date,
      overview: movie.overview
    });

    if (error) console.error(error);
    setSelectedMovie(null);
  };

  const removeFromList = async (table, id) => {
    if (!user) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) console.error(error);
  };

  return (
    <AppContext.Provider value={{
      user,
      loading,
      selectedMovie,
      setSelectedMovie,
      top10,
      watched,
      addToTop10,
      addToWatched,
      removeFromList
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
