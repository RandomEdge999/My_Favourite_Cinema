'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import GlassCard from './GlassCard';

const SettingsModal = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
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
            <div className="pt-4 border-t border-white/5">
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  onClose();
                }} 
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

export default SettingsModal;
