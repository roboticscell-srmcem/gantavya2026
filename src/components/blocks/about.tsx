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
        start: "top 85%",
        end: "top 20%",
        scrub: true,
      },
      opacity: 0.15,
      stagger: 0.025,
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
    <section className="relative w-full min-h-screen bg-background py-16 sm:py-20 lg:py-28">
      <div
        ref={containerRef}
        className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16"
      >
        <div className="flex items-center">
          <div className="max-w-5xl">
            <p
              ref={textRef}
              className="
                text-white
                text-left
                text-xl
                sm:text-2xl
                md:text-3xl
                lg:text-4xl
                xl:text-5xl
                font-poppins
                font-semibold
                leading-snug
                tracking-tight
              "
            >
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eaque
              quasi, sed sunt vel commodi labore molestiae facere, libero quam
              optio perspiciatis unde possimus reprehenderit magni esse harum
              corporis laudantium incidunt totam accusamus eius. Sint, magni
              labore quas illum laborum reprehenderit! Explicabo molestias minima
              exercitationem laboriosam quas, impedit inventore tenetur nobis!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
