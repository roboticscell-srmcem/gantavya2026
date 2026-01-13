"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      toggleMenu();
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 800);
    }
  };

  const handleNavClick = (link: string) => {
    if (link === 'Home') {
      toggleMenu();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 800);
    } else if (link === 'About Us') {
      scrollToSection('about');
    } else if (link === 'Past Events') {
      scrollToSection('gallery');
    } else if (link === 'Sponsors') {
      scrollToSection('sponsors');
    }
  };

  return (
    <div ref={containerRef} className="relative text-white">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-screen flex justify-between items-center p-4 sm:p-6 md:p-8 z-[100] pointer-events-none bg-gradient-to-b from-black/80 via-black/40 to-transparent mx-auto">
        <Link href="/" className="logo pointer-events-auto w-14 h-14 sm:w-18 sm:h-18 cursor-pointer">
          <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
        </Link>
        
        <div 
          className="toggle-btn flex items-center gap-2 sm:gap-4 cursor-pointer pointer-events-auto"
          onClick={toggleMenu}
        >
          <div className="nav-label h-[20px] overflow-hidden hidden md:block">
            <p className="text-xs sm:text-sm uppercase tracking-tighter font-space-mono">Menu</p>
          </div>
          <div className="hamburger w-9 h-9 sm:w-10 sm:h-10 flex flex-col items-center justify-center gap-1 border rounded-full relative transition-all duration-300">
            <span className={`w-4 sm:w-5 h-[1px] bg-white transition-all duration-500 ${isOpen ? 'rotate-45 translate-y-[2px]' : ''}`}></span>
            <span className={`w-4 sm:w-5 h-[1px] bg-white transition-all duration-500 ${isOpen ? '-rotate-45 -translate-y-[2px]' : ''}`}></span>
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
        <div ref={contentRef} className="w-full h-full flex flex-col md:flex-row p-6 sm:p-10 md:p-16 lg:p-20">
          {/* Left: Media/Image Wrapper */}
          <div className="hidden lg:flex flex-[1] items-end pb-10 overflow-hidden opacity-50">
            <img src="/menu-img.jpg" alt="Featured" className="w-2/3 grayscale object-cover aspect-[4/5]" />
          </div>

          {/* Right: Links Wrapper */}
          <div className="flex-[2] flex flex-col justify-between pt-20 sm:pt-24 md:pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
              {/* Main Links */}
              <div className="flex flex-col gap-3 sm:gap-4">
                {['Home', 'About Us', 'Past Events', 'Sponsors'].map((link) => (
                  <div key={link} className="menu-link-item overflow-hidden">
                    <p 
                      onClick={() => handleNavClick(link)}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter hover:text-[var(--color-primary)] cursor-pointer transition-all duration-300"
                    >
                      {link}
                    </p>
                  </div>
                ))}
              </div>
              {/* Secondary Links/Tags */}
              <div className="flex flex-col gap-2 pt-6 md:pt-12 text-[var(--color-text-tertiary)] uppercase text-xs tracking-widest">
                <p className="mb-4 text-[var(--color-text-secondary)]/50">Follow Us</p>
                <div className="menu-link-item overflow-hidden">
                  <a href="https://www.instagram.com/srmcem_robotics/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-cyan)] cursor-pointer transition-colors duration-300 block">Instagram</a>
                </div>
                <div className="menu-link-item overflow-hidden">
                  <a href="https://twitter.com/srmcem_robotics" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-cyan)] cursor-pointer transition-colors duration-300 block">Twitter</a>
                </div>
                <div className="menu-link-item overflow-hidden">
                  <a href="https://www.linkedin.com/company/srmcem-robotics/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-primary-cyan)] cursor-pointer transition-colors duration-300 block">LinkedIn</a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="menu-footer flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 sm:gap-0 border-t border-[var(--color-primary-cyan)]/20 pt-6 sm:pt-10 text-xs text-[var(--color-text-tertiary)] uppercase tracking-widest">
              <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 md:gap-20">
                <div><p>Location</p><p className="text-white mt-2">Lucknow, Uttar Pradesh</p><p className="text-white mt-1">India</p></div>
                <div><p>Inquiries</p><a href="mailto:hello@grobots.com" className="text-white mt-2 hover:text-[var(--color-primary-cyan)] transition-colors block">hello@grobots.com</a></div>
              </div>
              <p className="text-[10px] sm:text-xs">© 2026  SRMCEM ROBOTICS CLUB</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;