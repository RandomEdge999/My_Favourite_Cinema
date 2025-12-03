'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutGrid, Search, User as UserIcon, Settings } from 'lucide-react';
import GlassCard from './GlassCard';

const NavButton = ({ icon: Icon, active, href, onClick }) => {
  const Content = (
    <div className={`relative p-3 rounded-full transition-all duration-300 ${active ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
      <Icon size={18} strokeWidth={2} />
      {active && (
        <motion.div 
          layoutId="activeDock"
          className="absolute inset-0 border border-white/20 rounded-full"
        />
      )}
    </div>
  );

  if (onClick) {
    return <button onClick={onClick}>{Content}</button>;
  }

  return <Link href={href}>{Content}</Link>;
};

const NavBar = ({ onSettingsClick }) => {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
       <GlassCard className="flex items-center gap-1 p-1.5 rounded-full px-2">
          <NavButton icon={LayoutGrid} active={pathname === '/'} href="/" />
          <NavButton icon={Search} active={pathname === '/search'} href="/search" />
          <NavButton icon={UserIcon} active={pathname === '/profile'} href="/profile" />
          <div className="w-[1px] h-4 bg-white/10 mx-2" />
          <NavButton icon={Settings} active={false} onClick={onSettingsClick} />
       </GlassCard>
    </div>
  );
};

export default NavBar;
