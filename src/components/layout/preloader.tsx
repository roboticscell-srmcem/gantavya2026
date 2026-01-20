"use client";

import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import gsap from 'gsap';
import NumberTicker from '@/components/fancy/text/basic-number-ticker';

export default function Preloader() {
  const containerRef = useRef(null);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;

    // Faster animation duration on mobile
    const counterDuration = isMobile ? 2 : 5;
    const barDuration = isMobile ? 0.8 : 1.5;
    const staggerAmount = isMobile ? 0.2 : 0.5;

    const ctx = gsap.context(() => {
      
      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          setIsAnimationComplete(true);
        }
      });

      // 1. Fade out the number text
      tl.to(".counter-text", {
        opacity: 0,
        duration: 0.3,
      })
      // 2. Animate the bars (The Video Effect)
      .to(".bar", {
        height: 0,
        duration: barDuration,
        stagger: {
          amount: staggerAmount,
        },
        ease: "power4.inOut",
      });

      // 3. Trigger the exit animation after the NumberTicker finishes
      const timer = setTimeout(() => {
        tl.play();
      }, counterDuration * 1000); 

      return () => clearTimeout(timer);

    }, containerRef);

    return () => ctx.revert();
  }, [mounted, isMobile]);

  // We only return null effectively REMOVING the component 
  // after GSAP has finished the exit animation
  if (isAnimationComplete) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] flex items-end justify-end pb-16 pr-16 pointer-events-none">
      
      {/* THE OVERLAY BARS 
        Instead of one solid background, we use 10 bars to allow the split effect.
        We use your 'bg-red-600' color here.
      */}
      <div className="absolute inset-0 flex z-[-1]">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i} 
            className="bar w-[10vw] h-[105vh] bg-black"
          ></div>
        ))}
      </div>

      {/* THE COUNTER */}
      <div className="counter-text text-white text-8xl font-bold font-space-mono tabular-nums z-10 relative">
        <NumberTicker
          from={0}
          target={100}
          transition={{
            duration: isMobile ? 2 : 5, // Faster on mobile
            type: "tween",
            ease: "easeOut",
          }}
          className={isMobile ? "text-6xl font-bold" : "text-8xl font-bold"}
        />
        <span className={isMobile ? "text-6xl" : "text-8xl"}>%</span>
      </div>
    </div>
  );
}