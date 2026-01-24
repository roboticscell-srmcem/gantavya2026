"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Linkedin, Mail } from "lucide-react";

function Footer() {
  const socialLinks = [
    {
      icon: Instagram,
      href: "https://www.instagram.com/gantavya.fest/",
      label: "Instagram",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/company/grobots-club/",
      label: "LinkedIn",
    },
    {
      icon: Mail,
      href: "mailto:grobotsclub@gmail.com",
      label: "Email",
    },
  ];

  return (
    <footer className="main-footer relative w-full md:min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-red-900/30" />

      {/* Top Section */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-16 pt-20 sm:pt-24 md:pt-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8 border-b border-b-neutral-500 pb-6 sm:pb-8">
          {/* Social Links */}
          <div className="flex flex-col gap-4 sm:gap-6">
            <h3 className="text-xs sm:text-sm font-medium text-white/60">
              Social
            </h3>

            <div className="flex gap-3 sm:gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full border-2 border-white/30 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300"
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 lg:px-16 pb-6 mt-6">
        <div className="flex flex-col gap-2 text-xs sm:text-sm text-white/60">
          <span>© SRMCEM Robotics Club</span>

          <a
            href="#"
            className="hover:text-white transition-colors duration-300 w-fit"
          >
            Terms and Conditions
          </a>

          {/* Designer Credit */}
          <p className="text-xs text-white/40">
            Designed by{" "}
            <Link
              href="https://www.linkedin.com/in/pratyush-tiwari-cr8/"
              target="_blank"
              className="underline underline-offset-2 hover:text-white/80 transition-colors"
            >
              Pratyush Tiwari
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-8 sm:py-12 md:py-14 px-4">
        <h1 className="text-[10vw] sm:text-[9vw] md:text-[9vw] lg:text-[8vw] xl:text-[10vw] font-bold text-white tracking-tighter leading-none font-tron">
          GANTAVYA
        </h1>
      </div>
    </footer>
  );
}

export default Footer;
