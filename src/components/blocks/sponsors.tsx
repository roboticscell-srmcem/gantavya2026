import React from "react";
import Image from "next/image";

function Sponsors() {
  const sponsors = [
    {
      title: "Google",
      icon: "/sponsors/google.svg",
      href: "https://google.com",
    },
    {
      title: "NVIDIA",
      icon: "/sponsors/nvidia-wordmark-dark.svg",
      href: "https://www.nvidia.com",
    },
    {
      title: "Amazon Web Services",
      icon: "/sponsors/aws_dark.svg",
      href: "https://aws.amazon.com",
    },
    {
      title: "Microsoft",
      icon: "/sponsors/microsoft.svg",
      href: "https://www.microsoft.com",
    },
    {
      title: "OpenAI",
      icon: "/sponsors/openai_wordmark_dark.svg",
      href: "https://openai.com",
    },
    {
      title: "Meta",
      icon: "/sponsors/meta.svg",
      href: "https://about.meta.com",
    },
  ];

  return (
    <div id="sponsors" className="relative w-full min-h-screen pb-16 md:pb-26">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10"></div>

      <div className="mx-4 sm:mx-6 md:mx-8 h-20 w-auto max-w-xs text-xl sm:text-2xl flex items-center justify-center gap-2 pt-20 sm:pt-28 md:pt-34">
        <span className="bg-neutral-300 h-1 w-8 sm:w-12"></span>
        <span className="text-white flex items-center justify-center whitespace-nowrap">
          Sponsorships
        </span>
      </div>

      <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 mt-6 md:mt-8 h-auto w-auto text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter">
        <span className="text-white">Meet our partners who make </span>
        <br className="hidden sm:block" />
        <span className="text-neutral-500">exceptional events possible</span>
      </div>

      <div className="flex flex-col items-center justify-center py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {sponsors.map((item, index) => (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-900 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col gap-2 sm:gap-3 items-center justify-center hover:bg-neutral-800 transition-all duration-300 border border-neutral-800 hover:border-orange-600 hover:scale-105 aspect-video"
              >
                <div className="relative h-12 sm:h-14 md:h-16 w-full flex items-center justify-center">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={200}
                    height={64}
                    className="object-contain h-full w-auto max-w-full"
                  />
                </div>
                <div className="text-orange-400 text-base sm:text-lg md:text-xl font-semibold text-center">
                  {item.title}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20"></div>
    </div>
  );
}

export default Sponsors;