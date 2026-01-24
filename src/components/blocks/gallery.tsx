"use client";

import React from 'react';
import Masonry from '@/components/ui/masonry';

function Gallery() {
  const items = [
    {
      id: "1",
      img: "/images/g-1.jpg",
      height: 500,
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
    // {
    //     id: "5",
    //     img: "/images/g-5.jpg",
    //     height: 500,
    // },

    // {
    //   id: "8",
    //   img: "/images/g-8.jpg",
    //   height: 350,
    // },
    {
      id: "9",
      img: "/images/g-9.jpg",
      height: 450,
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
      height: 520,
    },
    {
      id: "14",
      img: "/images/g-14.jpg",
      height: 390,
    },
    {
      id: "15",
      img: "/images/g-15.jpeg",
      height: 450,
    },
    {
      id: "16",
      img: "/images/g-16.jpg",
      height: 420,
    },
  ];

  return (
    <section id="gallery" className="relative w-full md:min-h-screen py-16 sm:py-20 md:py-24 lg:py-32 overflow-hidden">
      {/* Header Section */}
      <div className="relative z-20 mx-4 sm:mx-6 md:mx-8 lg:mx-16 mb-8 sm:mb-10 md:mb-12">
        <div className="flex items-center justify-start gap-4 sm:gap-6 mb-6 sm:mb-8">
          <span className="bg-neutral-300 h-1 w-8 sm:w-12"></span>
          <span className="text-white text-base sm:text-lg md:text-xl tracking-tight">Gallery</span>
        </div>

        <div className="max-w-4xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight text-justify">
            <span className="text-white">Moments from our </span>
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
