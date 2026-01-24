"use client";

import React from 'react';

interface BackgroundBlobsProps {
  className?: string;
}

export function BackgroundBlobs({ className = '' }: BackgroundBlobsProps) {
  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
      {/* Top Left - Orange/Red gradient blob */}
      <div 
        className="absolute -top-40 -left-40 w-96 h-96 bg-linear-to-br from-orange-600/20 via-red-500/15 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      
      {/* Top Right - Purple/Blue gradient blob */}
      <div 
        className="absolute -top-20 -right-32 w-80 h-80 bg-linear-to-bl from-purple-600/15 via-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      />
      
      {/* Middle Left - Teal/Cyan gradient blob */}
      <div 
        className="absolute top-1/3 -left-20 w-72 h-72 bg-linear-to-r from-teal-500/15 via-cyan-400/10 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '12s', animationDelay: '4s' }}
      />
      
      {/* Middle Right - Pink/Magenta gradient blob */}
      <div 
        className="absolute top-1/2 -right-24 w-64 h-64 bg-linear-to-l from-pink-500/15 via-fuchsia-400/10 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '9s', animationDelay: '1s' }}
      />
      
      {/* Bottom Left - Yellow/Orange gradient blob */}
      <div 
        className="absolute bottom-1/4 -left-32 w-80 h-80 bg-linear-to-tr from-yellow-500/10 via-orange-400/15 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '11s', animationDelay: '3s' }}
      />
      
      {/* Bottom Right - Blue/Indigo gradient blob */}
      <div 
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-linear-to-tl from-blue-600/20 via-indigo-500/15 to-transparent rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '5s' }}
      />
      
      {/* Center - Subtle warm glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-radial from-orange-500/18 via-transparent to-transparent rounded-full blur-3xl"
      />
    </div>
  );
}

export default BackgroundBlobs;
