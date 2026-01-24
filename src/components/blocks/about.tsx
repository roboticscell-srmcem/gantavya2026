"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

function About() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!textRef.current || !containerRef.current) return;

    const type = new SplitType(textRef.current, {
      types: "chars,words",
      tagName: "span",
    });

    const animation = gsap.from(type.chars, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 65%",
        end: "top 10%",
        scrub: true,
      },
      opacity: 0.15,
      stagger: 0.15,
      color: "var(--color-text-tertiary)",
      ease: "none",
    });

    return () => {
      type.revert();
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  return (
    <section id="about" className="relative w-full min-h-full py-16 sm:py-20 lg:py-28">
      <div
        ref={containerRef}
        className="mx-auto max-w-7xl px-4 sm:px-4 lg:px-6"
      >
        <div className="flex items-start justify-start">
          <div className="max-w-5xl">
            <p
              ref={textRef}
              className="
                text-white
                text-justify
                text-lg
                sm:text-xl
                md:text-2xl
                lg:text-3xl
                xl:text-4xl
                font-poppins
                font-semibold
                leading-snug
                tracking-tighter
              "
            >
              For a decade, Gantavya has been the ultimate arena where innovation meets ambition.
              Born from the vision of Robotics Club at SRMCEM Lucknow, this flagship technical fest has
              grown into a movement — uniting thousands of engineers, creators, and
              dreamers who dare to build tomorrow.
              This year, Gantavya celebrates ten years of pushing limits, breaking barriers,
              and transforming ideas into reality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
