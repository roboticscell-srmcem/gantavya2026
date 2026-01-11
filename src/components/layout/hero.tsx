'use client';

import React from 'react';
import { GridScan } from '@/components/gridscan/GridScan';

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* GridScan Background */}
      <div className="absolute inset-0">
        <GridScan
          sensitivity={0.55}
          lineThickness={3.7}
          linesColor="#392e4e"
          gridScale={0.1}
          scanColor="#FF9FFC"
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <div className="px-6 text-center pointer-events-auto">
          {/* Title + X */}
          <div className="relative flex items-center justify-center gap-8">
            <h1 className="text-[14vw] md:text-[12vw] font-bold text-white tracking-tighter leading-none font-barbra-high">
              GANTAVYA
            </h1>

            {/* Anniversary X */}
            <svg
              aria-hidden="true"
              viewBox="0 0 76 76"
              className="relative -translate-x-6 md:-translate-x-12 w-28 h-28 md:w-[23rem] md:h-[23rem]
                         drop-shadow-[0_0_40px_rgba(255,100,0,0.95)]
                         animate-[anniversaryPulse_3s_ease-in-out_infinite]"
              xmlns="http://www.w3.org/2000/svg"
              xmlSpace="preserve"
            >
              <defs>
                <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE066" />
                  <stop offset="30%" stopColor="#FFB000" />
                  <stop offset="60%" stopColor="#FF4A00" />
                  <stop offset="100%" stopColor="#7A0000" />
                </linearGradient>

                <filter id="fireGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g
                transform="
                  translate(38 38)
                  rotate(-22)
                  skewX(-32)
                  skewY(14)
                  scale(1.35 0.72)
                  translate(-38 -38)
                "
              >
                <path
                  d="M 56.0143,57L 45.683,57L 39.0246,44.6245C 38.7758,44.1665 38.5156,43.3183 38.2442,42.0799L 38.1339,42.0799C 38.0095,42.6623 37.7127,43.5473 37.2433,44.7348L 30.5594,57L 20.1857,57L 32.5018,38L 21.2714,19L 31.8487,19L 37.3621,30.3915C 37.7918,31.2963 38.1763,32.365 38.5156,33.5977L 38.6259,33.5977C 38.8408,32.857 39.2394,31.7543 39.8219,30.2897L 45.8951,19L 55.4714,19L 44.0969,37.8388L 56.0143,57 Z"
                  fill="url(#fireGradient)"
                  filter="url(#fireGlow)"
                />

                <path
                  d="M 56.0143,57L 45.683,57L 39.0246,44.6245C 38.7758,44.1665 38.5156,43.3183 38.2442,42.0799L 38.1339,42.0799C 38.0095,42.6623 37.7127,43.5473 37.2433,44.7348L 30.5594,57L 20.1857,57L 32.5018,38L 21.2714,19L 31.8487,19L 37.3621,30.3915C 37.7918,31.2963 38.1763,32.365 38.5156,33.5977L 38.6259,33.5977C 38.8408,32.857 39.2394,31.7543 39.8219,30.2897L 45.8951,19L 55.4714,19L 44.0969,37.8388L 56.0143,57 Z"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
              </g>
            </svg>
          </div>

          {/* Subtitle */}
          <p className="mt-6 text-sm md:text-base tracking-[0.35em] uppercase text-white/70">
            Robotics &amp; Tech Fest · Celebrating 10 Years
          </p>

          {/* CTA */}
          <div className="mt-10 flex justify-center">
            <button className="px-8 py-3 border border-white/40 text-white tracking-widest text-sm
                               hover:border-orange-400 hover:text-orange-300 transition">
              ENTER THE GRID
            </button>
          </div>
        </div>
      </div>

      {/* Contrast Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/70 pointer-events-none z-[1]" />
    </section>
  );
}
