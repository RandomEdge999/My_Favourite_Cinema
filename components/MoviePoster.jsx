import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Film } from 'lucide-react';
import { IMAGE_BASE_URL } from '@/lib/tmdb';
import { cn } from '@/lib/utils';

const MoviePoster = ({ path, alt, className = "" }) => {
  const [loaded, setLoaded] = useState(false);
  const src = path ? `${IMAGE_BASE_URL}${path}` : null;

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-[#1a1a1a]", className)}>
      {src ? (
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full h-full"
        >
          <Image
            src={src}
            alt={alt || "Movie Poster"}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover"
            onLoad={() => setLoaded(true)}
            unoptimized // Optional: remove if you configure domains in next.config.js
          />
        </motion.div>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white/10">
          <Film size={24} />
        </div>
      )}
    </div>
  );
};

export default MoviePoster;
