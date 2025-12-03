'use client';

import React from 'react';
import { motion } from 'framer-motion';

const SkeletonMovieGrid = () => {
    return (
        <div className="w-full">
            <div className="px-8 mb-6 h-5 w-32 bg-white/10 rounded animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10 px-8 pb-32">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="group">
                        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#1a1a1a] ring-1 ring-white/5">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 animate-pulse" />
                        </div>
                        <div className="mt-4 px-1 space-y-2">
                            <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                            <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SkeletonMovieGrid;
