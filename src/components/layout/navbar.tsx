"use client";

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Smooth Scroll (Lenis)
  useEffect(() => {
    lenisRef.current = new Lenis();
    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenisRef.current?.destroy();
  }, []);

  useGSAP(() => {
    // Initial States
    gsap.set(overlayRef.current, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
      opacity: 0,
    });
    gsap.set('.menu-link-item p', { y: 60, opacity: 0 });
    gsap.set(contentRef.current, { y: -50, opacity: 0 });
    gsap.set('.menu-footer', { y: 30, opacity: 0 });

    tl.current = gsap.timeline({ paused: true })
      .to('.nav-label p', { y: -40, duration: 0.4, ease: 'power3.inOut' })
      .to(overlayRef.current, {
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        opacity: 1,
        duration: 0.8,
        ease: 'expo.inOut',
      }, 0)
      .to(contentRef.current, { 
        y: 0, 
        opacity: 1,
        duration: 0.7, 
        ease: 'power3.out' 
      }, 0.2)
      .to('.menu-link-item p', {
        y: 0,
        opacity: 1,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
      }, 0.3)
      .to('.menu-footer', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, 0.5);
  }, { scope: containerRef });

  const toggleMenu = () => {
    if (isOpen) {
      tl.current?.reverse();
      lenisRef.current?.start();
    } else {
      tl.current?.play();
      lenisRef.current?.stop();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div ref={containerRef} className="relative text-white font-inter">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center p-8 z-[100] pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent mx-auto">
        <div className="logo pointer-events-auto w-12 h-12">
          <img src="/vercel.svg" alt="Logo" className="w-full h-full object-contain" />
        </div>
        
        <div 
          className="toggle-btn flex items-center gap-4 cursor-pointer pointer-events-auto"
          onClick={toggleMenu}
        >
          <div className="nav-label h-[20px] overflow-hidden hidden md:block">
            <p className="text-sm uppercase tracking-tighter font-space-mono">Menu</p>
          </div>
          <div className="hamburger w-10 h-10 flex flex-col items-center justify-center gap-1 border border-[var(--color-primary-cyan)]/30 rounded-full relative hover:border-[var(--color-primary-cyan)]/60 hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all duration-300">
            <span className={`w-5 h-[1px] bg-[var(--color-primary-cyan)] transition-all duration-500 ${isOpen ? 'rotate-45 translate-y-[2px]' : ''}`}></span>
            <span className={`w-5 h-[1px] bg-[var(--color-primary-cyan)] transition-all duration-500 ${isOpen ? '-rotate-45 -translate-y-[2px]' : ''}`}></span>
          </div>
        </div>
      </nav>

      {/* Menu Overlay */}
      <div 
        ref={overlayRef}
        className="fixed top-0 left-0 w-full h-screen bg-[var(--color-bg-slate)] backdrop-blur-xl z-[90] overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--color-bg-slate) 0%, var(--color-bg-charcoal) 50%, var(--color-bg-black) 100%)'
        }}
      >
        <div ref={contentRef} className="w-full h-full flex flex-col md:flex-row p-8 md:p-20">
          {/* Left: Media/Image Wrapper */}
          <div className="hidden md:flex flex-[1] items-end pb-10 overflow-hidden opacity-50">
            <img src="/menu-img.jpg" alt="Featured" className="w-2/3 grayscale object-cover aspect-[4/5]" />
          </div>

          {/* Right: Links Wrapper */}
          <div className="flex-[2] flex flex-col justify-between pt-24 md:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Main Links */}
              <div className="flex flex-col gap-4">
                {['Home', 'About Us', 'Past Events', 'Sponsors'].map((link) => (
                  <div key={link} className="menu-link-item overflow-hidden">
                    <p className="text-5xl md:text-7xl font-inter font-bold tracking-tighter hover:text-[var(--color-primary-orange)] hover:drop-shadow-[0_0_15px_rgba(255,69,0,0.5)] cursor-pointer transition-all duration-300">
                      {link}
                    </p>
                  </div>
                ))}
              </div>
              {/* Secondary Links/Tags */}
              <div className="flex flex-col gap-2 pt-4 md:pt-12 text-[var(--color-text-tertiary)] uppercase text-xs tracking-widest">
                <p className="mb-4 text-[var(--color-text-secondary)]/50">Follow Us</p>
                <div className="menu-link-item overflow-hidden"><p className="hover:text-[var(--color-primary-cyan)] cursor-pointer transition-colors duration-300">Instagram</p></div>
                <div className="menu-link-item overflow-hidden"><p className="hover:text-[var(--color-primary-cyan)] cursor-pointer transition-colors duration-300">Twitter</p></div>
                <div className="menu-link-item overflow-hidden"><p className="hover:text-[var(--color-primary-cyan)] cursor-pointer transition-colors duration-300">LinkedIn</p></div>
              </div>
            </div>

            {/* Footer */}
            <div className="menu-footer flex justify-between items-end border-t border-[var(--color-primary-cyan)]/20 pt-10 text-xs text-[var(--color-text-tertiary)] uppercase tracking-widest">
              <div className="flex gap-20">
                <div><p>Location</p><p className="text-white mt-2">Lucknow, Uttar Pradesh</p><br/><p className="text-white mt-2">India</p></div>
                <div><p>Inquiries</p><p className="text-white mt-2">hello@codegrid.com</p></div>
              </div>
              <p>© 2026  SRMCEM ROBOTICS CLUB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;