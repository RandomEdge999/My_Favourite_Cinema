import React from 'react';
import { Star } from 'lucide-react';

const RatingRing = ({ rating }) => {
  const percentage = Math.round(rating * 10);
  const color = percentage >= 70 ? 'text-emerald-400' : percentage >= 50 ? 'text-yellow-400' : 'text-rose-400';
  
  return (
    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/5">
      <span className={`text-[10px] font-bold ${color}`}>{rating.toFixed(1)}</span>
      <Star size={8} className="text-white/20" fill="currentColor" />
    </div>
  );
};

export default RatingRing;
