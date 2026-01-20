"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Instagram, Linkedin, Mail } from 'lucide-react';

function Footer() {
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const navItems = [
    { label: 'About', href: '#about' },
    { label: 'Events', href: '#events' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Sponsors', href: '#sponsors' },
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/gantavya.fest/', label: 'Instagram' },
    { icon: Linkedin, href: 'https://www.linkedin.com/company/grobots-club/', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:grobotsclub@gmail.com', label: 'Email' },
  ];

  return (
    <footer className='main-footer relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col'>      
      {/* Gradient Background Effect */}
      <div className='absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-red-900/30' />
      
      {/* Top Section - Social + Nav */}
      <div className='relative z-10 px-4 sm:px-6 md:px-8 lg:px-16 pt-20 sm:pt-24 md:pt-32'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 border-b border-b-neutral-500 pb-6 sm:pb-8'>
          {/* Social Links */}
          <div className='flex flex-col gap-4 sm:gap-6'>
            <h3 className='text-xs sm:text-sm font-medium text-white/60'>Social</h3>
            <div className='flex gap-3 sm:gap-4'>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className='w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300'
                >
                  <social.icon className='w-4 h-4 sm:w-5 sm:h-5' />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Pills */}
          <div className='flex flex-wrap gap-2 sm:gap-3'>
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => scrollToSection(item.href.substring(1))}
                onMouseEnter={() => setHoveredNav(index)}
                onMouseLeave={() => setHoveredNav(null)}
                className='relative text-white px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-xs sm:text-sm font-medium overflow-hidden group cursor-pointer'
              >
                <span 
                  className={`absolute inset-0 bg-orange-600 rounded-full transition-transform duration-150 ease-out ${
                    hoveredNav === index 
                      ? 'translate-y-0' 
                      : 'translate-y-full'
                  }`}
                />
                <span className='relative z-10'>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Section - Copyright */}
      <div className='relative z-10 px-4 sm:px-6 md:px-8 lg:px-16 pb-4 mt-4 sm:mt-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/60'>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 md:gap-8 text-md font-semibold'>
            <span>All copyrights @SRMCEM Robotics Club</span>
            <a href='#' className='hover:text-white transition-colors duration-300'>
              Terms and Conditions
            </a>
          </div>

          <Link href="https://www.linkedin.com/in/pratyush-tiwari-cr8/" target="_blank" className='hover:text-white transition-colors duration-300'>
            <div className='text-md sm:text-md font-semibold underline'>
              Designed By Pratyush Tiwari
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Section - Large Text */}
      <div className='relative z-10 flex-1 flex items-center justify-center py-8 sm:py-12 md:py-14 px-4'>
        <h2 
          className='text-[18vw] sm:text-[15vw] md:text-[17vw] lg:text-[19vw] mx-2 font-bold tracking-tighter leading-none font-barbra-high text-center'
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.4) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 80px rgba(255,255,255,0.1)'
          }}
        >
          GANTAVYA
        </h2>
      </div>
    </footer>
  );
}

export default Footer;