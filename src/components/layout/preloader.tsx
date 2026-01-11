"use client";

import React, { useState, useEffect } from 'react';
import NumberTicker from '@/components/fancy/text/basic-number-ticker';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a 7-second timer for the preloader
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-end pb-16 pr-16 bg-red-600">
      <div className="text-white text-8xl font-bold font-space-mono tabular-nums">
        <NumberTicker
          from={0}
          target={100}
          transition={{
            duration: 7,
            type: "tween",
            ease: "easeOut",
          }}
          className="text-8xl font-bold"
        />
        <span className="text-8xl">%</span>
      </div>
    </div>
  );
}
