import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const GlassCard = ({ children, className = "", onClick, ...props }) => (
  <motion.div
    onClick={onClick}
    className={cn(
      "relative overflow-hidden bg-[#111111]/60 backdrop-blur-2xl border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] rounded-[24px]",
      className
    )}
    {...props}
  >
    {children}
  </motion.div>
);

export default GlassCard;
