"use client";

import React from 'react';
import Masonry from '@/components/ui/masonry';

function Gallery() {
    const items = [
        {
            id: "1",
            img: "/images/g-1.jpg",
            height: 400,
        },
        {
            id: "2",
            img: "/images/g-2.jpg",
            height: 650,
        },
        {
            id: "3",
            img: "/images/g-3.jpg",
            height: 400,
        },
        {
            id: "4",
            img: "/images/g-4.jpg",
            height: 350,
        },
        {
            id: "5",
            img: "/images/g-5.jpg",
            height: 450,
        },
        {
            id: "6",
            img: "/images/g-6.jpg",
            height: 300,
        },
        {
            id: "7",
            img: "/images/g-7.jpg",
            height: 500,
        },
        {
            id: "8",
            img: "/images/g-8.jpg",
            height: 350,
        },
        {
            id: "9",
            img: "/images/g-9.jpg",
            height: 400,
        },
        {
            id: "10",
            img: "/images/g-10.jpg",
            height: 380,
        },
        {
            id: "11",
            img: "/images/g-11.jpg",
            height: 420,
        },
        {
            id: "12",
            img: "/images/g-12.jpg",
            height: 360,
        },
        {
            id: "13",
            img: "/images/g-13.jpg",
            height: 480,
        },
        {
            id: "14",
            img: "/images/g-14.jpg",
            height: 390,
        },
        {
            id: "15",
            img: "/images/g-15.jpeg",
            height: 390,
        },
        {
            id: "16",
            img: "/images/g-16.jpg",
            height: 390,
        },
    ];

  return (
    <section id="gallery" className="relative w-full min-h-screen bg-black py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
      {/* Gradient overlays for smooth transitions */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10"></div>

      {/* Header Section */}
      <div className="relative z-20 mx-4 sm:mx-6 md:mx-8 lg:mx-16 mb-12 sm:mb-16 md:mb-20">
        <div className="flex items-center justify-start gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          <span className="bg-neutral-300 h-1 w-8 sm:w-12"></span>
          <span className="text-white text-lg sm:text-xl md:text-2xl tracking-tight">Gallery</span>
        </div>

        <div className="max-w-5xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter leading-tight">
            <span className="text-white">Moments from our </span>
            <br className="hidden sm:block" />
            <span className="text-neutral-500">Past Events</span>
          </h2>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="relative z-0 px-4 sm:px-6 md:px-8 lg:px-16">
        <div className="w-full" style={{ minHeight: '800px' }}>
          <Masonry
            items={items}
            animateFrom="random"
            scaleOnHover={true}
            hoverScale={0.98}
            blurToFocus={true}
            colorShiftOnHover={false}
            ease="power3.out"
            duration={0.6}
            stagger={0.08}
          />
        </div>
      </div>
    </section>
  );
}

export default Gallery;
