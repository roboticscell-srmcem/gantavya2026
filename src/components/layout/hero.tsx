'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Aurora from '@/components/ui/aurora';

// Lazy load GridScan only on desktop
const GridScan = dynamic(
  () => import('@/components/gridscan/GridScan').then(mod => mod.GridScan),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black" /> }
);

export default function Hero() {
  const [isMobile, setIsMobile] = useState(true); // Default to mobile to prevent flash

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 
        /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        // Check for low-end device indicators
        !!(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* GridScan Background - Only on desktop */}
      {!isMobile && (
        <div className="absolute inset-0">
          <GridScan
            sensitivity={0.55}
            lineThickness={0.8}
            linesColor="#3e658e"
            gridScale={0.1}
            scanColor="#ff9e9e"
            scanOpacity={0.4}
            enablePost
            bloomIntensity={0.6}
            chromaticAberration={0.002}
            noiseIntensity={0.01}
          />
        </div>
      )}

      {/* Aurora gradient for mobile - beautiful animated aurora effect */}
      {isMobile && (
        <div className="absolute inset-0 bg-black">
          <Aurora
            colorStops={["#3e658e", "#ff9e9e", "#3e658e"]}
            blend={0.5}
            amplitude={1.0}
            speed={1.0}
          />
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="px-4 sm:px-6 md:px-8 text-center pointer-events-auto">
          {/* Title + X */}
          <div className="relative flex items-center justify-center">
            <h1 className="text-[10vw] sm:text-[9vw] md:text-[9vw] lg:text-[8vw] xl:text-[10vw] font-bold text-white tracking-tighter leading-none font-tron">
              GANTAVYA
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 md:mt-6 text-xs sm:text-sm md:text-base lg:text-lg font-bricolage tracking-[0.25em] sm:tracking-[0.35em] uppercase text-white/70">
            DECATRON · Celebrating 10 Years
          </p>

          {/* CTA */}
          <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center">
            <button 
              onClick={() => {
                const eventsSection = document.getElementById('events');
                if (eventsSection) {
                  eventsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="px-6 sm:px-8 py-2.5 sm:py-3 border border-white/40 text-white tracking-widest text-xs sm:text-sm
                               hover:border-orange-400 hover:text-orange-300 transition cursor-pointer"
            >
              ENTER THE GRID
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/50 text-xs tracking-widest uppercase font-bricolage">Scroll</span>
        <svg 
          className="w-5 h-5 text-white/50" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Contrast Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/70 pointer-events-none z-[1]" />
    </section>
  );
}
