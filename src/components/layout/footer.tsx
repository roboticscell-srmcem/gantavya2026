"use client";

import React, { useState } from 'react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

function Footer() {
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);

  const navItems = [
    { label: 'Speakers', href: '/speakers' },
    { label: 'Agenda', href: '/agenda' },
    { label: 'Venue', href: '/venue' },
    { label: 'Contact', href: '/contact' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
  ];

  return (
    <footer className='relative w-full min-h-screen bg-black text-white overflow-hidden flex flex-col'>      
      {/* Gradient Background Effect */}
      <div className='absolute inset-0 bg-gradient-to-b from-black via-blue-950/20 to-blue-900/30' />
      
      {/* Top Section - Social + Nav */}
      <div className='relative z-10 px-8 lg:px-16 pt-32'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-b-neutral-500 pb-8'>
          {/* Social Links */}
          <div className='flex flex-col gap-6'>
            <h3 className='text-sm font-medium text-white/60'>Social</h3>
            <div className='flex gap-4'>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className='w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300'
                >
                  <social.icon className='w-5 h-5' />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Pills */}
          <div className='flex flex-wrap gap-3'>
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                onMouseEnter={() => setHoveredNav(index)}
                onMouseLeave={() => setHoveredNav(null)}
                className='relative text-white px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 text-sm font-medium overflow-hidden group'
              >
                <span 
                  className={`absolute inset-0 bg-blue-700 rounded-full transition-transform duration-150 ease-out ${
                    hoveredNav === index 
                      ? 'translate-y-0' 
                      : 'translate-y-full'
                  }`}
                />
                <span className='relative z-10'>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Middle Section - Copyright */}
      <div className='relative z-10 px-8 lg:px-16 pb-4 mt-6'>
        <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm text-white/60'>
          <div className='flex flex-col md:flex-row gap-4 md:gap-8'>
            <span>All copyrights @SRMCEM Robotics Club</span>
            <a href='#' className='hover:text-white transition-colors duration-300'>
              Terms and Conditions
            </a>
          </div>
          
          <div>
            Designed By Pratyush Tiwari
          </div>
        </div>
      </div>

      {/* Bottom Section - Large Text */}
      <div className='relative z-10 flex-1 flex items-center justify-center py-14'>
        <h2 
          className='text-[9vw] md:text-[17vw] lg:text-[19vw] mx-2 font-bold tracking-tighter leading-none font-barbra-high text-center'
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