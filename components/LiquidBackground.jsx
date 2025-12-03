import React from 'react';

const LiquidBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none">
    <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen animate-blob will-change-transform" />
    <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-900/10 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000 will-change-transform" />
    <div className="absolute bottom-[-20%] left-[20%] w-[55vw] h-[55vw] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-4000 will-change-transform" />
    {/* Noise Texture for that "Film Grain" feel */}
    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
  </div>
);

export default LiquidBackground;
